/**
 * Service de chiffrement souverain et de bout en bout (E2EE) pour ProxiLien
 * Utilise l'API standard Web Crypto (AES-GCM 256 bits + SHA-256)
 * Garantit que les fiches civiques et les alertes citoyennes ne peuvent être lues
 * que par les deux terminaux appairés sans aucun serveur central.
 */

export interface EncryptedEnvelope {
  iv: string; // Base64
  ciphertext: string; // Base64
  hash: string; // SHA-256 hex
  keyFingerprint: string; // First 8 chars of key hash
  timestamp: number;
}

export class P2PCryptoService {
  private cryptoKey: CryptoKey | null = null;
  private keyFingerprint: string = 'NON_INITIALISÉ';

  /**
   * Initialise une clé éphémère AES-GCM 256 bits ou dérive depuis un secret partagé (ex: code QR)
   */
  async initializeWithSecret(secretPhrase: string): Promise<string> {
    const encoder = new TextEncoder();
    const secretData = encoder.encode(secretPhrase);

    // Dériver une clé 256 bits via SHA-256
    const keyMaterial = await window.crypto.subtle.digest('SHA-256', secretData);
    
    this.cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      keyMaterial,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt']
    );

    // Empreinte visuelle pour vérification mutuelle (ex: "8492-AF20")
    const hashArray = Array.from(new Uint8Array(keyMaterial));
    const hex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    this.keyFingerprint = `${hex.substring(0, 4)}-${hex.substring(4, 8)}`;
    return this.keyFingerprint;
  }

  /**
   * Génère une clé de session aléatoire haute sécurité
   */
  async generateEphemeralKey(): Promise<{ secret: string; fingerprint: string }> {
    const randomBytes = new Uint8Array(24);
    window.crypto.getRandomValues(randomBytes);
    const secret = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
    const fingerprint = await this.initializeWithSecret(secret);
    return { secret, fingerprint };
  }

  getFingerprint(): string {
    return this.keyFingerprint;
  }

  /**
   * Chiffre un objet arbitraire en AES-GCM 256 bits
   */
  async encryptObject<T>(data: T): Promise<EncryptedEnvelope> {
    if (!this.cryptoKey) {
      throw new Error("Clé de chiffrement non initialisée");
    }

    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(jsonString);

    // IV 12 octets aléatoires recommandés pour AES-GCM
    const iv = new Uint8Array(12);
    window.crypto.getRandomValues(iv);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv,
      },
      this.cryptoKey,
      encodedData
    );

    // Calcul du hash d'intégrité SHA-256 du texte chiffré
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', encryptedBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return {
      iv: this.uint8ArrayToBase64(iv),
      ciphertext: this.uint8ArrayToBase64(new Uint8Array(encryptedBuffer)),
      hash: hashHex,
      keyFingerprint: this.keyFingerprint,
      timestamp: Date.now(),
    };
  }

  /**
   * Déchiffre une enveloppe chiffrée et vérifie l'intégrité
   */
  async decryptEnvelope<T>(envelope: EncryptedEnvelope): Promise<T> {
    if (!this.cryptoKey) {
      throw new Error("Clé de chiffrement non initialisée");
    }

    const iv = this.base64ToUint8Array(envelope.iv);
    const ciphertext = this.base64ToUint8Array(envelope.ciphertext);

    // 1. Vérification d'intégrité SHA-256
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', ciphertext as BufferSource);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const computedHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (computedHash !== envelope.hash) {
      throw new Error("Échec d'intégrité : Le contenu chiffré a été altéré ou corrompu.");
    }

    // 2. Déchiffrement AES-GCM
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as BufferSource,
      },
      this.cryptoKey,
      ciphertext as BufferSource
    );

    const decoder = new TextDecoder();
    const jsonString = decoder.decode(decryptedBuffer);
    return JSON.parse(jsonString) as T;
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
}
