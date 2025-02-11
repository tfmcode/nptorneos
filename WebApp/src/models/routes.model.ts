export enum EPublicRoutes {
  HOME = "/",
  ABOUT = "/about",
  CONTACT = "/contact",
  CONCENTS = "/concents",
  TOURNAMENTS = "/tournaments",
  LOGIN = "/login",
  REC_PASSWORD = "/recoverpassword",
}

export enum EPrivateRoutes {
  DASHBOARD = "/dashboard",
  SISTEMA = "/sistema",
  PROFILE = "/profile",
}

export const publicRoutes = [Object.values(EPublicRoutes) as string[]];
export const privateRoutes = [Object.values(EPrivateRoutes) as string[]];
