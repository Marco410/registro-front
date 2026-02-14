export const logger = {
  error: (message: string, context?: Record<string, unknown>) => {
    if (typeof window !== "undefined") {
      console.error(`[Auth] ${message}`, context ?? "");
    }
  },
};
