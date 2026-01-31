import { ErrorHandler, ErrorType, type AppError } from './errorHandler';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
const REQUEST_TIMEOUT = 15000; // 15 secondes

interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    points: number;
  };
  token: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

export type CulturalPlaceType = 'art' | 'patrimoine' | 'mythe' | 'musique';

export interface CulturalPlace {
  id: string;
  name: string;
  description: string;
  postCode: string;
  city: string;
  latitude: number;
  longitude: number;
  type: CulturalPlaceType;
  createdAt: string;
  updatedAt: string;
  favoriteCount?: number;
}

export interface Favorite {
  id: string;
  culturalPlace: CulturalPlace;
  createdAt: string;
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestInit,
    timeout: number = REQUEST_TIMEOUT
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutError: AppError = {
          type: ErrorType.TIMEOUT,
          message:
            'La requête a pris trop de temps. Vérifiez votre connexion internet et réessayez.',
          originalError: error,
        };
        ErrorHandler.logError(timeoutError, 'API Timeout');
        throw timeoutError;
      }

      throw error;
    }
  }

  private async safeJsonParse<T>(response: Response): Promise<T> {
    try {
      return await response.json();
    } catch (error) {
      const parseError: AppError = {
        type: ErrorType.SERVER,
        message:
          'Le serveur a renvoyé une réponse invalide. Il est peut-être temporairement indisponible.',
        statusCode: response.status,
        originalError: error,
      };
      ErrorHandler.logError(parseError, 'JSON Parse Error');
      throw parseError;
    }
  }

  private async handleErrorResponse(
    response: Response,
    defaultMessage: string
  ): Promise<never> {
    let errorMessage = defaultMessage;
    let apiError: ApiError | null = null;

    try {
      apiError = await response.json();
      errorMessage = apiError?.message || defaultMessage;
    } catch {
      errorMessage = this.getErrorMessageFromStatus(
        response.status,
        defaultMessage
      );
    }

    const appError: AppError = {
      type: response.status >= 500 ? ErrorType.SERVER : ErrorType.CLIENT,
      message: errorMessage,
      statusCode: response.status,
      originalError: apiError,
    };

    ErrorHandler.logError(appError, `HTTP ${response.status}`);
    throw appError;
  }

  private getErrorMessageFromStatus(
    status: number,
    defaultMessage: string
  ): string {
    switch (status) {
      case 400:
        return 'Requête invalide. Vérifiez les informations saisies.';
      case 401:
        return 'Email ou mot de passe incorrect.';
      case 403:
        return 'Accès refusé.';
      case 404:
        return "Service non trouvé. Vérifiez la configuration de l'API.";
      case 409:
        return 'Ce compte existe déjà.';
      case 422:
        return 'Les données fournies sont invalides.';
      case 429:
        return 'Trop de tentatives. Veuillez réessayer dans quelques minutes.';
      case 500:
      case 502:
      case 503:
      case 504:
        return 'Le serveur rencontre des difficultés. Veuillez réessayer plus tard.';
      default:
        return defaultMessage;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(response, 'Erreur de connexion');
      }

      return await this.safeJsonParse<LoginResponse>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, 'Login');
      throw appError;
    }
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    newsletter?: boolean;
  }): Promise<LoginResponse['user']> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await this.handleErrorResponse(response, "Erreur lors de l'inscription");
      }

      return await this.safeJsonParse<LoginResponse['user']>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, 'Register');
      throw appError;
    }
  }

  async getPopularPlaces(): Promise<CulturalPlace[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/cultural-places/popular`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          'Erreur lors de la récupération des lieux populaires'
        );
      }

      return await this.safeJsonParse<CulturalPlace[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, 'GetPopularPlaces');
      throw appError;
    }
  }

  async getRecommendations(token: string): Promise<CulturalPlace[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/cultural-places/recommendations`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          'Erreur lors de la récupération des recommandations'
        );
      }

      return await this.safeJsonParse<CulturalPlace[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, 'GetRecommendations');
      throw appError;
    }
  }

  async getFavorites(token: string): Promise<Favorite[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/favorites/me`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          'Erreur lors de la récupération des favoris'
        );
      }

      return await this.safeJsonParse<Favorite[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, 'GetFavorites');
      throw appError;
    }
  }

  async addFavorite(token: string, culturalPlaceId: string): Promise<Favorite> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/favorites/${culturalPlaceId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de l'ajout aux favoris"
        );
      }

      return await this.safeJsonParse<Favorite>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, 'AddFavorite');
      throw appError;
    }
  }

  async removeFavorite(token: string, culturalPlaceId: string): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/favorites/${culturalPlaceId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          'Erreur lors de la suppression du favori'
        );
      }
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, 'RemoveFavorite');
      throw appError;
    }
  }
}

export const api = new ApiService();
export type { LoginResponse };
