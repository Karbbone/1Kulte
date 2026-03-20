import { ErrorHandler, ErrorType, type AppError } from "./errorHandler";

const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000";
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

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  points: number;
  profilePictureUrl?: string;
}

interface ApiError {
  message: string;
  statusCode: number;
}

export type CulturalPlaceType = "art" | "patrimoine" | "mythe" | "musique";

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

export interface QcmAnswer {
  id: string;
  answer: string;
  isCorrect: boolean;
}

export interface QcmQuestion {
  id: string;
  question: string;
  image: string | null;
  imageUrl: string | null;
  point: number;
  answers: QcmAnswer[];
}

export interface Trail {
  id: string;
  name: string;
  description: string;
  durationMinute: number;
  difficulty: string;
  isActive: boolean;
  culturalPlace: CulturalPlace;
  questions: QcmQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface AnswerResult {
  isCorrect: boolean;
  pointsEarned: number;
  message: string;
}

export interface TrailProgress {
  trailId: string;
  totalQuestions: number;
  answeredQuestions: number;
  correctAnswers: number;
  totalPoints: number;
  pointsEarned: number;
  missingPoints: number;
  completed: boolean;
}

export interface TrailHistoryItem {
  trail: {
    id: string;
    name: string;
    description: string;
    durationMinute: number;
    difficulty: string;
  };
  culturalPlace: CulturalPlace;
  lastPlayedAt: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  imageUrl?: string;
}

export type RewardDeliveryMode = "home" | "relay";
export type RewardRelayOption = "standard" | "priority";

export interface RewardCartItem {
  id: string;
  quantity: number;
  lineTotal: number;
  reward: Reward;
}

export interface RewardCart {
  id: string;
  deliveryMode: RewardDeliveryMode;
  relayOption: RewardRelayOption;
  homeRecipient: string | null;
  homeAddressLine1: string | null;
  homeAddressLine2: string | null;
  homePostalCode: string | null;
  homeCity: string | null;
  relayPointName: string | null;
  relayAddress: string | null;
  useWalletDiscount: boolean;
  items: RewardCartItem[];
  subtotal: number;
  deliveryFee: number;
  availablePoints: number;
  usedPoints: number;
  walletDiscount: number;
  total: number;
}

export interface UserReward {
  id: string;
  reward: Reward;
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
    timeout: number = REQUEST_TIMEOUT,
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

      if (error instanceof Error && error.name === "AbortError") {
        const timeoutError: AppError = {
          type: ErrorType.TIMEOUT,
          message:
            "La requête a pris trop de temps. Vérifiez votre connexion internet et réessayez.",
          originalError: error,
        };
        ErrorHandler.logError(timeoutError, "API Timeout");
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
          "Le serveur a renvoyé une réponse invalide. Il est peut-être temporairement indisponible.",
        statusCode: response.status,
        originalError: error,
      };
      ErrorHandler.logError(parseError, "JSON Parse Error");
      throw parseError;
    }
  }

  private async handleErrorResponse(
    response: Response,
    defaultMessage: string,
  ): Promise<never> {
    let errorMessage = defaultMessage;
    let apiError: ApiError | null = null;

    try {
      apiError = await response.json();
      errorMessage = apiError?.message || defaultMessage;
    } catch {
      errorMessage = this.getErrorMessageFromStatus(
        response.status,
        defaultMessage,
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
    defaultMessage: string,
  ): string {
    switch (status) {
      case 400:
        return "Requête invalide. Vérifiez les informations saisies.";
      case 401:
        return "Email ou mot de passe incorrect.";
      case 403:
        return "Accès refusé.";
      case 404:
        return "Service non trouvé. Vérifiez la configuration de l'API.";
      case 409:
        return "Ce compte existe déjà.";
      case 422:
        return "Les données fournies sont invalides.";
      case 429:
        return "Trop de tentatives. Veuillez réessayer dans quelques minutes.";
      case 500:
      case 502:
      case 503:
      case 504:
        return "Le serveur rencontre des difficultés. Veuillez réessayer plus tard.";
      default:
        return defaultMessage;
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(response, "Erreur de connexion");
      }

      return await this.safeJsonParse<LoginResponse>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "Login");
      throw appError;
    }
  }

  async getUserById(token: string, userId: string): Promise<UserProfile> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération de l'utilisateur",
        );
      }

      return await this.safeJsonParse<UserProfile>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetUserById");
      throw appError;
    }
  }

  async uploadProfilePicture(
    token: string,
    userId: string,
    imageUri: string,
  ): Promise<UserProfile> {
    try {
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "profile.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";

      formData.append("image", {
        uri: imageUri,
        name: filename,
        type,
      } as unknown as Blob);

      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/users/${userId}/profile-picture`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de l'upload de la photo de profil",
        );
      }

      return await this.safeJsonParse<UserProfile>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "UploadProfilePicture");
      throw appError;
    }
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    newsletter?: boolean;
  }): Promise<LoginResponse["user"]> {
    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de l'inscription",
        );
      }

      return await this.safeJsonParse<LoginResponse["user"]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "Register");
      throw appError;
    }
  }

  async getCulturalPlaces(): Promise<CulturalPlace[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/cultural-places`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération des lieux culturels",
        );
      }

      return await this.safeJsonParse<CulturalPlace[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetCulturalPlaces");
      throw appError;
    }
  }

  async getCulturalPlaceById(id: string): Promise<CulturalPlace> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/cultural-places/${id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération du lieu culturel",
        );
      }

      return await this.safeJsonParse<CulturalPlace>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetCulturalPlaceById");
      throw appError;
    }
  }

  async getPopularPlaces(): Promise<CulturalPlace[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/cultural-places/popular`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération des lieux populaires",
        );
      }

      return await this.safeJsonParse<CulturalPlace[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetPopularPlaces");
      throw appError;
    }
  }

  async getRecommendations(token: string): Promise<CulturalPlace[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/cultural-places/recommendations`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération des recommandations",
        );
      }

      return await this.safeJsonParse<CulturalPlace[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetRecommendations");
      throw appError;
    }
  }

  async getFavorites(token: string): Promise<Favorite[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/favorites/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération des favoris",
        );
      }

      return await this.safeJsonParse<Favorite[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetFavorites");
      throw appError;
    }
  }

  async addFavorite(token: string, culturalPlaceId: string): Promise<Favorite> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/favorites/${culturalPlaceId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de l'ajout aux favoris",
        );
      }

      return await this.safeJsonParse<Favorite>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "AddFavorite");
      throw appError;
    }
  }

  async getQcmQuestions(trailId: string): Promise<QcmQuestion[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/qcm/trail/${trailId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération des questions",
        );
      }

      return await this.safeJsonParse<QcmQuestion[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetQcmQuestions");
      throw appError;
    }
  }

  async getTrailById(id: string): Promise<Trail> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/trails/${id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération du parcours",
        );
      }

      return await this.safeJsonParse<Trail>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetTrailById");
      throw appError;
    }
  }

  async getTrailStatus(token: string, trailId: string): Promise<TrailProgress> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/qcm/trail/${trailId}/status`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération du statut du parcours",
        );
      }

      return await this.safeJsonParse<TrailProgress>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetTrailStatus");
      throw appError;
    }
  }

  async submitQcmAnswer(
    token: string,
    questionId: string,
    answerId: string,
  ): Promise<AnswerResult> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/qcm/question/${questionId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ answerId }),
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la soumission de la réponse",
        );
      }

      return await this.safeJsonParse<AnswerResult>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "SubmitQcmAnswer");
      throw appError;
    }
  }

  async getTrailHistory(token: string): Promise<TrailHistoryItem[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/qcm/trail-history`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération de l'historique",
        );
      }

      return await this.safeJsonParse<TrailHistoryItem[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetTrailHistory");
      throw appError;
    }
  }

  async getRewards(): Promise<Reward[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération des récompenses",
        );
      }

      return await this.safeJsonParse<Reward[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetRewards");
      throw appError;
    }
  }

  async getRewardById(rewardId: string): Promise<Reward> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/${rewardId}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération de la récompense",
        );
      }

      return await this.safeJsonParse<Reward>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetRewardById");
      throw appError;
    }
  }

  async purchaseReward(token: string, rewardId: string): Promise<UserReward> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/${rewardId}/purchase`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de l'achat de la récompense",
        );
      }

      return await this.safeJsonParse<UserReward>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "PurchaseReward");
      throw appError;
    }
  }

  async getRewardCart(token: string): Promise<RewardCart> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/cart`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération du panier",
        );
      }

      return await this.safeJsonParse<RewardCart>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetRewardCart");
      throw appError;
    }
  }

  async addRewardToCart(
    token: string,
    rewardId: string,
    quantity: number = 1,
  ): Promise<RewardCart> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/cart/items`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rewardId, quantity }),
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de l'ajout au panier",
        );
      }

      return await this.safeJsonParse<RewardCart>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "AddRewardToCart");
      throw appError;
    }
  }

  async updateRewardCartItem(
    token: string,
    itemId: string,
    quantity: number,
  ): Promise<RewardCart> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/cart/items/${itemId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ quantity }),
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la mise à jour du panier",
        );
      }

      return await this.safeJsonParse<RewardCart>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "UpdateRewardCartItem");
      throw appError;
    }
  }

  async removeRewardCartItem(token: string, itemId: string): Promise<RewardCart> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/cart/items/${itemId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la suppression d'un article",
        );
      }

      return await this.safeJsonParse<RewardCart>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "RemoveRewardCartItem");
      throw appError;
    }
  }

  async updateRewardCartDelivery(
    token: string,
    data: {
      deliveryMode: RewardDeliveryMode;
      homeRecipient?: string;
      homeAddressLine1?: string;
      homeAddressLine2?: string;
      homePostalCode?: string;
      homeCity?: string;
      relayPointName?: string;
      relayAddress?: string;
      relayOption?: RewardRelayOption;
    },
  ): Promise<RewardCart> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/cart/delivery`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la mise à jour de la livraison",
        );
      }

      return await this.safeJsonParse<RewardCart>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "UpdateRewardCartDelivery");
      throw appError;
    }
  }

  async updateRewardCartWalletDiscount(
    token: string,
    useWalletDiscount: boolean,
  ): Promise<RewardCart> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/cart/wallet-discount`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ useWalletDiscount }),
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la mise à jour de la cagnotte",
        );
      }

      return await this.safeJsonParse<RewardCart>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "UpdateRewardCartWalletDiscount");
      throw appError;
    }
  }

  async checkoutRewardCart(
    token: string,
  ): Promise<{ purchasedCount: number; total: number }> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/cart/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la validation de la commande",
        );
      }

      return await this.safeJsonParse<{ purchasedCount: number; total: number }>(
        response,
      );
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "CheckoutRewardCart");
      throw appError;
    }
  }

  async getMyRewards(token: string): Promise<UserReward[]> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/rewards/me`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la récupération de vos achats",
        );
      }

      return await this.safeJsonParse<UserReward[]>(response);
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "GetMyRewards");
      throw appError;
    }
  }

  async removeFavorite(token: string, culturalPlaceId: string): Promise<void> {
    try {
      const response = await this.fetchWithTimeout(
        `${this.baseUrl}/favorites/${culturalPlaceId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        await this.handleErrorResponse(
          response,
          "Erreur lors de la suppression du favori",
        );
      }
    } catch (error) {
      if (ErrorHandler.isAppError(error)) {
        throw error;
      }
      const appError = ErrorHandler.handle(error);
      ErrorHandler.logError(appError, "RemoveFavorite");
      throw appError;
    }
  }
}

export const api = new ApiService();
export type { LoginResponse };
