import { deflate, inflate } from 'pako';

/**
 * Utilitaires pour compacter et décompacter les descriptions SDP WebRTC
 * afin de les faire tenir aisément dans un QR code direct sans serveur de signalement.
 */

export interface P2PSignalingMessage {
  type: 'offer' | 'answer';
  sdp: string;
  secret: string; // Clé de chiffrement AES partagée
  senderName: string;
  cityName: string;
}

/**
 * Compresse un objet de signalement en une chaîne compacte Base64
 */
export function compressSignalingMessage(msg: P2PSignalingMessage): string {
  const jsonStr = JSON.stringify(msg);
  const compressed = deflate(jsonStr, { level: 9 });
  
  // Conversion Uint8Array vers Base64
  let binary = '';
  const len = compressed.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  return 'PL1_' + window.btoa(binary); // "PL1_" prefix for ProxiLien v1
}

/**
 * Décompresse une chaîne issue d'un QR code ou saisie manuelle
 */
export function decompressSignalingMessage(encoded: string): P2PSignalingMessage {
  let raw = encoded.trim();
  if (raw.startsWith('PL1_')) {
    raw = raw.substring(4);
  }

  // Tenter décodage compressé pako
  try {
    const binary = window.atob(raw);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const decompressedBytes = inflate(bytes);
    const decompressed = new TextDecoder().decode(decompressedBytes);
    return JSON.parse(decompressed) as P2PSignalingMessage;
  } catch (err) {
    // Fallback JSON direct si ce n'est pas compressé
    try {
      const decodedJson = window.atob(raw);
      return JSON.parse(decodedJson) as P2PSignalingMessage;
    } catch {
      return JSON.parse(raw) as P2PSignalingMessage;
    }
  }
}
