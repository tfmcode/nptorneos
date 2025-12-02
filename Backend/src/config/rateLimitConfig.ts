import rateLimit from "express-rate-limit";

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Demasiadas peticiones desde esta IP, intenta nuevamente en 15 minutos.",
  },
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: {
    error: "Demasiados intentos de login. Intenta nuevamente en 15 minutos.",
  },
});

export const publicLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiadas peticiones. Intenta nuevamente en 1 hora.",
  },
});

export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error:
      "Has excedido el límite de peticiones. Intenta nuevamente en 1 hora.",
  },
});
