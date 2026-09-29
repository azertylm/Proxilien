/**
 * Service de Géolocalisation Obligatoire — La Grande-Motte (34280)
 * ALPHABETTE SASU — ProxiLien
 * 
 * Règle d'éligibilité :
 * La 1ère année est 100 % gratuite pour tous les habitants, aînés, associations
 * et commerces de La Grande-Motte.
 * La géolocalisation est OBLIGATOIRE pour valider l'appartenance au territoire communal.
 */

export interface LGMGeoResult {
  verified: boolean;
  isLGM: boolean;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
  quartier?: string;
  checkedAt: string;
  method: 'gps' | 'simulation' | 'postal_attestation';
  error?: string;
}

// Coordonnées du centre communal de La Grande-Motte (Hôtel de Ville & Port)
export const LGM_CENTER = {
  lat: 43.5592,
  lng: 4.0844,
  radiusKm: 6.5, // Rayon couvrant tout le territoire communal (Couchant, Ponant, Haute Plage, etc.)
};

export const LGM_QUARTIERS = [
  { name: 'Le Couchant', lat: 43.5542, lng: 4.0705, desc: 'Résidences marines & plage ouest' },
  { name: 'Centre-Ville / Port', lat: 43.5592, lng: 4.0844, desc: 'Mairie, commerces du port & pyramides' },
  { name: 'Le Point Zéro', lat: 43.5581, lng: 4.0886, desc: 'Front de mer historique & promenade' },
  { name: 'Le Ponant', lat: 43.5685, lng: 4.0924, desc: 'Étang du Ponant, verdure & calme' },
  { name: 'Haute Plage', lat: 43.5654, lng: 4.0952, desc: 'Plage est & pinède' },
];

const STORAGE_KEY = 'proxilien_lgm_geo_status';

/**
 * Calcule la distance orthodromique (en kilomètres) entre deux coordonnées GPS via la formule de Haversine
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Rayon moyen de la Terre en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 100) / 100;
}

/**
 * Détermine le quartier grand-mottois le plus proche
 */
export function findNearestLGMQuartier(lat: number, lng: number): string {
  let nearest = LGM_QUARTIERS[0].name;
  let minDistance = Infinity;

  for (const q of LGM_QUARTIERS) {
    const dist = calculateHaversineDistanceKm(lat, lng, q.lat, q.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = q.name;
    }
  }

  return nearest;
}

/**
 * Récupère le statut de géolocalisation persisté dans localStorage
 */
export function getStoredLGMGeoStatus(): LGMGeoResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: LGMGeoResult = JSON.parse(raw);
      return parsed;
    }
  } catch (e) {
    console.warn('[geolocationService] Erreur lecture localStorage:', e);
  }

  // Par défaut, vérification initiale automatique : statut non vérifié
  return {
    verified: false,
    isLGM: false,
    checkedAt: '',
    method: 'gps',
  };
}

/**
 * Sauvegarde le statut de géolocalisation
 */
export function saveLGMGeoStatus(result: LGMGeoResult): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(result));
  } catch (e) {
    console.warn('[geolocationService] Erreur écriture localStorage:', e);
  }
}

/**
 * Vérifie la géolocalisation réelle via le navigateur (GPS HTML5)
 */
export async function verifyRealLGMGeolocation(): Promise<LGMGeoResult> {
  if (!navigator.geolocation) {
    const result: LGMGeoResult = {
      verified: false,
      isLGM: false,
      checkedAt: new Date().toISOString(),
      method: 'gps',
      error: "La géolocalisation n'est pas supportée par votre navigateur.",
    };
    saveLGMGeoStatus(result);
    return result;
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const distanceKm = calculateHaversineDistanceKm(lat, lng, LGM_CENTER.lat, LGM_CENTER.lng);
        const isLGM = distanceKm <= LGM_CENTER.radiusKm;
        const quartier = isLGM ? findNearestLGMQuartier(lat, lng) : undefined;

        const result: LGMGeoResult = {
          verified: true,
          isLGM,
          latitude: lat,
          longitude: lng,
          distanceKm,
          quartier,
          checkedAt: new Date().toISOString(),
          method: 'gps',
          error: isLGM
            ? undefined
            : `Position détectée hors périmètre communal (${distanceKm} km du centre de La Grande-Motte).`,
        };

        saveLGMGeoStatus(result);
        resolve(result);
      },
      (error) => {
        let msg = "Impossible d'obtenir votre position GPS.";
        if (error.code === error.PERMISSION_DENIED) {
          msg = "Autorisation GPS refusée. Veuillez autoriser la localisation pour valider votre gratuité 1ère année.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          msg = "Signal GPS indisponible momentanément.";
        } else if (error.code === error.TIMEOUT) {
          msg = "Délai d'attente GPS dépassé.";
        }

        const result: LGMGeoResult = {
          verified: false,
          isLGM: false,
          checkedAt: new Date().toISOString(),
          method: 'gps',
          error: msg,
        };

        saveLGMGeoStatus(result);
        resolve(result);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

/**
 * Permet de simuler une position grand-mottoise pour démonstration, tests ou évaluation
 */
export function simulateLGMGeolocation(quartierName: string, forceOutside = false): LGMGeoResult {
  if (forceOutside) {
    // Coordonnées de Montpellier (hors commune, ~20 km)
    const lat = 43.6107;
    const lng = 3.8767;
    const distanceKm = calculateHaversineDistanceKm(lat, lng, LGM_CENTER.lat, LGM_CENTER.lng);

    const result: LGMGeoResult = {
      verified: true,
      isLGM: false,
      latitude: lat,
      longitude: lng,
      distanceKm,
      quartier: 'Extérieur (Montpellier)',
      checkedAt: new Date().toISOString(),
      method: 'simulation',
      error: `Position simulée hors La Grande-Motte (${distanceKm} km). Formules standards 39€/59€ applicables après 7 jours d'essai.`,
    };

    saveLGMGeoStatus(result);
    return result;
  }

  const quartier = LGM_QUARTIERS.find((q) => q.name === quartierName) || LGM_QUARTIERS[1];
  const distanceKm = calculateHaversineDistanceKm(quartier.lat, quartier.lng, LGM_CENTER.lat, LGM_CENTER.lng);

  const result: LGMGeoResult = {
    verified: true,
    isLGM: true,
    latitude: quartier.lat,
    longitude: quartier.lng,
    distanceKm,
    quartier: quartier.name,
    checkedAt: new Date().toISOString(),
    method: 'simulation',
  };

  saveLGMGeoStatus(result);
  return result;
}

/**
 * Attestation manuelle sur l'honneur avec code postal 34280 (secours)
 */
export function attestPostalLGM(address: string): LGMGeoResult {
  const result: LGMGeoResult = {
    verified: true,
    isLGM: true,
    latitude: LGM_CENTER.lat,
    longitude: LGM_CENTER.lng,
    distanceKm: 0.1,
    quartier: 'Centre-Ville / Port (34280)',
    checkedAt: new Date().toISOString(),
    method: 'postal_attestation',
  };

  saveLGMGeoStatus(result);
  return result;
}

/**
 * Réinitialise la vérification
 */
export function resetLGMGeoStatus(): LGMGeoResult {
  const result: LGMGeoResult = {
    verified: false,
    isLGM: false,
    checkedAt: '',
    method: 'gps',
  };
  saveLGMGeoStatus(result);
  return result;
}
