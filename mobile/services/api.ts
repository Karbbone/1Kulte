const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  token: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await fetch(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }

    return response.json();
  }

  async register(data: {
    email: string;
    password: string;
    newsletter?: boolean;
  }): Promise<LoginResponse['user']> {
    const response = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error: ApiError = await response.json();
      throw new Error(error.message || "Erreur lors de l'inscription");
    }

    return response.json();
  }
}

export const api = new ApiService();
export type { LoginResponse };
