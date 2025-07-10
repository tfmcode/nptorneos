import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { MenuTorneo } from "../../types/menuTorneos";
import {
  fetchMenuTorneosByOpcion,
  saveMenuTorneoThunk,
  removeMenuTorneo,
} from "../../store/slices/menuTorneosSlice";
import { fetchTorneos } from "../../store/slices/torneoSlice";
import { PageHeader, StatusMessage } from "../../components/common";

const MenuTorneos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { menutorneos, loading, error } = useSelector(
    (state: RootState) => state.menuTorneos
  );
  const { torneos } = useSelector((state: RootState) => state.torneos);

  const [idopcion, setIdopcion] = useState<number>(5);
  const [localData, setLocalData] = useState<MenuTorneo[]>([]);

  useEffect(() => {
    dispatch(fetchMenuTorneosByOpcion(idopcion));
    dispatch(fetchTorneos({ page: 1, limit: 100, searchTerm: "" }));
  }, [dispatch, idopcion]);

  useEffect(() => {
    const updated = Array.from({ length: 6 }, (_, idx) => {
      const found = menutorneos.find((m) => m.orden === idx + 1);
      return {
        idopcion,
        idtorneo: found?.idtorneo ?? undefined,
        descripcion: found?.descripcion ?? "",
        orden: idx + 1,
      };
    });
    setLocalData(updated);
  }, [menutorneos, idopcion]);

  const handleChange = (
    index: number,
    field: "idtorneo" | "descripcion",
    value: string | number
  ) => {
    setLocalData((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value === "" ? undefined : value,
      };
      return copy;
    });
  };

  const handleSave = async (item: MenuTorneo) => {
    try {
      if (!item.idopcion || !item.orden) return;
      await dispatch(saveMenuTorneoThunk(item)).unwrap();
      dispatch(fetchMenuTorneosByOpcion(idopcion));
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  const handleDelete = async (item: MenuTorneo) => {
    try {
      if (!item.idopcion || !item.orden) return;
      await dispatch(
        removeMenuTorneo({ idopcion: item.idopcion, orden: item.orden })
      ).unwrap();
      dispatch(fetchMenuTorneosByOpcion(idopcion));
    } catch (error) {
      console.error("Error al borrar:", error);
    }
  };

  return (
    <div className="flex justify-center items-start py-6">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-3xl">
        <PageHeader title="Menú Torneos" />

        <div className="mb-4">
          <label className="mr-2 font-medium">Categoría:</label>
          <select
            value={idopcion}
            onChange={(e) => setIdopcion(Number(e.target.value))}
            className="border rounded p-2 text-sm"
          >
            <option value={1}>AEJBA</option>
            <option value={2}>Femenino</option>
            <option value={5}>Fútbol 5</option>
            <option value={8}>Fútbol 8</option>
            <option value={11}>Fútbol 11</option>
          </select>
        </div>

        <StatusMessage loading={loading} error={error} />

        <div className="space-y-4">
          {localData.map((item, idx) => (
            <div
              key={idx}
              className="grid grid-cols-1 md:grid-cols-[80px_1fr_1fr_auto_auto] gap-2 items-center border rounded p-2"
            >
              <span className="font-semibold text-sm">Torneo {item.orden}</span>

              <select
                value={item.idtorneo ?? ""}
                onChange={(e) =>
                  handleChange(idx, "idtorneo", Number(e.target.value))
                }
                className="border rounded p-2 text-sm w-full"
              >
                <option value="">Seleccionar Torneo</option>
                {torneos
                  .filter((t) => t.id !== undefined)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
              </select>

              <input
                type="text"
                placeholder="Descripción"
                value={item.descripcion ?? ""}
                onChange={(e) =>
                  handleChange(idx, "descripcion", e.target.value)
                }
                className="border rounded p-2 text-sm w-full"
              />

              <button
                onClick={() => handleSave(item)}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
              >
                Grabar
              </button>
              <button
                onClick={() => handleDelete(item)}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
              >
                Borrar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuTorneos;
