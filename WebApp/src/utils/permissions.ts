// utils/permissions.ts
export interface UserPermissions {
  canAccessModule: (moduleName: string, userProfile: number) => boolean;
  getAvailableModules: (userProfile: number) => string[];
}

// Definición de permisos por perfil
const MODULE_PERMISSIONS: Record<number, string[]> = {
  1: [
    // Administrador - Acceso total
    "Campeonatos",
    "Equipos",
    "Inscripciones",
    "Jugadores",
    "Lista Negra",
    "Menú Torneos",
    "Sedes",
    "Resultados",
    "Torneos",
    "Tribunal de Faltas",
    "Cambios de Equipos",
    "Codificadores",
    "Proveedores",
    "Consentimiento",
    "Facturación",
    "Pagos",
    "C.Corriente",
    "Caja",
    "Reportes",
    "Usuarios",
  ],
  2: [
    // Staff - Solo Resultados
    "Resultados",
  ],
  3: [], // Sin acceso a módulos
};

export const permissions: UserPermissions = {
  canAccessModule: (moduleName: string, userProfile: number): boolean => {
    const allowedModules = MODULE_PERMISSIONS[userProfile] || [];
    return allowedModules.includes(moduleName);
  },

  getAvailableModules: (userProfile: number): string[] => {
    return MODULE_PERMISSIONS[userProfile] || [];
  },
};

// Función helper para verificar si un usuario puede acceder al sistema
export const canAccessSystem = (userProfile: number): boolean => {
  return userProfile === 1 || userProfile === 2;
};

// Función helper para obtener el nombre del rol
export const getRoleName = (userProfile: number): string => {
  const roles: Record<number, string> = {
    1: "Administrador",
    2: "Staff",
    3: "Sin acceso",
  };
  return roles[userProfile] || "Desconocido";
};
