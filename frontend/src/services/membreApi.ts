const API_BASE_URL = "/api/membres/api";

export interface LoginResponse {
  message: string;
  member: Member;
  token: string;
}

export interface RegisterResponse {
  message: string;
  member: Member;
  token: string;
}

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

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  skills?: string;
  role?: "admin" | "membre";
}

export interface CreateMemberData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  skills?: string;
  role?: "membre";
}

export interface UpdateMemberData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  skills?: string;
}

class ApiService {
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem("token");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
    return {};
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.getAuthHeader(),
    };

    if (options.headers) {
      Object.assign(headers, options.headers as Record<string, string>);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Erreur API");
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Auth methods
  async register(data: RegisterData): Promise<RegisterResponse> {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async login(data: LoginData): Promise<LoginResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<Member> {
    return this.request("/auth/me");
  }

  async logout(): Promise<{ message: string }> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  // Members methods
  async getAllMembers(): Promise<{ members: Member[]; total: number }> {
    return this.request("/members");
  }

  async getMemberById(id: number): Promise<Member> {
    return this.request(`/members/${id}`);
  }

  async deleteMember(memberId: number): Promise<{ message: string }> {
    return this.request(`/members/${memberId}`, {
      method: "DELETE",
    });
  }

  async createMember(data: CreateMemberData): Promise<Member> {
    return this.request("/members", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async updateMember(
    memberId: number,
    data: UpdateMemberData
  ): Promise<Member> {
    return this.request(`/members/${memberId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
}

export const apiService = new ApiService();
