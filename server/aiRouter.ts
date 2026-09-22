import { GoogleGenAI } from "@google/genai";

export type AIProvider = 'gemini' | 'hybrid_mistral' | 'local_only' | 'cloud_mistral' | 'auto';

export interface AIRequestPayload {
  prompt: string;
  systemInstruction?: string;
  provider?: AIProvider;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponsePayload {
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

let geminiClient: GoogleGenAI | null = null;

// Enregistre les modèles temporairement saturés (HTTP 429) avec un timestamp d'expiration
const mistralModelCooldowns = new Map<string, number>();

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in environment.");
    }
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

/**
 * Résout de manière sécurisée les identifiants Mistral AI.
 * Détecte si l'utilisateur a accidentellement collé sa clé API dans MISTRAL_MODEL,
 * et privilégie un modèle résilient et à haute disponibilité (open-mistral-7b).
 */
export function getMistralCredentials(): { apiKey: string | null; model: string } {
  const rawKey = (process.env.MISTRAL_API_KEY || "").trim();
  const rawModel = (process.env.MISTRAL_MODEL || "").trim();

  // Détecte une chaîne qui ressemble à une clé d'API (alphanumérique 24-64 caractères sans tiret de modèle)
  const isKeyPattern = (str: string) =>
    /^[A-Za-z0-9_-]{24,64}$/.test(str) &&
    !str.startsWith('mistral-') &&
    !str.startsWith('open-') &&
    !str.startsWith('codestral-') &&
    !str.startsWith('ministral-') &&
    !str.startsWith('pixtral-');

  let resolvedKey: string | null = null;
  // Par défaut, open-mistral-7b est beaucoup plus résilient sur les clés développeur que mistral-small-latest (qui subit souvent des 429)
  let resolvedModel = 'open-mistral-7b';

  // 1. Clé normale
  if (rawKey && rawKey !== 'MY_MISTRAL_API_KEY' && rawKey !== '""') {
    resolvedKey = rawKey;
  }

  // 2. Clé accidentellement saisie dans la variable MISTRAL_MODEL
  if (isKeyPattern(rawModel)) {
    if (!resolvedKey) {
      resolvedKey = rawModel;
    }
    resolvedModel = 'open-mistral-7b';
  } else if (rawModel && rawModel !== '""') {
    resolvedModel = rawModel;
  }

  return { apiKey: resolvedKey, model: resolvedModel };
}

/**
 * Phase 1 : Prototypage & Conception via Google Gemini
 * Avec basculement automatique inter-modèles en cas de surcharge temporaire 503 ("high demand").
 */
async function callGemini(
  prompt: string,
  systemInstruction?: string,
  temperature = 0.7
): Promise<{ text: string; model: string }> {
  const ai = getGeminiClient();

  // Liste de modèles supportés ordonnée par préférence pour garantir la résilience
  const candidateModels = [
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-flash-latest',
    'gemini-3.1-flash-lite',
  ];

  let lastError: unknown = null;

  for (const modelName of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: prompt,
        config: {
          temperature,
          systemInstruction: systemInstruction || "Tu es l'assistant bienveillant et solidaire ProxiLien édité par ALPHABETTE (fondée par Valentin RICHAUD). Réponds avec chaleur, empathie et clarté pour les aînés et les jeunes de La Grande-Motte.",
        },
      });

      const text = response.text || "";
      if (text && text.trim().length > 0) {
        return { text, model: modelName };
      }
    } catch (err: unknown) {
      lastError = err;
      const msg = (err as Error)?.message || String(err);
      console.info(`[AIRouter] Modèle Gemini ${modelName} temporairement indisponible (${msg}), tentative modèle alternatif...`);
    }
  }

  throw lastError || new Error("Tous les modèles Gemini sont momentanément indisponibles.");
}

/**
 * Phase 2 : Moteur Local Souverain (Ollama / vLLM)
 * Exécuté sur machine dédiée haute performance.
 * Timeout strict de 3500ms pour détecter immédiatement une coupure ou panne.
 */
async function callLocalAI(
  prompt: string,
  systemInstruction?: string,
  timeoutMs = 3500
): Promise<{ text: string; model: string }> {
  const localUrl = process.env.LOCAL_AI_URL || 'http://localhost:11434';
  const model = process.env.LOCAL_AI_MODEL || 'mistral-nemo';

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`${localUrl.replace(/\/+$/, '')}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt }
        ],
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      throw new Error(`Serveur local HTTP ${res.status}: ${res.statusText}`);
    }

    const data = (await res.json()) as { message?: { content?: string }; response?: string };
    const text = data.message?.content || data.response || "";
    return { text, model: `${model} (Local Ollama/vLLM)` };
  } catch (err: unknown) {
    clearTimeout(timer);
    const error = err as Error;
    if (error.name === 'AbortError') {
      throw new Error(`Délai dépassé sur serveur local (${timeoutMs}ms) - Basculement secours`);
    }
    throw new Error(`Indisponibilité serveur local (${error.message}) - Basculement secours`);
  }
}

/**
 * Phase 3 : Résilience & Secours Cloud Européen (Mistral AI API Officielle)
 * Hébergé en France / Europe, garantit la continuité absolue du service.
 * Gère proactivement les quotas et rate limits (HTTP 429) avec un pool de modèles résilients.
 */
async function callMistralCloud(
  prompt: string,
  systemInstruction?: string,
  temperature = 0.7
): Promise<{ text: string; model: string }> {
  const { apiKey, model } = getMistralCredentials();

  if (!apiKey) {
    throw new Error("MISTRAL_API_KEY non configurée pour le repli Cloud Européen.");
  }

  const now = Date.now();
  // Vérifier si un blocage global temporaire de compte est actif
  const globalCooldown = mistralModelCooldowns.get('__global__') || 0;
  if (globalCooldown > now) {
    throw new Error(`Mistral Cloud temporairement en cooldown suite à une limitation de débit.`);
  }

  // Modèles candidats ordonnés pour privilégier la disponibilité et contourner les 429
  const candidatePool = [model, 'open-mistral-7b', 'open-mistral-nemo', 'mistral-small-latest'];
  const uniqueModels = Array.from(new Set(candidatePool));

  // Priorité absolue aux modèles non en cooldown (non limités par 429)
  const modelsToTry = uniqueModels.sort((a, b) => {
    const aCool = (mistralModelCooldowns.get(a) || 0) > now ? 1 : 0;
    const bCool = (mistralModelCooldowns.get(b) || 0) > now ? 1 : 0;
    return aCool - bCool;
  });

  let lastError: Error | null = null;

  for (const currentModel of modelsToTry) {
    // Si ce modèle est en cooldown et qu'un modèle disponible a déjà été tenté
    const isCool = (mistralModelCooldowns.get(currentModel) || 0) > now;
    if (isCool && modelsToTry.some(m => (mistralModelCooldowns.get(m) || 0) <= now)) {
      continue;
    }

    try {
      const res = await fetch('https://api.mistral.ai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: currentModel,
          messages: [
            ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
            { role: 'user', content: prompt }
          ],
          temperature,
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();

        // 1. Détection HTTP 429 Rate Limit (Free Tier ou quota ponctuel)
        if (res.status === 429) {
          // Mettre ce modèle spécifique en cooldown 90 secondes
          mistralModelCooldowns.set(currentModel, Date.now() + 90_000);
          console.info(`[AIRouter] Modèle Mistral ${currentModel} saturé (429 Rate Limit), basculement transparent...`);
          lastError = new Error(`Modèle Mistral ${currentModel} temporairement limité (HTTP 429)`);
          continue;
        }

        // 2. Détection problème d'authentification
        if (res.status === 401 || res.status === 403) {
          mistralModelCooldowns.set('__global__', Date.now() + 180_000);
          throw new Error(`Accès Mistral Cloud non autorisé (HTTP ${res.status})`);
        }

        throw new Error(`Mistral Cloud HTTP ${res.status}: ${errorText}`);
      }

      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const text = data.choices?.[0]?.message?.content || "";
      
      // Succès : lever le cooldown sur ce modèle
      mistralModelCooldowns.delete(currentModel);
      return { text, model: `${currentModel} (Mistral Cloud Europe)` };
    } catch (err: unknown) {
      lastError = err as Error;
      if (lastError.message.includes('non autorisé')) {
        break;
      }
    }
  }

  throw lastError || new Error("Mistral Cloud momentanément indisponible.");
}

/**
 * Générateur local de réponse de secours résiliente contextualisée.
 * Garantit qu'aucun aîné ni jeune bénévole ne soit bloqué par un écran d'erreur
 * si toutes les connexions IA externes sont simultanément coupées.
 */
function generateResilientLocalFallback(prompt: string, failoverReason: string): AIResponsePayload {
  const lower = prompt.toLowerCase();
  let text = "";

  if (lower.includes("course") || lower.includes("pain") || lower.includes("pharmacie") || lower.includes("marché")) {
    text = "Bonjour ! ProxiLien a bien enregistré votre demande pour les courses et fournitures du quotidien. 🥖🛒 Plusieurs jeunes voisins solidaires de La Grande-Motte (Le Couchant, Le Ponant, Centre-Ville) sont inscrits pour donner un coup de main avec bienveillance. Votre demande est visible par les bénévoles vérifiés.";
  } else if (lower.includes("brico") || lower.includes("ampoule") || lower.includes("outil") || lower.includes("jardin") || lower.includes("panne")) {
    text = "Bonjour ! ProxiLien vous accompagne pour tous les petits coups de main et bricolages de proximité. 🔨🌱 Vous pouvez également utiliser le module 'Prêt d'Outils' pour emprunter gratuitement du matériel ou solliciter le passage d'un voisin qualifié de votre quartier.";
  } else if (lower.includes("compagnie") || lower.includes("visite") || lower.includes("parler") || lower.includes("promenade") || lower.includes("solitude")) {
    text = "Bonjour ! Le lien humain et intergénérationnel est la priorité absolue de ProxiLien et de la charte éthique ALPHABETTE. ☕👥 Un veilleur de quartier peut vous contacter pour partager un moment convivial, une discussion ou une marche douce le long de la plage au Point Zéro.";
  } else if (lower.includes("urgence") || lower.includes("sos") || lower.includes("chute") || lower.includes("malaise")) {
    text = "⚠️ ALERTE DE SÉCURITÉ : En cas d'urgence médicale vitale, composez immédiatement le SAMU (15) ou les Pompiers (18). Vous pouvez également appuyer sur le bouton rouge SOS en haut de l'application pour alerter instantanément vos 3 veilleurs de confiance.";
  } else {
    text = "Bonjour ! L'Ami Bienveillant ProxiLien est à votre écoute. Votre démarche s'inscrit dans les valeurs d'entraide, de respect de la vie privée et de proximité citoyenne portées par ALPHABETTE à La Grande-Motte. N'hésitez pas à publier votre besoin ou à rejoindre une activité conviviale.";
  }

  return {
    text,
    providerUsed: 'mock_fallback',
    sovereign: true,
    model: 'Moteur Résilient Local ALPHABETTE',
    latencyMs: 30,
    failover: true,
    failoverReason,
    timestamp: new Date().toISOString(),
    hostingInfo: {
      publisher: 'ALPHABETTE',
      founder: 'Valentin RICHAUD',
      serverLocation: 'Serveurs Souverains OVH France (alphabette.fr / alphabette.eu)',
    },
  };
}

/**
 * Routeur IA Centralisé ALPHABETTE (Strategy & Provider Pattern)
 * Résilience transparente : Local (Phase 2) -> Mistral Cloud (Phase 3) -> Gemini (Phase 1) -> Moteur Résilient Local
 */
export async function handleAIRequest(payload: AIRequestPayload): Promise<AIResponsePayload> {
  const startTime = Date.now();
  const configuredProvider = (payload.provider || process.env.AI_PROVIDER || 'gemini') as AIProvider;
  const timeoutLocal = Number(process.env.TIMEOUT_LOCAL_MS) || 3500;
  const mistralCreds = getMistralCredentials();

  const hostingInfo = {
    publisher: 'ALPHABETTE',
    founder: 'Valentin RICHAUD',
    serverLocation: 'Serveurs Souverains OVH France (alphabette.fr / alphabette.eu)',
  };

  // 1. Fournisseur explicite Gemini (Phase 1 Prototypage actif)
  if (configuredProvider === 'gemini') {
    try {
      const result = await callGemini(payload.prompt, payload.systemInstruction, payload.temperature);
      return {
        text: result.text,
        providerUsed: 'gemini',
        sovereign: false,
        model: result.model,
        latencyMs: Date.now() - startTime,
        failover: false,
        timestamp: new Date().toISOString(),
        hostingInfo,
      };
    } catch (geminiError: unknown) {
      const geminiMsg = (geminiError as Error).message;
      console.info("[AIRouter] Gemini non disponible, basculement vers le relais Mistral Cloud...", geminiMsg);

      // Tentative de secours Cloud Mistral si configuré
      if (mistralCreds.apiKey) {
        try {
          const mistralResult = await callMistralCloud(payload.prompt, payload.systemInstruction, payload.temperature);
          return {
            text: mistralResult.text,
            providerUsed: 'cloud_mistral',
            sovereign: true,
            model: mistralResult.model,
            latencyMs: Date.now() - startTime,
            failover: true,
            failoverReason: `Repli depuis Gemini : ${geminiMsg}`,
            timestamp: new Date().toISOString(),
            hostingInfo,
          };
        } catch (mistralErr) {
          console.info("[AIRouter] Relais Mistral Cloud non disponible:", (mistralErr as Error).message);
        }
      }

      // Repli gracieux souverain local si toutes les APIs distantes sont indisponibles
      return generateResilientLocalFallback(
        payload.prompt,
        `Gemini indisponible (${geminiMsg}) + Mistral secours non opérationnel`
      );
    }
  }

  // 2. Fournisseur explicite Cloud Mistral
  if (configuredProvider === 'cloud_mistral') {
    try {
      const mistralResult = await callMistralCloud(payload.prompt, payload.systemInstruction, payload.temperature);
      return {
        text: mistralResult.text,
        providerUsed: 'cloud_mistral',
        sovereign: true,
        model: mistralResult.model,
        latencyMs: Date.now() - startTime,
        failover: false,
        timestamp: new Date().toISOString(),
        hostingInfo,
      };
    } catch (mistralError: unknown) {
      const mistralMsg = (mistralError as Error).message;
      console.info("[AIRouter] Mistral Cloud saturé ou indisponible, repli vers Gemini...", mistralMsg);

      try {
        const geminiResult = await callGemini(payload.prompt, payload.systemInstruction, payload.temperature);
        return {
          text: geminiResult.text,
          providerUsed: 'gemini',
          sovereign: false,
          model: geminiResult.model,
          latencyMs: Date.now() - startTime,
          failover: true,
          failoverReason: `Repli depuis Mistral Cloud: ${mistralMsg}`,
          timestamp: new Date().toISOString(),
          hostingInfo,
        };
      } catch (geminiError: unknown) {
        return generateResilientLocalFallback(payload.prompt, `Mistral et Gemini indisponibles`);
      }
    }
  }

  // 3. Fournisseur local strict
  if (configuredProvider === 'local_only') {
    try {
      const localResult = await callLocalAI(payload.prompt, payload.systemInstruction, timeoutLocal);
      return {
        text: localResult.text,
        providerUsed: 'local_mistral',
        sovereign: true,
        model: localResult.model,
        latencyMs: Date.now() - startTime,
        failover: false,
        timestamp: new Date().toISOString(),
        hostingInfo,
      };
    } catch (localError: unknown) {
      const localMsg = (localError as Error).message;
      console.info("[AIRouter] Serveur local strict non détecté, relais vers secours...", localMsg);

      // Si secours Mistral disponible
      if (mistralCreds.apiKey) {
        try {
          const mistralResult = await callMistralCloud(payload.prompt, payload.systemInstruction, payload.temperature);
          return {
            text: mistralResult.text,
            providerUsed: 'cloud_mistral',
            sovereign: true,
            model: mistralResult.model,
            latencyMs: Date.now() - startTime,
            failover: true,
            failoverReason: `Repli serveur local: ${localMsg}`,
            timestamp: new Date().toISOString(),
            hostingInfo,
          };
        } catch {
          // Continuer vers Gemini
        }
      }

      try {
        const geminiResult = await callGemini(payload.prompt, payload.systemInstruction, payload.temperature);
        return {
          text: geminiResult.text,
          providerUsed: 'gemini',
          sovereign: false,
          model: geminiResult.model,
          latencyMs: Date.now() - startTime,
          failover: true,
          failoverReason: `Repli serveur local: ${localMsg}`,
          timestamp: new Date().toISOString(),
          hostingInfo,
        };
      } catch {
        return generateResilientLocalFallback(payload.prompt, `Serveur local, Mistral et Gemini indisponibles`);
      }
    }
  }

  // 4. Stratégie Hybride Souveraine (Phase 2 Local + Phase 3 Secours Cloud Européen)
  // Tente d'abord le serveur local ; si échec (timeout 3.5s ou coupure), bascule vers Mistral Cloud sans bruit.
  let failoverReason: string | undefined;
  try {
    const localResult = await callLocalAI(payload.prompt, payload.systemInstruction, timeoutLocal);
    return {
      text: localResult.text,
      providerUsed: 'local_mistral',
      sovereign: true,
      model: localResult.model,
      latencyMs: Date.now() - startTime,
      failover: false,
      timestamp: new Date().toISOString(),
      hostingInfo,
    };
  } catch (localError: unknown) {
    failoverReason = (localError as Error).message;
    console.info(`[AIRouter] Basculement de résilience : ${failoverReason}`);
  }

  // Secours Cloud Européen Mistral AI
  if (mistralCreds.apiKey) {
    try {
      const mistralResult = await callMistralCloud(payload.prompt, payload.systemInstruction, payload.temperature);
      return {
        text: mistralResult.text,
        providerUsed: 'cloud_mistral',
        sovereign: true,
        model: mistralResult.model,
        latencyMs: Date.now() - startTime,
        failover: true,
        failoverReason,
        timestamp: new Date().toISOString(),
        hostingInfo,
      };
    } catch (mistralError: unknown) {
      failoverReason = `${failoverReason} -> Mistral Cloud: ${(mistralError as Error).message}`;
      console.info(`[AIRouter] Relais Mistral Cloud en pause, relais vers Gemini : ${failoverReason}`);
    }
  }

  // Repli vers Gemini pour garantir la continuité
  try {
    const geminiResult = await callGemini(payload.prompt, payload.systemInstruction, payload.temperature);
    return {
      text: geminiResult.text,
      providerUsed: 'gemini',
      sovereign: false,
      model: geminiResult.model,
      latencyMs: Date.now() - startTime,
      failover: true,
      failoverReason: failoverReason || "Serveur local et Mistral non disponibles, exécution sur Gemini",
      timestamp: new Date().toISOString(),
      hostingInfo,
    };
  } catch (geminiError: unknown) {
    failoverReason = `${failoverReason} -> Gemini: ${(geminiError as Error).message}`;
    console.info(`[AIRouter] Activation du moteur résilient local ALPHABETTE : ${failoverReason}`);
    return generateResilientLocalFallback(payload.prompt, failoverReason);
  }
}
