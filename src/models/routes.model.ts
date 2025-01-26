export enum EPublicRoutes {
  HOME = "/",
  ABOUT = "/about",
  CONTACT = "/contact",
  CONCENTS = "/concents",
  TOURNAMENTS = "/tournaments",
  SISTEMA = "/sistema",
}

export enum EPrivateRoutes {
  DASHBOARD = "/dashboard",
  PROFILE = "/profile",
}

export const publicRoutes = [Object.values(EPublicRoutes) as string[]];
export const privateRoutes = [Object.values(EPrivateRoutes) as string[]];