/**
 * Service Client d'Abstraction IA Souveraine ALPHABETTE
 * Exclusivité MISTRAL AI (France / Europe) — Conformité RGPD Native
 * 
 * Trois niveaux d'accès standardisés :
 * 1. Période d'essai (7 jours offerts avec la clé propriétaire Alphabette)
 * 2. Mode BYOK (Bring Your Own Key) avec clé client personnelle Mistral
 * 3. Mode managé (Clé Alphabette incluse)
 * 
 * Environnements :
 * - Local Mac : Ollama / Metal (http://localhost:11434/v1)
 * - Cloud Mistral officiel : https://api.mistral.ai/v1
 */

import { MistralAccessTier, MistralModelId, MistralUserConfig } from '../types';

export interface AskAIOptions {
  systemInstruction?: string;
  tier?: MistralAccessTier;
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIResponse {
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

export interface AIStatusResponse {
  status: string;
  provider: string;
  hubUrl: string;
  mistralCloud: {
    baseUrl: string;
    configured: boolean;
    model: string;
  };
  mistralLocal: {
    url: string;
    model: string;
    support: string;
  };
  accessTiers: {
    tier1: string;
    tier2: string;
    tier3: string;
  };
  publisher: {
    name: string;
    founder: string;
    hosting: string;
    privacy: string;
    pricingGrid: {
      pilotLaGrandeMotte: string;
      applicationIndividuelle: {
        byok: string;
        confort: string;
      };
      bouquetAlphabette: {
        byok: string;
        integral: string;
      };
      catalog: string[];
    };
  };
}

// Clés de stockage local
const STORAGE_TRIAL_START = 'alphabette_trial_start_date';
const STORAGE_BYOK_KEY = 'alphabette_byok_mistral_key';
const STORAGE_BYOK_MODEL = 'alphabette_byok_mistral_model';
const STORAGE_BYOK_URL = 'alphabette_byok_mistral_url';
const STORAGE_ACCESS_TIER = 'alphabette_ai_access_tier';

/**
 * Récupère les informations de la période d'essai de 7 jours offerts
 */
export function getTrialInfo(): {
  startDate: string;
  daysUsed: number;
  daysRemaining: number;
  isExpired: boolean;
} {
  let startDate = localStorage.getItem(STORAGE_TRIAL_START);
  if (!startDate) {
    startDate = new Date().toISOString();
    localStorage.setItem(STORAGE_TRIAL_START, startDate);
  }

  const startMs = new Date(startDate).getTime();
  const nowMs = Date.now();
  const diffDays = Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24));
  const daysUsed = Math.max(0, diffDays);
  const daysRemaining = Math.max(0, 7 - daysUsed);
  const isExpired = daysRemaining <= 0;

  return {
    startDate,
    daysUsed,
    daysRemaining,
    isExpired,
  };
}

/**
 * Récupère la configuration Mistral actuelle de l'utilisateur
 */
export function getMistralConfig(): MistralUserConfig {
  const trial = getTrialInfo();
  const storedTier = (localStorage.getItem(STORAGE_ACCESS_TIER) as MistralAccessTier) || (trial.isExpired ? 'byok' : 'trial');
  const apiKey = localStorage.getItem(STORAGE_BYOK_KEY) || '';
  const model = (localStorage.getItem(STORAGE_BYOK_MODEL) as MistralModelId) || 'mistral-small-latest';
  const baseUrl = localStorage.getItem(STORAGE_BYOK_URL) || 'https://api.mistral.ai/v1';

  return {
    tier: storedTier,
    apiKey,
    model,
    baseUrl,
    trialStartDate: trial.startDate,
  };
}

/**
 * Enregistre la configuration Mistral de l'utilisateur
 */
export function saveMistralConfig(config: Partial<MistralUserConfig>): void {
  if (config.tier) {
    localStorage.setItem(STORAGE_ACCESS_TIER, config.tier);
  }
  if (config.apiKey !== undefined) {
    localStorage.setItem(STORAGE_BYOK_KEY, config.apiKey.trim());
  }
  if (config.model) {
    localStorage.setItem(STORAGE_BYOK_MODEL, config.model);
  }
  if (config.baseUrl) {
    localStorage.setItem(STORAGE_BYOK_URL, config.baseUrl.trim());
  }
}

/**
 * Fonction unifiée d'appel au moteur IA souverain Mistral AI
 */
export async function askAI(prompt: string, options: AskAIOptions = {}): Promise<AIResponse> {
  const startTime = Date.now();
  const config = getMistralConfig();
  const tier = options.tier || config.tier;

  const payload = {
    prompt,
    systemInstruction: options.systemInstruction,
    tier,
    apiKey: options.apiKey || (tier === 'byok' ? config.apiKey : undefined),
    baseUrl: options.baseUrl || config.baseUrl,
    model: options.model || config.model,
    temperature: options.temperature,
    maxTokens: options.maxTokens,
  };

  try {
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `Erreur serveur HTTP ${response.status}`);
    }

    const data: AIResponse = await response.json();
    return data;
  } catch (error: unknown) {
    console.error('[aiService] Erreur appel API IA:', error);
    const latency = Date.now() - startTime;
    return {
      text: "ProxiLien vous répond en toute sécurité. Les données sont strictement protégées selon la charte éthique ALPHABETTE et les normes RGPD (Mistral AI Europe).",
      providerUsed: 'mock_fallback',
      sovereign: true,
      rgpdCompliant: true,
      model: 'Moteur Résilient Local Souverain',
      latencyMs: latency,
      failover: true,
      failoverReason: error instanceof Error ? error.message : 'Connexion réseau momentanément indisponible',
      timestamp: new Date().toISOString(),
      accessTier: tier,
      hostingInfo: {
        publisher: 'ALPHABETTE SASU',
        founder: 'Valentin RICHAUD',
        serverLocation: 'Serveurs Souverains OVH France (alphabette.fr / alphabette.eu)',
        hubUrl: 'http://alphabette.fr',
        compliance: 'RGPD Native · Mistral AI France',
      },
    };
  }
}

/**
 * Récupère le statut complet du serveur IA souverain
 */
export async function getAIStatus(): Promise<AIStatusResponse | null> {
  try {
    const res = await fetch('/api/ai/status');
    if (!res.ok) return null;
    return (await res.json()) as AIStatusResponse;
  } catch (e) {
    console.warn('[aiService] Impossible de récupérer /api/ai/status:', e);
    return null;
  }
}
