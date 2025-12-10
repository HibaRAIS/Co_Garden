import axios from "axios";
import { Plot } from "../lib/plots";

const API_URL = `/api/plots`;

export interface Member {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: "admin" | "membre";
  join_date: string;
  skills?: string;
}

export interface Plant {
  id: number;
  name: string;
}

// --- Création d'une instance Axios dédiée ---
const apiClient = axios.create({
  baseURL: API_URL,
});

// --- Intercepteur pour ajouter le token à chaque requête ---
apiClient.interceptors.request.use(
  (config) => {
    // On utilise "Token", comme défini dans la page de Login
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Le service utilise maintenant `apiClient` ---
export const plotService = {
  async getAll(): Promise<Plot[]> {
    const response = await apiClient.get("/"); // Admin only
    return response.data;
  },

  async getMemberPlots(): Promise<Plot[]> {
    const response = await apiClient.get("/member-view"); // Member access
    return response.data;
  },

  async getAvailableMembers(): Promise<Member[]> {
    const response = await apiClient.get("/available-members");
    return response.data;
  },

  async getAvailablePlants(): Promise<Plant[]> {
    const response = await apiClient.get("/available-plants");
    return response.data;
  },

  async create(plotData: any): Promise<Plot> {
    const formData = new FormData();
    Object.keys(plotData).forEach((key) => {
      if (key === "_file" && plotData[key]) {
        formData.append("image", plotData[key]);
      } else if (key !== "_file") {
        formData.append(key, String(plotData[key]));
      }
    });

    const response = await apiClient.post("/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  async update(id: number, plotData: any): Promise<Plot> {
    const formData = new FormData();

    // On ajoute tous les champs textuels
    Object.keys(plotData).forEach((key) => {
      // On exclut les champs liés à l'image pour les gérer séparément
      if (key !== "image" && key !== "_file") {
        formData.append(key, String(plotData[key]));
      }
    });

    // --- GESTION INTELLIGENTE DE L'IMAGE ---
    if (plotData._file) {
      // Cas 1: L'utilisateur a uploadé un NOUVEAU fichier.
      // On envoie le fichier, le backend écrasera l'ancien.
      formData.append("image", plotData._file);
    } else if (plotData.image) {
      // Cas 2: PAS de nouveau fichier, mais il y a une URL d'image existante.
      // On doit renvoyer cette URL pour dire au backend: "Garde celle-là !".
      // SANS cette ligne, le backend recevrait un champ 'image' vide et effacerait l'image.
      formData.append("image", plotData.image);
    }
    // Note: Si `plotData._file` et `plotData.image` sont tous les deux vides,
    // aucun champ 'image' n'est envoyé, ce qui est correct si l'utilisateur veut supprimer l'image.

    const response = await apiClient.put(`/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    // On s'assure que le backend renvoie bien la parcelle mise à jour directement
    return response.data;
  },

  async assign(plotId: number, occupantId: number): Promise<Plot> {
    const response = await apiClient.put(`/${plotId}/assign`, { occupantId });
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(`/${id}`);
  },

  // ===========================================
  //  FONCTIONS POUR LE MEMBRE
  // ===========================================

  /**
   * Récupère la liste de toutes les parcelles pour la vue membre.
   * Appelle la route GET /member-view
   */
  async getAllForMember(): Promise<Plot[]> {
    const response = await apiClient.get("/member-view");
    return response.data;
  },

  /**
   * Envoie une demande d'assignation pour une parcelle.
   * Appelle la route POST /request-assignment
   */
  async requestAssignment(plotId: number): Promise<any> {
    const response = await apiClient.post("/request-assignment", { plotId });
    return response.data;
  },

  // ===========================================
  // NOUVELLES FONCTIONS ADMIN POUR LES DEMANDES
  // ===========================================

  async getPendingRequests(): Promise<any[]> {
    const response = await apiClient.get("/assignment-requests/pending");
    return response.data;
  },

  async getAllRequests(): Promise<any[]> {
    const response = await apiClient.get("/assignment-requests/all");
    return response.data;
  },

  async approveRequest(requestId: number): Promise<any> {
    const response = await apiClient.post(
      `/assignment-requests/${requestId}/approve`
    );
    return response.data;
  },

  async rejectRequest(requestId: number): Promise<any> {
    const response = await apiClient.post(
      `/assignment-requests/${requestId}/reject`
    );
    return response.data;
  },

  async deleteRequest(requestId: number): Promise<any> {
    const response = await apiClient.delete(
      `/assignment-requests/${requestId}`
    );
    return response.data;
  },
};
