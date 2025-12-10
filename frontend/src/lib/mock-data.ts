export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  avatar?: string;
  joinedDate: string;
}

export interface Plot {
  id: string;
  name: string;
  status: 'occupied' | 'available';
  occupant?: string;
  occupantId?: string;
  currentPlant?: string;
  plantEmoji?: string;
  surface: string;
  soilType: string;
  image: string;
  history: string[];
}

export interface Plant {
  id: string;
  commonName: string;
  latinName: string;
  season: string;
  watering: string;
  image: string;
  description: string;
  plantingPeriod: string;
  harvestPeriod: string;
  care: string[];
}

export interface Task {
  id: string;
  title: string;
  date: string;
  assignedTo: string;
  assignedToId: string;
  status: 'pending' | 'in-progress' | 'completed';
  type: 'watering' | 'weeding' | 'harvest' | 'planting' | 'other';
  description?: string;
}

export interface GalleryPhoto {
  id: string;
  image: string;
  uploadedBy: string;
  uploadedById: string;
  date: string;
  plot?: string;
  plant?: string;
  caption?: string;
}

export const currentUser: User = {
  id: '1',
  name: 'Marie Dubois',
  email: 'marie.dubois@cogarden.com',
  role: 'admin',
  joinedDate: '2024-03-15'
};

export const users: User[] = [
  currentUser,
  {
    id: '2',
    name: 'Pierre Martin',
    email: 'pierre.martin@cogarden.com',
    role: 'member',
    joinedDate: '2024-04-20'
  },
  {
    id: '3',
    name: 'Sophie Lefebvre',
    email: 'sophie.lefebvre@cogarden.com',
    role: 'member',
    joinedDate: '2024-05-10'
  },
  {
    id: '4',
    name: 'Lucas Bernard',
    email: 'lucas.bernard@cogarden.com',
    role: 'member',
    joinedDate: '2024-06-05'
  }
];

export const plots: Plot[] = [
  {
    id: '1',
    name: 'Parcelle A1',
    status: 'occupied',
    occupant: 'Marie Dubois',
    occupantId: '1',
    currentPlant: 'Tomates',
    plantEmoji: '🍅',
    surface: '12 m²',
    soilType: 'Argileux',
    image: 'https://images.unsplash.com/photo-1536236309440-b29f95582e89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGUlMjBnYXJkZW4lMjB0b21hdG9lc3xlbnwxfHx8fDE3NjAxMjY4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    history: ['Mars 2024: Plantation de tomates', 'Avril 2024: Première récolte']
  },
  {
    id: '2',
    name: 'Parcelle A2',
    status: 'occupied',
    occupant: 'Pierre Martin',
    occupantId: '2',
    currentPlant: 'Herbes aromatiques',
    plantEmoji: '🌿',
    surface: '8 m²',
    soilType: 'Sableux',
    image: 'https://images.unsplash.com/photo-1675140570779-539f88a9d1ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiJTIwZ2FyZGVuJTIwcGxhbnRzfGVufDF8fHx8MTc2MDExOTgzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    history: ['Avril 2024: Plantation basilic et persil']
  },
  {
    id: '3',
    name: 'Parcelle B1',
    status: 'occupied',
    occupant: 'Sophie Lefebvre',
    occupantId: '3',
    currentPlant: 'Lavande',
    plantEmoji: '💜',
    surface: '10 m²',
    soilType: 'Calcaire',
    image: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGZpZWxkfGVufDF8fHx8MTc2MDEyNjg2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    history: ['Mai 2024: Plantation de lavande']
  },
  {
    id: '4',
    name: 'Parcelle B2',
    status: 'available',
    surface: '15 m²',
    soilType: 'Humifère',
    image: 'https://images.unsplash.com/photo-1590169834934-297bdaa63590?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBwYXJjZWxzJTIwYWVyaWFsfGVufDF8fHx8MTc2MDEyNjg2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    history: []
  },
  {
    id: '5',
    name: 'Parcelle C1',
    status: 'occupied',
    occupant: 'Lucas Bernard',
    occupantId: '4',
    currentPlant: 'Plantes grasses',
    plantEmoji: '🌵',
    surface: '6 m²',
    soilType: 'Sableux',
    image: 'https://images.unsplash.com/photo-1621512367176-03782e847fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwbGFudHN8ZW58MXx8fHwxNzYwMDY0NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    history: ['Juin 2024: Installation de succulentes']
  },
  {
    id: '6',
    name: 'Parcelle C2',
    status: 'available',
    surface: '10 m²',
    soilType: 'Argileux',
    image: 'https://images.unsplash.com/photo-1526381430565-e9a51363fbc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjBwbGFudHN8ZW58MXx8fHwxNzYwMTI2ODYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    history: []
  }
];

export const plants: Plant[] = [
  {
    id: '1',
    commonName: 'Tomate',
    latinName: 'Solanum lycopersicum',
    season: 'Printemps - Été',
    watering: 'Régulier (3-4x/semaine)',
    image: 'https://images.unsplash.com/photo-1536236309440-b29f95582e89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGUlMjBnYXJkZW4lMjB0b21hdG9lc3xlbnwxfHx8fDE3NjAxMjY4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Légume-fruit très populaire dans les jardins. Nécessite du soleil et un tuteur.',
    plantingPeriod: 'Mars - Mai',
    harvestPeriod: 'Juillet - Octobre',
    care: ['Tuteurer les plants', 'Arroser au pied', 'Retirer les gourmands']
  },
  {
    id: '2',
    commonName: 'Basilic',
    latinName: 'Ocimum basilicum',
    season: 'Été',
    watering: 'Modéré (2-3x/semaine)',
    image: 'https://images.unsplash.com/photo-1675140570779-539f88a9d1ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiJTIwZ2FyZGVuJTIwcGxhbnRzfGVufDF8fHx8MTc2MDExOTgzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Plante aromatique indispensable en cuisine. Aime la chaleur.',
    plantingPeriod: 'Avril - Juin',
    harvestPeriod: 'Juin - Octobre',
    care: ['Pincer les fleurs', 'Protéger du froid', 'Arrosage régulier']
  },
  {
    id: '3',
    commonName: 'Lavande',
    latinName: 'Lavandula angustifolia',
    season: 'Toute l\'année',
    watering: 'Faible (1x/semaine)',
    image: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGZpZWxkfGVufDF8fHx8MTc2MDEyNjg2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Plante méditerranéenne parfumée. Très résistante à la sécheresse.',
    plantingPeriod: 'Mars - Mai, Septembre - Octobre',
    harvestPeriod: 'Juin - Août',
    care: ['Tailler après floraison', 'Sol bien drainé', 'Plein soleil']
  },
  {
    id: '4',
    commonName: 'Succulentes',
    latinName: 'Crassulaceae',
    season: 'Toute l\'année',
    watering: 'Très faible (1x/2 semaines)',
    image: 'https://images.unsplash.com/photo-1621512367176-03782e847fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwbGFudHN8ZW58MXx8fHwxNzYwMDY0NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    description: 'Plantes grasses nécessitant peu d\'entretien. Idéales pour débutants.',
    plantingPeriod: 'Toute l\'année',
    harvestPeriod: 'N/A',
    care: ['Éviter l\'excès d\'eau', 'Sol drainant', 'Lumière indirecte']
  }
];

export const tasks: Task[] = [
  {
    id: '1',
    title: 'Arrosage des tomates',
    date: '2025-10-12',
    assignedTo: 'Marie Dubois',
    assignedToId: '1',
    status: 'pending',
    type: 'watering',
    description: 'Arroser les plants de tomates de la parcelle A1'
  },
  {
    id: '2',
    title: 'Désherbage parcelle B1',
    date: '2025-10-13',
    assignedTo: 'Sophie Lefebvre',
    assignedToId: '3',
    status: 'in-progress',
    type: 'weeding',
    description: 'Retirer les mauvaises herbes autour de la lavande'
  },
  {
    id: '3',
    title: 'Récolte basilic',
    date: '2025-10-14',
    assignedTo: 'Pierre Martin',
    assignedToId: '2',
    status: 'pending',
    type: 'harvest',
    description: 'Récolter les feuilles de basilic pour séchage'
  },
  {
    id: '4',
    title: 'Taille des plants',
    date: '2025-10-15',
    assignedTo: 'Lucas Bernard',
    assignedToId: '4',
    status: 'pending',
    type: 'other',
    description: 'Tailler les plantes grasses et retirer les parties mortes'
  },
  {
    id: '5',
    title: 'Préparation nouvelle parcelle',
    date: '2025-10-16',
    assignedTo: 'Marie Dubois',
    assignedToId: '1',
    status: 'pending',
    type: 'planting',
    description: 'Préparer la parcelle B2 pour plantation'
  },
  {
    id: '6',
    title: 'Arrosage général',
    date: '2025-10-11',
    assignedTo: 'Pierre Martin',
    assignedToId: '2',
    status: 'completed',
    type: 'watering',
    description: 'Arrosage de toutes les parcelles'
  }
];

export const galleryPhotos: GalleryPhoto[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1536236309440-b29f95582e89?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2ZWdldGFibGUlMjBnYXJkZW4lMjB0b21hdG9lc3xlbnwxfHx8fDE3NjAxMjY4NjF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    uploadedBy: 'Marie Dubois',
    uploadedById: '1',
    date: '2025-10-08',
    plot: 'Parcelle A1',
    plant: 'Tomates',
    caption: 'Première récolte de tomates cerises !'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1675140570779-539f88a9d1ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZXJiJTIwZ2FyZGVuJTIwcGxhbnRzfGVufDF8fHx8MTc2MDExOTgzM3ww&ixlib=rb-4.1.0&q=80&w=1080',
    uploadedBy: 'Pierre Martin',
    uploadedById: '2',
    date: '2025-10-07',
    plot: 'Parcelle A2',
    plant: 'Herbes',
    caption: 'Les herbes aromatiques se portent bien'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1499002238440-d264edd596ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYXZlbmRlciUyMGZpZWxkfGVufDF8fHx8MTc2MDEyNjg2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    uploadedBy: 'Sophie Lefebvre',
    uploadedById: '3',
    date: '2025-10-06',
    plot: 'Parcelle B1',
    plant: 'Lavande',
    caption: 'La lavande en pleine floraison'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1621512367176-03782e847fa2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjdWxlbnQlMjBwbGFudHN8ZW58MXx8fHwxNzYwMDY0NjY1fDA&ixlib=rb-4.1.0&q=80&w=1080',
    uploadedBy: 'Lucas Bernard',
    uploadedById: '4',
    date: '2025-10-05',
    plot: 'Parcelle C1',
    plant: 'Succulentes',
    caption: 'Collection de plantes grasses'
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1526381430565-e9a51363fbc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tdW5pdHklMjBnYXJkZW4lMjBwbGFudHN8ZW58MXx8fHwxNzYwMTI2ODYxfDA&ixlib=rb-4.1.0&q=80&w=1080',
    uploadedBy: 'Marie Dubois',
    uploadedById: '1',
    date: '2025-10-04',
    caption: 'Vue d\'ensemble du jardin partagé'
  },
  {
    id: '6',
    image: 'https://images.unsplash.com/photo-1590169834934-297bdaa63590?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBwYXJjZWxzJTIwYWVyaWFsfGVufDF8fHx8MTc2MDEyNjg2Mnww&ixlib=rb-4.1.0&q=80&w=1080',
    uploadedBy: 'Sophie Lefebvre',
    uploadedById: '3',
    date: '2025-10-03',
    plot: 'Parcelle B2',
    caption: 'Parcelle disponible - idéale pour légumes racines'
  }
];
