// hooks/usePermissions.ts
import { useSelector } from "react-redux";
import { RootState } from "../store";
import {
  permissions,
  canAccessSystem,
  getRoleName,
} from "../utils/permissions";

export const usePermissions = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userProfile = user?.perfil || 3;

  return {
    // Información del usuario
    user,
    userProfile,
    roleName: getRoleName(userProfile),

    // Verificaciones de permisos
    canAccessModule: (moduleName: string) =>
      permissions.canAccessModule(moduleName, userProfile),

    canAccessSystem: () => canAccessSystem(userProfile),

    // Listas de módulos
    availableModules: permissions.getAvailableModules(userProfile),

    // Verificaciones específicas por rol
    isAdmin: userProfile === 1,
    isStaff: userProfile === 2,
    isRestricted: userProfile === 3,

    // Funciones de utilidad
    hasAnyPermission: () =>
      permissions.getAvailableModules(userProfile).length > 0,

    // Para debugging
    debugPermissions: () => ({
      profile: userProfile,
      role: getRoleName(userProfile),
      modules: permissions.getAvailableModules(userProfile),
      systemAccess: canAccessSystem(userProfile),
    }),
  };
};
