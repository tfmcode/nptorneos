import axios from "axios";
import { MenuTorneo } from "../types/menuTorneos";

const API_URL = import.meta.env.VITE_API_URL || "https://nptorneos.com.ar";

export const getPublicMenuTorneosByOpcion = async (
  idopcion: number
): Promise<MenuTorneo[]> => {
  const { data } = await axios.get(
    `${API_URL}/api/public/menutorneos/${idopcion}`
  );
  return data;
};
