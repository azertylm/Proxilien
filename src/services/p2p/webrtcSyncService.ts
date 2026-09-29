import { CivicCardsSyncPayload, CitizenAlert, P2PConnectionStatus } from '../../types';
import { P2PCryptoService, EncryptedEnvelope } from './cryptoService';
import { 
  compressSignalingMessage, 
  decompressSignalingMessage, 
  P2PSignalingMessage 
} from './sdpCompression';

export interface P2PLogEntry {
  id: string;
  time: string;
  type: 'info' | 'success' | 'warn' | 'error' | 'crypto';
  text: string;
}

export interface P2PStats {
  bytesSent: number;
  bytesReceived: number;
  packetsSent: number;
  packetsReceived: number;
  latencyMs: number;
  fingerprint: string;
  iceState: string;
}

const CHUNK_SIZE = 14 * 1024; // 14 Ko pour respecter la limite MTU RTCDataChannel de 16 Ko

interface MessageChunk {
  _chunk: true;
  id: string;
  index: number;
  total: number;
  data: string;
}

export class WebRTCSyncNode {
  private pc: RTCPeerConnection | null = null;
  private dataChannel: RTCDataChannel | null = null;
  private crypto: P2PCryptoService;
  private status: P2PConnectionStatus = 'idle';
  private localBroadcast: BroadcastChannel | null = null;
  
  // Reconstitution des paquets fragmentés
  private incomingChunks: Map<string, { total: number; chunks: Map<number, string> }> = new Map();

  // Callbacks
  private onStatusChangeCallbacks: Array<(status: P2PConnectionStatus) => void> = [];
  private onLogCallbacks: Array<(log: P2PLogEntry) => void> = [];
  private onPayloadReceivedCallbacks: Array<(payload: CivicCardsSyncPayload) => void> = [];
  private onAlertReceivedCallbacks: Array<(alert: CitizenAlert) => void> = [];
  private onStatsCallbacks: Array<(stats: P2PStats) => void> = [];

  private stats: P2PStats = {
    bytesSent: 0,
    bytesReceived: 0,
    packetsSent: 0,
    packetsReceived: 0,
    latencyMs: 0,
    fingerprint: 'Attente...',
    iceState: 'new',
  };

  private pingInterval: any = null;
  private isOfferer: boolean = false;
  private sharedSecret: string = '';

  constructor() {
    this.crypto = new P2PCryptoService();
    this.initLocalBroadcast();
  }

  private initLocalBroadcast() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.localBroadcast = new BroadcastChannel('proxilien_local_mesh_signaling');
        this.localBroadcast.onmessage = (event) => {
          this.handleLocalBroadcastMessage(event.data);
        };
      } catch (err) {
        console.warn('BroadcastChannel non disponible', err);
      }
    }
  }

  private log(type: P2PLogEntry['type'], text: string) {
    const entry: P2PLogEntry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type,
      text,
    };
    this.onLogCallbacks.forEach(cb => cb(entry));
  }

  private setStatus(newStatus: P2PConnectionStatus) {
    this.status = newStatus;
    this.onStatusChangeCallbacks.forEach(cb => cb(newStatus));
  }

  getStatus(): P2PConnectionStatus {
    return this.status;
  }

  getStats(): P2PStats {
    return { ...this.stats };
  }

  onStatusChange(cb: (status: P2PConnectionStatus) => void) {
    this.onStatusChangeCallbacks.push(cb);
  }

  onLog(cb: (log: P2PLogEntry) => void) {
    this.onLogCallbacks.push(cb);
  }

  onPayloadReceived(cb: (payload: CivicCardsSyncPayload) => void) {
    this.onPayloadReceivedCallbacks.push(cb);
  }

  onAlertReceived(cb: (alert: CitizenAlert) => void) {
    this.onAlertReceivedCallbacks.push(cb);
  }

  onStats(cb: (stats: P2PStats) => void) {
    this.onStatsCallbacks.push(cb);
  }

  /**
   * Crée une nouvelle RTCPeerConnection configurée pour un fonctionnement LAN / sans serveur central
   */
  private createPeerConnection(): RTCPeerConnection {
    this.destroyConnection();

    const config: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
      iceCandidatePoolSize: 2,
    };

    const pc = new RTCPeerConnection(config);
    this.pc = pc;

    pc.oniceconnectionstatechange = () => {
      this.stats.iceState = pc.iceConnectionState;
      this.log('info', `État ICE : ${pc.iceConnectionState}`);
      this.notifyStats();

      if (pc.iceConnectionState === 'connected') {
        this.setStatus('connected');
        this.log('success', 'Liaison P2P WebRTC établie avec succès');
      } else if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
        this.setStatus('disconnected');
        this.log('warn', 'Connexion P2P interrompue');
      }
    };

    pc.ondatachannel = (event) => {
      this.log('info', `Canal de données distant détecté : ${event.channel.label}`);
      this.setupDataChannel(event.channel);
    };

    return pc;
  }

  /**
   * Initialise les écouteurs sur le RTCDataChannel
   */
  private setupDataChannel(channel: RTCDataChannel) {
    this.dataChannel = channel;
    channel.binaryType = 'arraybuffer';

    channel.onopen = () => {
      this.setStatus('connected');
      this.log('success', 'RTCDataChannel "proxilien_sync" ouvert et prêt');
      this.startHeartbeat();
    };

    channel.onclose = () => {
      this.setStatus('disconnected');
      this.log('warn', 'RTCDataChannel fermé');
      this.stopHeartbeat();
    };

    channel.onerror = (err) => {
      this.log('error', `Erreur canal de données : ${err}`);
    };

    channel.onmessage = (event) => {
      this.handleIncomingRawMessage(event.data);
    };
  }

  /**
   * Émetteur (Pair A) : Crée l'offre SDP et génère la chaîne pour le QR Code
   */
  async createOfferForQR(senderName: string, cityName: string): Promise<string> {
    this.isOfferer = true;
    this.setStatus('creating_offer');
    this.log('info', 'Initialisation du noeud émetteur WebRTC...');

    // Génération de la clé de chiffrement AES-GCM
    const { secret, fingerprint } = await this.crypto.generateEphemeralKey();
    this.sharedSecret = secret;
    this.stats.fingerprint = fingerprint;
    this.notifyStats();
    this.log('crypto', `Clé éphémère AES-256 générée. Empreinte : ${fingerprint}`);

    const pc = this.createPeerConnection();

    // Création du DataChannel côté émetteur
    const channel = pc.createDataChannel('proxilien_sync', {
      ordered: true,
    });
    this.setupDataChannel(channel);

    const offer = await pc.createOffer({
      offerToReceiveAudio: false,
      offerToReceiveVideo: false,
    });
    await pc.setLocalDescription(offer);

    this.log('info', 'Collecte des candidats réseau locaux (ICE)...');
    await this.waitForIceGatheringComplete(pc);

    const fullSdp = pc.localDescription?.sdp || offer.sdp || '';
    const signalMsg: P2PSignalingMessage = {
      type: 'offer',
      sdp: fullSdp,
      secret: this.sharedSecret,
      senderName,
      cityName,
    };

    const qrData = compressSignalingMessage(signalMsg);
    this.setStatus('waiting_for_answer');
    this.log('success', `Offre P2P prête (${qrData.length} octets). Présentez le QR Code au voisin.`);
    return qrData;
  }

  /**
   * Récepteur (Pair B) : Reçoit l'offre du QR Code, génère la réponse (Answer) pour le QR code inverse
   */
  async createAnswerForQR(offerQrString: string, receiverName: string, cityName: string): Promise<string> {
    this.isOfferer = false;
    this.setStatus('creating_answer');
    this.log('info', 'Décodage de l\'offre P2P scannée...');

    const offerMsg = decompressSignalingMessage(offerQrString);
    if (offerMsg.type !== 'offer') {
      throw new Error("Le QR scanné n'est pas une offre de synchronisation valide.");
    }

    this.sharedSecret = offerMsg.secret;
    const fingerprint = await this.crypto.initializeWithSecret(offerMsg.secret);
    this.stats.fingerprint = fingerprint;
    this.notifyStats();
    this.log('crypto', `Clé AES-256 synchronisée avec l'émetteur. Empreinte mutuelle : ${fingerprint}`);

    const pc = this.createPeerConnection();

    await pc.setRemoteDescription(new RTCSessionDescription({
      type: 'offer',
      sdp: offerMsg.sdp,
    }));
    this.log('info', `Description distante de ${offerMsg.senderName} acceptée.`);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    this.log('info', 'Génération de la réponse et finalisation ICE...');
    await this.waitForIceGatheringComplete(pc);

    const answerMsg: P2PSignalingMessage = {
      type: 'answer',
      sdp: pc.localDescription?.sdp || answer.sdp || '',
      secret: this.sharedSecret,
      senderName: receiverName,
      cityName,
    };

    const answerQrData = compressSignalingMessage(answerMsg);
    this.setStatus('connecting');
    this.log('success', `Réponse générée (${answerQrData.length} octets). Présentez ce QR Code à l'émetteur.`);
    return answerQrData;
  }

  /**
   * Émetteur (Pair A) : Scanne ou saisit la réponse du Pair B pour finaliser la liaison
   */
  async applyAnswerFromQR(answerQrString: string): Promise<void> {
    if (!this.pc) {
      throw new Error("Aucune connexion en cours.");
    }

    this.log('info', 'Application de la réponse SDP du récepteur...');
    const answerMsg = decompressSignalingMessage(answerQrString);
    if (answerMsg.type !== 'answer') {
      throw new Error("Le contenu scanné n'est pas une réponse P2P valide.");
    }

    await this.pc.setRemoteDescription(new RTCSessionDescription({
      type: 'answer',
      sdp: answerMsg.sdp,
    }));

    this.setStatus('connecting');
    this.log('success', `Réponse de ${answerMsg.senderName} validée. Négociation WebRTC en cours.`);
  }

  /**
   * Attente de la fin de la collecte des candidats ICE pour inclure toutes les adresses LAN dans l'offre/réponse
   */
  private waitForIceGatheringComplete(pc: RTCPeerConnection): Promise<void> {
    return new Promise((resolve) => {
      if (pc.iceGatheringState === 'complete') {
        resolve();
        return;
      }

      const checkState = () => {
        if (pc.iceGatheringState === 'complete') {
          pc.removeEventListener('icegatheringstatechange', checkState);
          resolve();
        }
      };

      pc.addEventListener('icegatheringstatechange', checkState);

      // Timeout de sécurité (3.5 secondes max pour ne pas bloquer l'expérience utilisateur)
      setTimeout(() => {
        pc.removeEventListener('icegatheringstatechange', checkState);
        resolve();
      }, 3500);
    });
  }

  /**
   * Envoie le paquet de fiches civiques chiffré de bout en bout
   */
  async sendCivicCardsPayload(payload: CivicCardsSyncPayload): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error("Le canal WebRTC n'est pas ouvert.");
    }

    this.setStatus('syncing');
    this.log('crypto', `Chiffrement de ${payload.helpRequests.length} demandes, ${payload.toolLoans.length} prêts, ${payload.communityEvents.length} rencontres...`);

    const encryptedEnvelope = await this.crypto.encryptObject({
      type: 'CIVIC_CARDS_SYNC',
      payload,
    });

    this.log('success', `Chiffrement AES-GCM 256 terminé. Hash SHA-256 : ${encryptedEnvelope.hash.substring(0, 12)}...`);
    await this.transmitLargeString(JSON.stringify(encryptedEnvelope));
    
    this.setStatus('synced');
    this.log('success', 'Fiches civiques transmises avec succès au pair.');
  }

  /**
   * Diffuse une alerte citoyenne chiffrée en temps réel via le canal P2P
   */
  async sendCitizenAlert(alert: CitizenAlert): Promise<void> {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      throw new Error("Le canal WebRTC n'est pas ouvert.");
    }

    this.log('crypto', `Chiffrement de l'alerte citoyenne : "${alert.title}" [${alert.severity.toUpperCase()}]`);

    const encryptedEnvelope = await this.crypto.encryptObject({
      type: 'CITIZEN_ALERT_BROADCAST',
      payload: alert,
    });

    await this.transmitLargeString(JSON.stringify(encryptedEnvelope));
    this.log('success', 'Alerte citoyenne chiffrée diffusée sur le réseau local P2P.');
  }

  /**
   * Découpage et transmission de messages longs en respectant le MTU WebRTC
   */
  private async transmitLargeString(data: string): Promise<void> {
    if (!this.dataChannel) return;

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const totalLength = data.length;
    const totalChunks = Math.ceil(totalLength / CHUNK_SIZE);

    this.log('info', `Envoi de données (${(totalLength / 1024).toFixed(1)} Ko en ${totalChunks} paquets)...`);

    for (let i = 0; i < totalChunks; i++) {
      const start = i * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, totalLength);
      const chunkStr = data.substring(start, end);

      const chunk: MessageChunk = {
        _chunk: true,
        id: messageId,
        index: i,
        total: totalChunks,
        data: chunkStr,
      };

      const raw = JSON.stringify(chunk);
      this.dataChannel.send(raw);

      this.stats.bytesSent += raw.length;
      this.stats.packetsSent += 1;
      this.notifyStats();

      // Micro-pause pour ne pas engorger le buffer WebRTC sur les gros paquets
      if (totalChunks > 2 && i % 4 === 0) {
        await new Promise(r => setTimeout(r, 10));
      }
    }
  }

  /**
   * Traitement d'un fragment brut reçu sur le RTCDataChannel
   */
  private async handleIncomingRawMessage(data: string | ArrayBuffer) {
    if (typeof data !== 'string') {
      return;
    }

    this.stats.bytesReceived += data.length;
    this.stats.packetsReceived += 1;
    this.notifyStats();

    try {
      const parsed = JSON.parse(data);

      // Gestion ping/pong pour la mesure de latence
      if (parsed.type === '__ping__') {
        this.dataChannel?.send(JSON.stringify({ type: '__pong__', sentAt: parsed.sentAt }));
        return;
      }
      if (parsed.type === '__pong__') {
        this.stats.latencyMs = Math.max(1, Date.now() - parsed.sentAt);
        this.notifyStats();
        return;
      }

      // Gestion de la fragmentation de paquets
      if (parsed._chunk === true) {
        const chunk = parsed as MessageChunk;
        let tracker = this.incomingChunks.get(chunk.id);
        if (!tracker) {
          tracker = { total: chunk.total, chunks: new Map() };
          this.incomingChunks.set(chunk.id, tracker);
        }

        tracker.chunks.set(chunk.index, chunk.data);

        if (tracker.chunks.size === tracker.total) {
          // Assemblage complet
          let fullStr = '';
          for (let i = 0; i < tracker.total; i++) {
            fullStr += tracker.chunks.get(i) || '';
          }
          this.incomingChunks.delete(chunk.id);
          await this.processDecryption(fullStr);
        }
      } else {
        // Paquet unique direct
        await this.processDecryption(data);
      }
    } catch (err: any) {
      this.log('error', `Erreur traitement message entrant : ${err.message}`);
    }
  }

  /**
   * Déchiffrement et vérification cryptographique de l'enveloppe
   */
  private async processDecryption(rawEnvelopeStr: string) {
    try {
      const envelope = JSON.parse(rawEnvelopeStr) as EncryptedEnvelope;
      this.log('crypto', `Réception enveloppe chiffrée. Vérification intégrité SHA-256...`);

      const decrypted = await this.crypto.decryptEnvelope<{
        type: string;
        payload: any;
      }>(envelope);

      this.log('success', `Déchiffrement AES-GCM réussi (Empreinte ${envelope.keyFingerprint})`);

      if (decrypted.type === 'CIVIC_CARDS_SYNC') {
        const payload = decrypted.payload as CivicCardsSyncPayload;
        this.log('success', `Synchronisation validée : ${payload.helpRequests.length} demandes, ${payload.toolLoans.length} prêts, ${payload.citizenAlerts.length} alertes reçues de ${payload.senderName}.`);
        this.setStatus('synced');
        this.onPayloadReceivedCallbacks.forEach(cb => cb(payload));
      } else if (decrypted.type === 'CITIZEN_ALERT_BROADCAST') {
        const alert = decrypted.payload as CitizenAlert;
        this.log('warn', `🚨 Alerte citoyenne chiffrée reçue : "${alert.title}"`);
        this.onAlertReceivedCallbacks.forEach(cb => cb(alert));
      }
    } catch (err: any) {
      this.log('error', `Échec du déchiffrement : ${err.message}`);
    }
  }

  /**
   * Découverte et signalement local 1-clic via BroadcastChannel (pour deux terminaux/onglets sur le même réseau)
   */
  broadcastLocalDiscoveryBeacon(senderName: string, cityName: string) {
    if (!this.localBroadcast) return;
    this.log('info', 'Émission d\'une balise de découverte sur le réseau local...');
    this.localBroadcast.postMessage({
      type: 'PROXILIEN_BEACON',
      senderName,
      cityName,
      timestamp: Date.now(),
    });
  }

  private async handleLocalBroadcastMessage(data: any) {
    if (!data || typeof data !== 'object') return;
    
    // Si une balise locale est reçue et que l'utilisateur est en attente
    if (data.type === 'PROXILIEN_BEACON' && this.status === 'idle') {
      this.log('info', `Terminal voisin détecté sur le réseau local : ${data.senderName} (${data.cityName})`);
    }
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.dataChannel && this.dataChannel.readyState === 'open') {
        this.dataChannel.send(JSON.stringify({ type: '__ping__', sentAt: Date.now() }));
      }
    }, 3000);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private notifyStats() {
    this.onStatsCallbacks.forEach(cb => cb({ ...this.stats }));
  }

  destroyConnection() {
    this.stopHeartbeat();
    if (this.dataChannel) {
      try {
        this.dataChannel.close();
      } catch {}
      this.dataChannel = null;
    }
    if (this.pc) {
      try {
        this.pc.close();
      } catch {}
      this.pc = null;
    }
    this.incomingChunks.clear();
  }

  destroy() {
    this.destroyConnection();
    if (this.localBroadcast) {
      try {
        this.localBroadcast.close();
      } catch {}
    }
  }
}
