import { CitizenAlert } from '../types';

// Exemples inventés pour montrer l'écran : aucune ne vient de la mairie, du port ou des secours.
export const INITIAL_CITIZEN_ALERTS: CitizenAlert[] = [
  {
    id: 'alt-lgm-01',
    title: 'Exemple · Vigilance Canicule & Hydratation des Aînés',
    message: 'Pic de chaleur prévu cet après-midi (33°C). Voisins du Couchant et du Centre : pensez à vérifier vos aînés isolés et à leur apporter des boissons fraîches.',
    category: 'meteo',
    severity: 'vigilance',
    quartier: 'Le Couchant & Centre-Ville',
    timestamp: 'Aujourd\'hui à 11h15',
    authorName: 'Exemple fictif',
    authorRole: 'Démonstration, aucune alerte réelle',
    encrypted: true,
    signature: 'EXEMPLE',
    verified: false,
  },
  {
    id: 'alt-lgm-02',
    title: 'Exemple · Coupure d\'eau momentanée Résidence Les Caravelles',
    message: 'Intervention technique suite à une fuite sur colonne principale. Rétablissement prévu vers 16h30. Distribution de bouteilles organisée au hall B.',
    category: 'coupure',
    severity: 'info',
    quartier: 'Le Ponant',
    timestamp: 'Il y a 45 min',
    authorName: 'Exemple fictif',
    authorRole: 'Démonstration, aucune alerte réelle',
    encrypted: true,
    signature: 'EXEMPLE',
    verified: false,
  },
  {
    id: 'alt-lgm-03',
    title: 'Exemple · Recherche Chien Guide (Égaré secteur Point Zéro)',
    message: 'Golden retriever avec harnais guide bleu aperçu près de la plage du Point Zéro. Appartient à Marcel, 78 ans, malvoyant. Ne pas l\'effrayer, contacter le poste de secours.',
    category: 'secours',
    severity: 'critique',
    quartier: 'Point Zéro / Promenade',
    timestamp: 'Il y a 1h',
    authorName: 'Exemple fictif',
    authorRole: 'Démonstration, aucune alerte réelle',
    encrypted: true,
    signature: 'EXEMPLE',
    verified: false,
  }
];
