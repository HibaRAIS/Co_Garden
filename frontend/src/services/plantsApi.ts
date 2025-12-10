// frontend/frontend Membre/src/services/plantsApi.ts

/// <reference types="vite/client" />

// API Configuration
const API_BASE_URL = "/api"; // Use proxy in development

// Types
export interface ApiComment {
  id: number;
  plant_id: number;
  user_id: string;
  author: string;
  content: string;
  created_at: string;
}

export interface ApiPlant {
  id: number;
  name: string;
  scientific_name?: string;
  type?: string;
  description?: string;
  care_instructions?: string;
  image_url?: string;
  created_at: string;
  comments?: ApiComment[];
}

export interface PaginationResponse<T> {
  data: T[];
  pagination: {
    skip: number;
    limit: number;
    total: number;
  };
}

// API Helper Function (Optimized with comprehensive error messages)
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
    });

    if (!response.ok) {
      // 1. Attempt to extract detailed error message from response JSON
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = response.statusText || errorMessage;
      }

      // 2. Add specific French messages for common HTTP errors
      if (response.status === 401) {
        errorMessage = "Non autorisé. Veuillez vous connecter.";
      } else if (response.status === 403) {
        errorMessage =
          "Accès interdit. Vous n'avez pas les permissions nécessaires.";
      } else if (response.status === 404) {
        errorMessage = "Ressource non trouvée.";
      } else if (response.status === 500) {
        errorMessage = "Erreur serveur. Veuillez réessayer plus tard.";
      }

      throw new Error(errorMessage);
    }

    // Handle 204 No Content for successful DELETE operations
    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error(
      "Erreur de connexion au serveur. Vérifiez que le catalogue est en ligne."
    );
  }
}

// Plant API Functions (Admin & Member)
export const plantsApi = {
  // Get all plants (Member/Admin)
  getAll: async (
    skip = 0,
    limit = 100
  ): Promise<PaginationResponse<ApiPlant>> => {
    return fetchAPI<PaginationResponse<ApiPlant>>(
      `/plants?skip=${skip}&limit=${limit}`
    );
  },

  // Search plants (Admin logic included for completeness)
  search: async (query: string): Promise<ApiPlant[]> => {
    return fetchAPI<ApiPlant[]>(
      `/plants/search?q=${encodeURIComponent(query)}`
    );
  },

  // Get single plant by ID (Member/Admin)
  getById: async (id: number): Promise<ApiPlant> => {
    return fetchAPI<ApiPlant>(`/plants/${id}`);
  },

  // Create new plant (Admin only - requires token)
  create: async (
    plant: Omit<ApiPlant, "id" | "created_at" | "comments">,
    token: string
  ): Promise<ApiPlant> => {
    return fetchAPI<ApiPlant>("/plants", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(plant),
    });
  },

  // Update plant (Admin only - requires token)
  update: async (
    id: number,
    plant: Partial<ApiPlant>,
    token: string
  ): Promise<ApiPlant> => {
    return fetchAPI<ApiPlant>(`/plants/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(plant),
    });
  },

  // Delete plant (Admin only - requires token)
  delete: async (id: number, token: string): Promise<void> => {
    return fetchAPI<void>(`/plants/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  // Add comment to plant (Member/Admin - requires token)
  addComment: async (
    plantId: number,
    comment: { content: string; author?: string }, // Simplified type since author_id is handled by backend
    token: string
  ): Promise<ApiComment> => {
    return fetchAPI<ApiComment>(`/plants/${plantId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(comment),
    });
  },

  // Delete comment (Admin only - requires token)
  deleteComment: async (
    plantId: number,
    commentId: number,
    token: string
  ): Promise<void> => {
    return fetchAPI<void>(`/plants/${plantId}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },
};
