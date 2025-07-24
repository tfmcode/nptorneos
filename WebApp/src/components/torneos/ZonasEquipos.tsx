import React, { useEffect } from "react";
import { MoneyInputField, StatusMessage } from "../common";
import { DataTable, zonasEquiposColumns } from "..";
import { useCrudForm } from "../../hooks/useCrudForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchZonasByTorneo } from "../../store/slices/zonaSlice";
import { ZonaEquipo } from "../../types/zonasEquipos";
import {
  fetchZonasEquiposByTorneo,
  removeZonaEquipo,
  saveZonaEquipoThunk,
  setZonasEquiposError,
} from "../../store/slices/zonasEquiposSlice";
import EquipoAutocomplete from "../forms/EquipoAutocomplete";

interface ZonasEquiposProps {
  idtorneo: number;
  valor_fecha: number;
}

function ZonasEquipos({ idtorneo, valor_fecha }: ZonasEquiposProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { zonas } = useSelector((state: RootState) => state.zonas);
  const { zonasEquipos, loading, error } = useSelector(
    (state: RootState) => state.zonasEquipos
  );

  const initialFormData: ZonaEquipo = {
    id: undefined,
    idtorneo: idtorneo,
    idzona: 0,
    idequipo: 0,
    codestado: 1,
    idusuario: user?.idusuario ?? 0,
    valor_insc: 0,
    valor_fecha: valor_fecha,
    nombre: "",
    abrev: "",
  };

  useEffect(() => {
    dispatch(fetchZonasByTorneo(idtorneo));
    dispatch(fetchZonasEquiposByTorneo(idtorneo ?? 0));
  }, [dispatch, idtorneo]);

  const { formData, setFormData } = useCrudForm<ZonaEquipo>(initialFormData);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      abrev: prev.nombre ? prev.nombre.substring(0, 3).toUpperCase() : "",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.nombre]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.idzona == null || formData.idzona == 0) {
        dispatch(
          setZonasEquiposError(
            "No se puede guardar un equipo sin una zona seleccionada"
          )
        );
        return;
      }
      const { id, ...zonaEquipoData } = formData;
      await dispatch(
        saveZonaEquipoThunk(id ? formData : zonaEquipoData)
      ).unwrap();
      dispatch(fetchZonasEquiposByTorneo(idtorneo ?? 0));
      setFormData({
        ...initialFormData,
        idzona: formData.idzona,
      });
    } catch (err) {
      console.error("Error al guardar zona equipo:", err);
    }
  };

  const handleDelete = async (zonaEquipo: ZonaEquipo) => {
    await dispatch(removeZonaEquipo(zonaEquipo.id!)).unwrap();
    dispatch(fetchZonasEquiposByTorneo(idtorneo ?? 0));
  };

  const filteredZonasEquipos = Array.isArray(zonasEquipos)
    ? zonasEquipos.filter((zonaEquipo) => zonaEquipo.idzona === formData.idzona)
    : [];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4 justify-between items-center">
        <div className="w-1/2">
          <label
            htmlFor="idzona"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Zona
          </label>
          <select
            value={formData.idzona ?? 0}
            onChange={(e) =>
              setFormData({ ...formData, idzona: Number(e.target.value) })
            }
            className="w-full p-2 border border-gray-300 rounded-md text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-200"
          >
            <option value="0" disabled>
              Seleccionar...
            </option>
            {zonas.map((zona) => (
              <option key={zona.id} value={zona.id}>
                {zona.nombre}
              </option>
            ))}
          </select>
        </div>
        <div className="w-1/2">
          <label
            htmlFor="idequipo"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Equipo
          </label>
          <EquipoAutocomplete
            value={formData.idequipo ?? 0}
            onChange={(equipo) =>
              setFormData({ ...formData, idequipo: equipo.id ?? 0 })
            }
          />
        </div>
      </div>
      <div className="flex gap-4 justify-between items-center">
        <div className="w-1/2">
          <label
            htmlFor="valor_insc"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Valor Inscripción
          </label>
          <MoneyInputField
            name="valor_insc"
            value={formData.valor_insc?.toString() ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, valor_insc: Number(e.target.value) })
            }
            type="number"
            placeholder="Valor Inscripción"
          />
        </div>
        <div className="w-1/2">
          <label
            htmlFor="valor_fecha"
            className="block text-xs font-medium text-gray-700 mb-1"
          >
            Valor Fecha
          </label>
          <MoneyInputField
            name="valor_fecha"
            value={formData.valor_fecha?.toString() ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, valor_fecha: Number(e.target.value) })
            }
            type="number"
            placeholder="Valor Fecha"
          />
        </div>
      </div>
      <div className="flex justify-end mt-4">
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm"
          onClick={handleSubmit}
        >
          Agregar
        </button>
      </div>

      <StatusMessage loading={loading} error={error} />

      <DataTable<ZonaEquipo>
        columns={zonasEquiposColumns}
        data={Array.isArray(filteredZonasEquipos) ? filteredZonasEquipos : []}
        onEdit={(row) => setFormData(row as ZonaEquipo)}
        onDelete={(row) => handleDelete(row as ZonaEquipo)}
      />
    </div>
  );
}

export default ZonasEquipos;
