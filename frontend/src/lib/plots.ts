// Type pour les statuts de demande, utilisé partout
export type RequestStatus = "pending" | "approved" | "rejected" | "accepted";

export interface Plot {
  id: number;
  name: string;
  surface: string | number;
  status?: string;
  soil_type?: string;
  image?: string | File;
  current_plant?: string;
  plant_emoji?: string;
  occupant?: string;
  occupantid?: number | null;
  history?: string[];
  _file?: File;

  // Propriétés enrichies par le backend
  requestStatus?: RequestStatus | null;
  requestingMemberId?: number | null;

  // ✅ AJOUT : Propriétés calculées côté frontend
  isCurrentUserOccupant?: boolean;
  isCurrentUserRequesting?: boolean;
}
