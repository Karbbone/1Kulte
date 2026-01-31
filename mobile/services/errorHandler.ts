export enum ErrorType {
  NETWORK = 'NETWORK',
  TIMEOUT = 'TIMEOUT',
  SERVER = 'SERVER',
  CLIENT = 'CLIENT',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  statusCode?: number;
  originalError?: unknown;
}

export class ErrorHandler {
  static handle(error: unknown): AppError {
    // Erreur réseau (pas de connexion, API down, DNS failed, etc.)
    if (error instanceof TypeError && error.message.includes('Network request failed')) {
      return {
        type: ErrorType.NETWORK,
        message: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet ou réessayez plus tard.',
        originalError: error,
      };
    }

    // Erreur timeout
    if (error instanceof Error && error.message.includes('timeout')) {
      return {
        type: ErrorType.TIMEOUT,
        message: 'La requête a pris trop de temps. Vérifiez votre connexion internet et réessayez.',
        originalError: error,
      };
    }

    // Erreur parsing JSON (serveur down ou réponse invalide)
    if (error instanceof SyntaxError ||
        (error instanceof Error && error.message.toLowerCase().includes('json'))) {
      return {
        type: ErrorType.SERVER,
        message: 'Le serveur a renvoyé une réponse invalide. Veuillez réessayer plus tard.',
        originalError: error,
      };
    }

    // Erreur avec notre structure personnalisée (venant de l'API)
    if (this.isAppError(error)) {
      return error;
    }

    // Erreur standard avec message
    if (error instanceof Error) {
      return {
        type: ErrorType.UNKNOWN,
        message: error.message,
        originalError: error,
      };
    }

    // Erreur complètement inconnue
    return {
      type: ErrorType.UNKNOWN,
      message: 'Une erreur inattendue est survenue. Veuillez réessayer.',
      originalError: error,
    };
  }

  static isAppError(error: unknown): error is AppError {
    return (
      typeof error === 'object' &&
      error !== null &&
      'type' in error &&
      'message' in error
    );
  }

  static getUserMessage(error: AppError): string {
    // Retourne le message utilisateur approprié selon le type d'erreur
    switch (error.type) {
      case ErrorType.NETWORK:
        return error.message;
      case ErrorType.TIMEOUT:
        return error.message;
      case ErrorType.SERVER:
        return error.statusCode && error.statusCode >= 500
          ? `Erreur serveur (${error.statusCode}). Veuillez réessayer plus tard.`
          : error.message;
      case ErrorType.CLIENT:
        return error.message;
      case ErrorType.VALIDATION:
        return error.message;
      default:
        return error.message || 'Une erreur inattendue est survenue.';
    }
  }

  static logError(error: AppError, context?: string): void {
    // En développement, log l'erreur complète
    if (__DEV__) {
      console.group(`❌ Error ${context ? `[${context}]` : ''}`);
      console.log('Type:', error.type);
      console.log('Message:', error.message);
      if (error.statusCode) {
        console.log('Status Code:', error.statusCode);
      }
      if (error.originalError) {
        console.log('Original Error:', error.originalError);
      }
      console.groupEnd();
    }

    // En production, vous pouvez envoyer à un service de monitoring (Sentry, etc.)
    // if (!__DEV__) {
    //   Sentry.captureException(error.originalError || error);
    // }
  }
}
