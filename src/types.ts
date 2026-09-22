export type UserMode = 'senior' | 'jeune' | 'tv';

export type TextSize = 'normal' | 'large' | 'xlarge' | 'giant';

export type ThemeId = 
  | 'light'           // Mode Clair classique & chaleureux
  | 'dark'            // Mode Sombre reposant
  | 'gold-white'      // Belles lettres d'or sur fond blanc/nacre
  | 'gold-dark'       // Or impérial sur fond noir nuit
  | 'mediterranean'   // Bleu azur & reflets dorés
  | 'high-contrast';  // Accessibilité contraste maximal

export type FontFamilyId = 
  | 'playfair' // Belles lettres nobles & or (Playfair Display)
  | 'cinzel'   // Gravure & or prestige (Cinzel)
  | 'lexend'   // Confort maximal pour la vue des aînés (Lexend)
  | 'outfit'   // Moderne & ronde chaleureuse (Outfit)
  | 'caveat'   // Manuscrite conviviale (Caveat)
  | 'jakarta'; // Standard épurée (Plus Jakarta Sans)

export interface ThemeConfig {
  themeId: ThemeId;
  fontFamily: FontFamilyId;
  textSize: TextSize;
}

export interface CommunityEvent {
  id: string;
  title: string;
  description: string;
  category: 'gouter' | 'jeux' | 'balade' | 'cafe' | 'apero' | 'nature' | 'animaux';
  categoryLabel: string;
  icon: string;
  date: string;
  time: string;
  location: string;
  quartier: string;
  organizerName: string;
  organizerAge?: number;
  organizerRole: 'senior' | 'jeune' | 'benevole';
  organizerAvatar: string;
  attendees: string[];
  maxAttendees?: number;
  whatToBring?: string;
  badge?: string;
}

export interface CityInfo {
  id: string;
  name: string;
  postalCode: string;
  department: string;
  region: string;
  badge: 'pilote' | 'active' | 'prochainement';
  description: string;
  quartiers: string[];
  activeSeniors: number;
  activeYouth: number;
  totalHelpsGiven: number;
}

export type InitiativeCategory =
  | 'entraide'
  | 'mobilite'
  | 'nature'
  | 'troc'
  | 'cuisine'
  | 'culture'
  | 'famille'
  | 'sante';

export interface Initiative {
  id: string;
  title: string;
  category: InitiativeCategory;
  categoryLabel: string;
  icon: string;
  shortDesc: string;
  fullDesc: string;
  quartier: string;
  urgencyLevel?: 'normal' | 'eleve' | 'permanent';
  seniorBenefit: string;
  youthBenefit: string;
  xpReward: number;
  participantsCount: number;
  status: 'disponible' | 'en_cours' | 'rejoint';
  actionType: 'demande' | 'offre' | 'activite' | 'partage';
}

export interface EmergencyContact {
  id: string;
  name: string;
  role: string;
  phone: string;
  distance?: string;
  isAvailable: boolean;
  avatar: string;
}

export type HelpRequestStatus = 'en_attente' | 'pris_en_charge' | 'en_route' | 'arrive' | 'resolu';

export interface HelpRequest {
  id: string;
  seniorName: string;
  age: number;
  quartier: string;
  seniorAddress?: string;
  seniorPhone?: string;
  timeAgo: string;
  title: string;
  description: string;
  urgency: 'urgent' | 'aujourd_hui' | 'flexible';
  category: InitiativeCategory;
  videoUrl?: string;
  status: HelpRequestStatus;
  helperName?: string;
  helperPhone?: string;
  helperAvatar?: string;
  helperRole?: string;
  estimatedArrivalTime?: string; // ex: "14h30", "Dans 15 min"
  arrivalTransport?: string; // ex: "À pied (5 min)", "À vélo", "En voiture"
  arrivalNote?: string; // ex: "Je viens avec ma boîte à outils et mes tournevis !"
  acceptedAt?: string;
  enRouteAt?: string;
  arrivedAt?: string;
  isDelayNotified?: boolean;
}

export interface NeighborProfile {
  id: string;
  name: string;
  age: number;
  role: 'senior' | 'jeune' | 'benevole';
  quartier: string;
  bio: string;
  talents: string[];
  verified: boolean;
  helpsCount: number;
  points: number;
  badges: string[];
  avatar: string;
}

export interface ToolLoan {
  id: string;
  toolName: string;
  category: 'bricolage' | 'jardin' | 'maison' | 'cuisine' | 'loisirs';
  icon: string;
  toolPhotoUrl?: string;
  condition: 'neuf' | 'excellent' | 'bon';
  lenderName: string;
  lenderPhone?: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerQuartier: string;
  borrowerAvatar?: string;
  loanDate: string;
  expectedReturnDate: string;
  expectedReturnTime?: string;
  actualReturnDate?: string;
  status: 'en_cours' | 'rendu' | 'retard';
  notes?: string;
  trustGuarantee: string; // "Garantie Voisin de Confiance ProxiLien"
  receiptCode: string; // ex: "PRET-LGM-849"
  smsConfirmationSent: boolean;
}
