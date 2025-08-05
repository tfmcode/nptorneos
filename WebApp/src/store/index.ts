import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import usuarioReducer from "./slices/usuarioSlice";
import campeonatoReducer from "./slices/campeonatoSlice";
import jugadoresReducer from "./slices/jugadoresSlice";
import sedeReducer from "./slices/sedeSlice";
import codificadorReducer from "./slices/codificadorSlice";
import equipoSlice from "./slices/equiposSlice";
import torneoSlice from "./slices/torneoSlice";
import zonaSlice from "./slices/zonaSlice";
import zonasEquiposSlice from "./slices/zonasEquiposSlice";
import torneosImagenSlice from "./slices/torneosImagenSlice";
import equiposJugadoresSlice from "./slices/equiposJugadoresSlice";
import listaNegraSlice from "./slices/listaNegraSlice";
import proveedoresSlice from "./slices/proveedoresSlice";
import consentimientoSlice from "./slices/consentimientoSlice";
import sancionSlice from "./slices/sancionSlice";
import inscripcionSlice from "./slices/inscripcionSlice";
import inscripcionesJugadoresSlice from "./slices/inscripcionesJugadoresSlice";
import torneosEquiposInscSlice from "./slices/torneosEquiposInscSlice";
import menuTorneosSlice from "./slices/menuTorneosSlice";
import facturaSlice from "./slices/facturasSlice";
import partidoSlice from "./slices/partidoSlice";
import partidosJugadoresSlice from "./slices/partidosJugadoresSlice";

export const store = configureStore({
  reducer: {
    usuarios: usuarioReducer,
    auth: authReducer,
    campeonatos: campeonatoReducer,
    jugadores: jugadoresReducer,
    sedes: sedeReducer,
    codificadores: codificadorReducer,
    equipos: equipoSlice,
    torneos: torneoSlice,
    zonas: zonaSlice,
    zonasEquipos: zonasEquiposSlice,
    torneosImagenes: torneosImagenSlice,
    equiposJugadores: equiposJugadoresSlice,
    listaNegra: listaNegraSlice,
    proveedores: proveedoresSlice,
    consentimientos: consentimientoSlice,
    sanciones: sancionSlice,
    inscripciones: inscripcionSlice,
    inscripcionesJugadores: inscripcionesJugadoresSlice,
    torneosEquiposInsc: torneosEquiposInscSlice,
    menuTorneos: menuTorneosSlice,
    facturas: facturaSlice,
    partidos: partidoSlice,
    partidosJugadores: partidosJugadoresSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== "production", // ✅ Habilita Redux DevTools solo en desarrollo
});

// ✅ Tipado del estado y el dispatch
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
