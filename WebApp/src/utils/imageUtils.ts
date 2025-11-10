// WebApp/src/utils/imageUtils.ts

// ✅ Obtener URL del backend desde variables de entorno
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

/**
 * 🖼️ CONSTRUCCIÓN DE URLs DE IMÁGENES CON CARPETAS SEGREGADAS
 *
 * Estructura:
 * - Jugadores: /uploads/jugadores/nombre_apellido_timestamp.jpg
 * - Equipos:    /uploads/equipos/equipo-slug/escudo.jpg
 * - Galería:    /uploads/equipos/equipo-slug/grupo_foto1_timestamp.jpg
 */

/**
 * Construye URL para foto de jugador
 * @param filename - Nombre del archivo (ej: "homer_simpsons_1762698485925_t4kby9f.jpg")
 */
export const getJugadorFotoUrl = (
  filename: string | null | undefined
): string | null => {
  if (!filename || filename.trim() === "") return null;

  // Si ya es una URL completa, devolverla tal cual
  if (filename.startsWith("http")) return filename;

  // Si empieza con /uploads, construir URL completa
  if (filename.startsWith("/uploads")) {
    return `${API_URL}${filename}`;
  }

  // Si es solo el nombre del archivo
  return `${API_URL}/uploads/jugadores/${filename}`;
};

/**
 * Construye URL para escudo de equipo
 * @param filename - Ruta relativa (ej: "los-simpons/escudo.jpg")
 */
export const getEquipoEscudoUrl = (
  filename: string | null | undefined
): string | null => {
  if (!filename || filename.trim() === "") return null;

  // Si ya es una URL completa, devolverla tal cual
  if (filename.startsWith("http")) return filename;

  // Si empieza con /uploads, construir URL completa
  if (filename.startsWith("/uploads")) {
    return `${API_URL}${filename}`;
  }

  // Si es solo el nombre del archivo/ruta relativa
  return `${API_URL}/uploads/equipos/${filename}`;
};

/**
 * Construye URL para foto grupal de equipo
 * @param filename - Ruta relativa (ej: "los-simpons/grupo_foto1_1762698485925.jpg")
 */
export const getEquipoFotoGrupalUrl = (
  filename: string | null | undefined
): string | null => {
  if (!filename || filename.trim() === "") return null;

  // Si ya es una URL completa, devolverla tal cual
  if (filename.startsWith("http")) return filename;

  // Si empieza con /uploads, construir URL completa
  if (filename.startsWith("/uploads")) {
    return `${API_URL}${filename}`;
  }

  // Si es solo el nombre del archivo/ruta relativa
  return `${API_URL}/uploads/equipos/${filename}`;
};

/**
 * Construye URL genérica de imagen según el tipo
 * @param filename - Nombre o ruta del archivo
 * @param tipo - Tipo de imagen ('jugador' | 'equipo-escudo' | 'equipo-galeria')
 */
export const getImageUrl = (
  filename: string | null | undefined,
  tipo: "jugador" | "equipo-escudo" | "equipo-galeria" = "jugador"
): string | null => {
  if (!filename || filename.trim() === "") return null;

  switch (tipo) {
    case "jugador":
      return getJugadorFotoUrl(filename);
    case "equipo-escudo":
      return getEquipoEscudoUrl(filename);
    case "equipo-galeria":
      return getEquipoFotoGrupalUrl(filename);
    default:
      return null;
  }
};

/**
 * Verifica si una URL de imagen es válida
 */
export const isValidImageUrl = (url: string | null | undefined): boolean => {
  if (!url) return false;
  return url.startsWith("http") || url.startsWith("/uploads");
};

/**
 * Construye placeholder para imagen faltante
 */
export const getImagePlaceholder = (tipo: "jugador" | "equipo"): string => {
  // SVG inline para placeholder
  if (tipo === "jugador") {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Ccircle cx="12" cy="12" r="10"/%3E%3Cpath d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/%3E%3C/svg%3E';
  } else {
    return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"%3E%3Cpath d="M12 2L2 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/%3E%3C/svg%3E';
  }
};
