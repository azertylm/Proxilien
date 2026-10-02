/**
 * Service de Gestion des Quotas & Paliers ALPHABETTE
 * 
 * Règles métier :
 * - Jours 1 à 7 (essai gratuit découverte) : 20 requêtes/jour maximum sur la clé interne Alphabette.
 * - Dès le 8e jour (sans abonnement ni clé BYOK) : bascule en mode bridé à 5 requêtes/jour maximum.
 * - Utilisateur Abonné ou BYOK (Bring Your Own Key) ou Habitant de La Grande-Motte : requêtes illimitées.
 */

import { getStoredLGMGeoStatus } from './geolocationService';

const STORAGE_DAILY_DATE = 'alphabette_quota_date';
const STORAGE_DAILY_COUNT = 'alphabette_quota_count';
const STORAGE_SUBSCRIPTION = 'alphabette_user_subscribed';
const STORAGE_BYOK_KEYS = 'alphabette_byok_all_keys';

export interface QuotaStatus {
  isAllowed: boolean;
  requestsUsedToday: number;
  dailyLimit: number;
  daysIntoTrial: number;
  isTrialActive: boolean;
  isSubscribed: boolean;
  hasByokKey: boolean;
  isLGMFree: boolean;
  reason?: string;
}

export interface UserKeys {
  mistral?: string;
  google?: string;
  openai?: string;
  anthropic?: string;
  deepseek?: string;
  xai?: string;
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getStoredUserKeys(): UserKeys {
  try {
    const raw = localStorage.getItem(STORAGE_BYOK_KEYS);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveUserKeys(keys: UserKeys): void {
  localStorage.setItem(STORAGE_BYOK_KEYS, JSON.stringify(keys));
}

export function isUserSubscribed(): boolean {
  return localStorage.getItem(STORAGE_SUBSCRIPTION) === 'true';
}

export function setUserSubscribed(subscribed: boolean): void {
  localStorage.setItem(STORAGE_SUBSCRIPTION, subscribed ? 'true' : 'false');
}

/**
 * Calcule l'état actuel des quotas de l'utilisateur
 */
export function checkAlphabetteQuota(): QuotaStatus {
  // 1. Vérifier si l'utilisateur a configuré au moins une clé BYOK ou un abonnement actif
  const keys = getStoredUserKeys();
  const hasByokKey = Boolean(keys.mistral || keys.google || keys.openai || keys.anthropic || keys.deepseek || keys.xai);
  const isSubscribed = isUserSubscribed();

  // 2. Vérifier si l'habitant est à La Grande-Motte (Gratuité municipale)
  const lgmStatus = getStoredLGMGeoStatus();
  const isLGMFree = lgmStatus.verified && lgmStatus.isLGM;

  if (hasByokKey || isSubscribed || isLGMFree) {
    return {
      isAllowed: true,
      requestsUsedToday: 0,
      dailyLimit: 9999,
      daysIntoTrial: 0,
      isTrialActive: false,
      isSubscribed,
      hasByokKey,
      isLGMFree,
    };
  }

  // 3. Calculer les jours depuis la première visite (Essai de 7 jours)
  const trialStartKey = 'alphabette_trial_start_date';
  let trialStart = localStorage.getItem(trialStartKey);
  if (!trialStart) {
    trialStart = new Date().toISOString();
    localStorage.setItem(trialStartKey, trialStart);
  }

  const startMs = new Date(trialStart).getTime();
  const nowMs = Date.now();
  const daysIntoTrial = Math.max(1, Math.floor((nowMs - startMs) / (1000 * 60 * 60 * 24)) + 1);
  const isTrialActive = daysIntoTrial <= 7;

  // Jours 1 à 7 : 20 requêtes/jour. Dès J+8 : 5 requêtes/jour.
  const dailyLimit = isTrialActive ? 20 : 5;

  // 4. Compteur journalier
  const today = getTodayKey();
  const storedDate = localStorage.getItem(STORAGE_DAILY_DATE);
  let count = parseInt(localStorage.getItem(STORAGE_DAILY_COUNT) || '0', 10);

  if (storedDate !== today) {
    localStorage.setItem(STORAGE_DAILY_DATE, today);
    localStorage.setItem(STORAGE_DAILY_COUNT, '0');
    count = 0;
  }

  const isAllowed = count < dailyLimit;

  return {
    isAllowed,
    requestsUsedToday: count,
    dailyLimit,
    daysIntoTrial,
    isTrialActive,
    isSubscribed: false,
    hasByokKey: false,
    isLGMFree: false,
    reason: isAllowed ? undefined : `Votre quota quotidien gratuit (${dailyLimit} requêtes/jour) est atteint. Activez votre abonnement ou renseignez votre propre clé API dans votre espace Alphabette.`,
  };
}

/**
 * Incrémente le compteur de requêtes consommées sur la clé interne
 */
export function incrementAlphabetteQuota(): void {
  const today = getTodayKey();
  const storedDate = localStorage.getItem(STORAGE_DAILY_DATE);
  let count = parseInt(localStorage.getItem(STORAGE_DAILY_COUNT) || '0', 10);

  if (storedDate !== today) {
    localStorage.setItem(STORAGE_DAILY_DATE, today);
    count = 0;
  }

  localStorage.setItem(STORAGE_DAILY_COUNT, String(count + 1));
}
