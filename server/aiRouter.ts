/**
 * Routeur IA Souverain ALPHABETTE — Exclusif MISTRAL AI (France / Europe)
 * 
 * Conformité RGPD Native & Souveraineté Européenne :
 * - Entreprise française Mistral AI, infrastructures hébergées dans l'Union Européenne
 * - Aucune donnée ni requête n'est utilisée pour l'entraînement public des modèles
 * - Trois niveaux d'accès standardisés :
 *   1. Période d'essai (7 jours offerts avec la clé propriétaire Alphabette)
 *   2. Mode BYOK (Bring Your Own Key) avec clé personnelle Mistral
 *   3. Mode managé (Clé Alphabette incluse)
 * - Support direct des environnements :
 *   - Local Mac (Ollama / Metal via endpoint compatible /v1)
 *   - Production Cloud officiel Mistral (https://api.mistral.ai/v1)
 */

export type MistralAccessTier = 'trial' | 'byok' | 'managed' | 'local_mac';

export interface AIRequestPayload {
  prompt: string;
  systemInstruction?: string;
  tier?: MistralAccessTier;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponsePayload {
  text: string;
  providerUsed: 'cloud_mistral' | 'local_mistral' | 'byok_mistral' | 'mock_fallback';
  sovereign: boolean;
  rgpdCompliant: boolean;
  model: string;
  latencyMs: number;
  failover: boolean;
  failoverReason?: string;
  timestamp: string;
  accessTier: MistralAccessTier;
  hostingInfo: {
    publisher: string;
    founder: string;
    serverLocation: string;
    hubUrl: string;
    compliance: string;
  };
}

// Cooldown des modèles temporairement saturés (429 Rate Limit)
const mistralModelCooldowns = new Map<string, number>();

/**
 * Résout les identifiants Mistral de manière standardisée
 * Privilégie AI_BASE_URL, AI_API_KEY et MISTRAL_MODEL
 */
export function getMistralCredentials(): {
  baseUrl: string;
  apiKey: string | null;
  model: string;
  localUrl: string;
  localModel: string;
} {
  const baseUrl = (process.env.AI_BASE_URL || 'https://api.mistral.ai/v1').replace(/\/+$/, '');
  
  // Résolution clé API (support AI_API_KEY et MISTRAL_API_KEY)
  const rawKey = (process.env.AI_API_KEY || process.env.MISTRAL_API_KEY || '').trim();
  const rawModel = (process.env.MISTRAL_MODEL || '').trim();

  const isKeyPattern = (str: string) =>
    /^[A-Za-z0-9_-]{24,64}$/.test(str) &&
    !str.startsWith('mistral-') &&
    !str.startsWith('open-') &&
    !str.startsWith('codestral-') &&
    !str.startsWith('ministral-') &&
    !str.startsWith('pixtral-');

  let resolvedKey: string | null = null;
  let resolvedModel = 'mistral-small-latest';

  if (rawKey && rawKey !== 'MY_MISTRAL_API_KEY' && rawKey !== '""') {
    resolvedKey = rawKey;
  }

  // Détection si l'utilisateur a collé sa clé dans la variable MISTRAL_MODEL
  if (isKeyPattern(rawModel)) {
    if (!resolvedKey) {
      resolvedKey = rawModel;
    }
    resolvedModel = 'open-mistral-7b';
  } else if (rawModel && rawModel !== '""') {
    resolvedModel = rawModel;
  }

  const localUrl = (process.env.LOCAL_AI_URL || 'http://localhost:11434/v1').replace(/\/+$/, '');
  const localModel = process.env.LOCAL_AI_MODEL || 'mistral-nemo';

  return {
    baseUrl,
    apiKey: resolvedKey,
    model: resolvedModel,
    localUrl,
    localModel,
  };
}

/**
 * Appel à l'API Mistral (Cloud Officiel ou Endpoint Compatible Mac Ollama/Metal)
 */
async function executeMistralChat(params: {
  baseUrl: string;
  apiKey?: string;
  model: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
  timeoutMs?: number;
}): Promise<{ text: string; model: string }> {
  const { baseUrl, apiKey, model, prompt, systemInstruction, temperature = 0.7, timeoutMs = 8000 } = params;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  // Détection URL standard chat/completions
  const endpoint = baseUrl.endsWith('/v1')
    ? `${baseUrl}/chat/completions`
    : baseUrl.includes('/v1/')
    ? `${baseUrl}/chat/completions`
    : `${baseUrl}/v1/chat/completions`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model,
        messages: [
          ...(systemInstruction ? [{ role: 'system', content: systemInstruction }] : []),
          { role: 'user', content: prompt },
        ],
        temperature,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.text();
      if (res.status === 429) {
        mistralModelCooldowns.set(model, Date.now() + 60_000);
      }
      throw new Error(`Mistral HTTP ${res.status}: ${errBody || res.statusText}`);
    }

    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content || '';

    if (!text.trim()) {
      throw new Error("Réponse vide reçue de l'API Mistral");
    }

    // Réinitialiser le cooldown en cas de succès
    mistralModelCooldowns.delete(model);
    return { text, model };
  } catch (err: unknown) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Appel avec pool de modèles résilients Mistral (gestion transparente des quotas)
 */
async function callMistralWithFallback(params: {
  baseUrl: string;
  apiKey: string;
  preferredModel: string;
  prompt: string;
  systemInstruction?: string;
  temperature?: number;
}): Promise<{ text: string; model: string }> {
  const now = Date.now();
  const pool = [params.preferredModel, 'open-mistral-7b', 'open-mistral-nemo', 'mistral-small-latest'];
  const uniqueModels = Array.from(new Set(pool));

  // Priorité aux modèles non limités par 429
  const sortedModels = uniqueModels.sort((a, b) => {
    const aCool = (mistralModelCooldowns.get(a) || 0) > now ? 1 : 0;
    const bCool = (mistralModelCooldowns.get(b) || 0) > now ? 1 : 0;
    return aCool - bCool;
  });

  let lastError: Error | null = null;

  for (const model of sortedModels) {
    try {
      const result = await executeMistralChat({
        baseUrl: params.baseUrl,
        apiKey: params.apiKey,
        model,
        prompt: params.prompt,
        systemInstruction: params.systemInstruction,
        temperature: params.temperature,
        timeoutMs: 6500,
      });
      return result;
    } catch (err) {
      lastError = err as Error;
      console.info(`[MistralRouter] Modèle ${model} indisponible (${lastError.message}), essai modèle suivant...`);
    }
  }

  throw lastError || new Error("Tous les modèles Mistral sont momentanément occupés.");
}

/**
 * Générateur local de réponse de secours citoyenne et bienveillante ALPHABETTE
 * Garantit qu'un aîné ou un bénévole n'est JAMAIS bloqué même sans connexion
 */
function generateResilientLocalFallback(
  prompt: string,
  failoverReason: string,
  accessTier: MistralAccessTier
): AIResponsePayload {
  const lower = prompt.toLowerCase();
  let text = '';

  if (lower.includes('course') || lower.includes('pain') || lower.includes('pharmacie') || lower.includes('marché')) {
    text =
      "Bonjour ! ProxiLien a bien enregistré votre demande pour les courses et fournitures à La Grande-Motte. 🥖🛒 Nos jeunes voisins solidaires (Quartiers Couchant, Ponant, Centre-Ville) sont notifiés avec bienveillance. Votre demande est protégée conformément aux normes RGPD.";
  } else if (
    lower.includes('brico') ||
    lower.includes('ampoule') ||
    lower.includes('outil') ||
    lower.includes('jardin') ||
    lower.includes('panne')
  ) {
    text =
      "Bonjour ! ProxiLien vous accompagne pour tous les petits coups de main et bricolages de proximité à La Grande-Motte. 🔨🌱 Vous pouvez également utiliser le module 'Prêt d'Outils' pour emprunter gratuitement du matériel ou solliciter le passage d'un voisin qualifié de votre quartier.";
  } else if (
    lower.includes('compagnie') ||
    lower.includes('visite') ||
    lower.includes('parler') ||
    lower.includes('promenade') ||
    lower.includes('solitude')
  ) {
    text =
      "Bonjour ! Le lien humain et intergénérationnel est la priorité absolue de ProxiLien et de la charte éthique ALPHABETTE. ☕👥 Un veilleur de quartier peut vous contacter pour partager un moment convivial, une discussion ou une marche douce le long de la plage au Point Zéro.";
  } else if (lower.includes('urgence') || lower.includes('sos') || lower.includes('chute') || lower.includes('malaise')) {
    text =
      "⚠️ ALERTE DE SÉCURITÉ : En cas d'urgence médicale vitale, composez immédiatement le SAMU (15) ou les Pompiers (18). Vous pouvez également appuyer sur le bouton rouge SOS en haut de l'application pour alerter instantanément vos 3 veilleurs de confiance de La Grande-Motte.";
  } else if (
    lower.includes('tarif') ||
    lower.includes('prix') ||
    lower.includes('abonnement') ||
    lower.includes('pass') ||
    lower.includes('bouquet') ||
    lower.includes('grande-motte')
  ) {
    text =
      "Bonjour ! Voici la grille officielle ALPHABETTE :\n• Habitants de La Grande-Motte : 1ère année 100 % GRATUITE (avec géolocalisation obligatoire).\n• Formule BYOK (Clé client Mistral) : 39 € / an.\n• Formule Confort (Clé Alphabette incluse) : 59 € / an (après 7 jours d'essai offerts).\n• Pass Bouquet BYOK (Toutes les applications) : 99 € / an.\n• Pass Bouquet Intégral (Toutes les applications + clés gérées) : 199 € / an.\nDécouvrez toutes les applications de la suite sur http://alphabette.fr.";
  } else {
    text =
      "Bonjour ! L'assistant citoyen ProxiLien est à votre service. Votre échange s'inscrit dans les valeurs de souveraineté numérique française (Mistral AI), de respect strict du RGPD et d'entraide de proximité portées par ALPHABETTE SASU. N'hésitez pas à solliciter vos voisins ou à proposer votre aide.";
  }

  return {
    text,
    providerUsed: 'mock_fallback',
    sovereign: true,
    rgpdCompliant: true,
    model: 'Moteur Résilient Local Souverain (ALPHABETTE)',
    latencyMs: 25,
    failover: true,
    failoverReason,
    timestamp: new Date().toISOString(),
    accessTier,
    hostingInfo: {
      publisher: 'ALPHABETTE SASU',
      founder: 'Valentin RICHAUD',
      serverLocation: 'Serveurs Souverains OVH France (alphabette.fr / alphabette.eu)',
      hubUrl: 'http://alphabette.fr',
      compliance: 'RGPD Native · Entreprise française Mistral AI · Aucune réutilisation des données',
    },
  };
}

/**
 * Gestionnaire principal des requêtes IA Souveraines ALPHABETTE
 * Exclusivité absolue Mistral AI (Local Mac Ollama ou Mistral Cloud API Europe)
 */
export async function handleAIRequest(payload: AIRequestPayload): Promise<AIResponsePayload> {
  const startTime = Date.now();
  const creds = getMistralCredentials();
  const tier: MistralAccessTier = payload.tier || 'trial';

  const hostingInfo = {
    publisher: 'ALPHABETTE SASU',
    founder: 'Valentin RICHAUD',
    serverLocation: 'Serveurs Souverains OVH France (alphabette.fr / alphabette.eu)',
    hubUrl: 'http://alphabette.fr',
    compliance: 'RGPD Native · Entreprise française Mistral AI · Aucune réutilisation des données',
  };

  const systemInstruction =
    payload.systemInstruction ||
    `Tu es l'assistant de conception, de support et d'administration de ProxiLien, la plateforme d'entraide locale et de communication citoyenne éditée par ALPHABETTE SASU (fondée par Valentin RICHAUD).
Souveraineté exclusive : Mistral AI (France / Europe). Aucune donnée d'utilisateur n'est réutilisée pour l'entraînement.
Gratuité : 1ère année 100 % offerte pour tous les habitants de La Grande-Motte (avec géolocalisation obligatoire).
Grille tarifaire : Formule BYOK 39 € / an, Formule Confort 59 € / an, Bouquet BYOK 99 € / an, Bouquet Intégral 199 € / an.
Lien hub : Découvrir toutes les applications de la suite sur http://alphabette.fr.`;

  // 1. Mode Local Mac (Ollama / Metal sur http://localhost:11434/v1)
  if (tier === 'local_mac' || payload.baseUrl?.includes('localhost') || payload.baseUrl?.includes('127.0.0.1')) {
    const localUrl = payload.baseUrl || creds.localUrl;
    const localModel = payload.model || creds.localModel;
    try {
      const res = await executeMistralChat({
        baseUrl: localUrl,
        model: localModel,
        prompt: payload.prompt,
        systemInstruction,
        temperature: payload.temperature,
        timeoutMs: 4000,
      });

      return {
        text: res.text,
        providerUsed: 'local_mistral',
        sovereign: true,
        rgpdCompliant: true,
        model: `${res.model} (Mac Local Metal/Ollama)`,
        latencyMs: Date.now() - startTime,
        failover: false,
        timestamp: new Date().toISOString(),
        accessTier: 'local_mac',
        hostingInfo,
      };
    } catch (localErr) {
      const msg = (localErr as Error).message;
      console.info(`[MistralRouter] Environnement local Mac non joignable (${msg}), repli vers Mistral Cloud...`);
      // Basculement vers Mistral Cloud si clé disponible
    }
  }

  // 2. Mode BYOK (Bring Your Own Key) : l'utilisateur a renseigné sa propre clé Mistral
  if (tier === 'byok' && payload.apiKey) {
    const userKey = payload.apiKey.trim();
    const userModel = payload.model || creds.model;
    const userBaseUrl = payload.baseUrl || creds.baseUrl;

    try {
      const res = await callMistralWithFallback({
        baseUrl: userBaseUrl,
        apiKey: userKey,
        preferredModel: userModel,
        prompt: payload.prompt,
        systemInstruction,
        temperature: payload.temperature,
      });

      return {
        text: res.text,
        providerUsed: 'byok_mistral',
        sovereign: true,
        rgpdCompliant: true,
        model: `${res.model} (BYOK Utilisateur)`,
        latencyMs: Date.now() - startTime,
        failover: false,
        timestamp: new Date().toISOString(),
        accessTier: 'byok',
        hostingInfo,
      };
    } catch (byokErr) {
      const msg = (byokErr as Error).message;
      console.info(`[MistralRouter] Erreur avec la clé BYOK (${msg})`);
      // Si la clé personnelle de l'utilisateur a un souci, tenter la clé Alphabette si configurée ou repli gracieux
      if (creds.apiKey) {
        try {
          const fallbackRes = await callMistralWithFallback({
            baseUrl: creds.baseUrl,
            apiKey: creds.apiKey,
            preferredModel: creds.model,
            prompt: payload.prompt,
            systemInstruction,
            temperature: payload.temperature,
          });

          return {
            text: fallbackRes.text,
            providerUsed: 'cloud_mistral',
            sovereign: true,
            rgpdCompliant: true,
            model: `${fallbackRes.model} (Secours Clé Alphabette)`,
            latencyMs: Date.now() - startTime,
            failover: true,
            failoverReason: `Clé BYOK limitée : ${msg}`,
            timestamp: new Date().toISOString(),
            accessTier: 'byok',
            hostingInfo,
          };
        } catch {
          // Pass to local fallback
        }
      }

      return generateResilientLocalFallback(payload.prompt, `Clé BYOK non opérationnelle : ${msg}`, 'byok');
    }
  }

  // 3. Mode Période d'Essai (7 jours offerts) ou Mode Managé (Clé Alphabette propriétaire)
  if (creds.apiKey) {
    try {
      const preferredModel = payload.model || creds.model;
      const res = await callMistralWithFallback({
        baseUrl: creds.baseUrl,
        apiKey: creds.apiKey,
        preferredModel,
        prompt: payload.prompt,
        systemInstruction,
        temperature: payload.temperature,
      });

      return {
        text: res.text,
        providerUsed: 'cloud_mistral',
        sovereign: true,
        rgpdCompliant: true,
        model: `${res.model} (Mistral AI Europe)`,
        latencyMs: Date.now() - startTime,
        failover: false,
        timestamp: new Date().toISOString(),
        accessTier: tier,
        hostingInfo,
      };
    } catch (mistralErr) {
      const msg = (mistralErr as Error).message;
      console.warn(`[MistralRouter] Erreur Cloud Mistral (${msg})`);
      return generateResilientLocalFallback(payload.prompt, `Mistral Cloud temporairement saturé : ${msg}`, tier);
    }
  }

  // 4. Aucun identifiant distant disponible (mode hors-ligne ou clé non encore renseignée)
  return generateResilientLocalFallback(
    payload.prompt,
    "Moteur local souverain d'attente (Clé Mistral en cours d'activation)",
    tier
  );
}
