/**
 * Service Client d'Abstraction IA Souveraine ALPHABETTE
 * Design Pattern : Strategy & Provider Pattern
 * 
 * L'ensemble du code applicatif appelle `askAI(prompt, options)`.
 * Aucune clé secrète n'est exposée côté client. Les requêtes sont relayées
 * au serveur Express qui orchestre :
 *  - Phase 1 : Google Gemini (Prototypage actif)
 *  - Phase 2 : Moteur Local Souverain (Machine dédiée Ollama/vLLM)
 *  - Phase 3 : Secours Cloud Européen (Mistral AI France - Basculement automatique en < 3.5s)
 */

export type ClientAIProvider = 'gemini' | 'hybrid_mistral' | 'local_only' | 'cloud_mistral' | 'auto';

export interface AskAIOptions {
  systemInstruction?: string;
  provider?: ClientAIProvider;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
  text: string;
  providerUsed: 'gemini' | 'local_mistral' | 'cloud_mistral' | 'mock_fallback';
  sovereign: boolean;
  model: string;
  latencyMs: number;
  failover: boolean;
  failoverReason?: string;
  timestamp: string;
  hostingInfo: {
    publisher: string;
    founder: string;
    serverLocation: string;
  };
}

export interface AIStatusResponse {
  status: string;
  activeProvider: string;
  localAI: { url: string; model: string };
  mistralCloud: { configured: boolean; model: string };
  gemini: { configured: boolean; model: string };
  phases: {
    phase1: string;
    phase2: string;
    phase3: string;
  };
  publisher: {
    name: string;
    founder: string;
    hosting: string;
    privacy: string;
    pricing: {
      standalone: string;
      bundle: string;
      catalog: string[];
    };
  };
}

/**
 * Fonction unifiée d'appel au moteur IA souverain
 */
export async function askAI(prompt: string, options: AskAIOptions = {}): Promise<AIResponse> {
  const startTime = Date.now();
  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        systemInstruction: options.systemInstruction,
        provider: options.provider || 'gemini',
        temperature: options.temperature,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur serveur HTTP ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data;
  } catch (error: unknown) {
    console.error('[aiService] Erreur appel API IA:', error);
    // Repli de secours gracieux local client si le serveur est momentanément hors ligne
    const latency = Date.now() - startTime;
    return {
      text: "ProxiLien vous répond en toute sécurité. Les données sont strictement protégées selon la charte éthique ALPHABETTE.",
      providerUsed: 'mock_fallback',
      sovereign: true,
      model: 'Secours résilient local',
      latencyMs: latency,
      failover: true,
      failoverReason: error instanceof Error ? error.message : 'Connexion réseau instable',
      timestamp: new Date().toISOString(),
      hostingInfo: {
        publisher: 'ALPHABETTE',
        founder: 'Valentin RICHAUD',
        serverLocation: 'Serveurs Souverains OVH France',
      },
    };
  }
}

/**
 * Récupère le statut et la configuration du routeur souverain
 */
export async function getAIStatus(): Promise<AIStatusResponse | null> {
  try {
    const response = await fetch('/api/ai/status');
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.warn('[aiService] Impossible de joindre /api/ai/status:', err);
    return null;
  }
}

/**
 * Assistant Métier ProxiLien : Aide à la rédaction d'un besoin de voisin
 */
export async function generateSolidarityRequest(
  seniorName: string,
  rawNeed: string,
  quartier: string
): Promise<string> {
  const prompt = `Voici une demande d'aide brute exprimée par ${seniorName}, habitant le quartier ${quartier} à La Grande-Motte :
"${rawNeed}"

Rédige une annonce d'entraide chaleureuse, respectueuse et claire en 2-3 phrases courtes pour les jeunes voisins bénévoles de ProxiLien. Précise les détails utiles sans jargon.`;

  const res = await askAI(prompt, {
    systemInstruction: "Tu es le rédacteur solidaire et bienveillant de ProxiLien (ALPHABETTE). Ton ton est humain, poli et chaleureux.",
  });
  return res.text;
}

/**
 * Assistant Métier ProxiLien : Recommandation parmi les 50 initiatives de La Grande-Motte
 */
export async function matchInitiativeAdvice(userDescription: string): Promise<string> {
  const prompt = `Un habitant de La Grande-Motte recherche une activité solidaire ou un soutien :
"${userDescription}"

Parmi les types d'initiatives possibles (Courses solidaires, Frigo du Port, Marche douce au Point Zéro, Jardin partagé du Ponant, Brico-dépannage, Visite amicale, Navette marché), conseille avec empathie 2 initiatives adaptées et encourage la participation.`;

  const res = await askAI(prompt, {
    systemInstruction: "Tu es le conseiller communautaire ProxiLien à La Grande-Motte.",
  });
  return res.text;
}
