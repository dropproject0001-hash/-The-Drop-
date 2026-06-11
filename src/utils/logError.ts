// src/utils/logError.ts

export const logError = (error: any, context?: Record<string, any>) => {
  console.error(error);
  
  // In a production environment, you might integrate with a tool like Sentry here:
  // if (import.meta.env.PROD) {
  //   Sentry.captureException(error, {
  //     extra: context,
  //   });
  // }
};
