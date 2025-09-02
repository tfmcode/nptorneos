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

  // ✅ Función para validar equipo duplicado
  const validateEquipoEnZona = (): string[] => {
    const errores: string[] = [];

    // Validaciones básicas
    if (!formData.idzona || formData.idzona === 0) {
      errores.push("• Seleccionar una zona");
    }
    if (!formData.idequipo || formData.idequipo === 0) {
      errores.push("• Seleccionar un equipo");
    }

    // ✅ Validación: equipo ya existe en la zona
    if (formData.idzona && formData.idequipo) {
      const equipoYaEnZona = zonasEquipos.find(
        (ze) =>
          ze.idzona === formData.idzona &&
          ze.idequipo === formData.idequipo &&
          ze.id !== formData.id // Excluir el registro actual si estamos editando
      );

      if (equipoYaEnZona) {
        const nombreZona =
          zonas.find((z) => z.id === formData.idzona)?.nombre || "esta zona";
        errores.push(`• El equipo ya está asignado a ${nombreZona}`);
      }
    }

    return errores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validar antes de enviar
    const errores = validateEquipoEnZona();
    if (errores.length > 0) {
      dispatch(setZonasEquiposError(errores.join("\n")));
      return;
    }

    try {
      const { id, ...zonaEquipoData } = formData;
      await dispatch(
        saveZonaEquipoThunk(id ? formData : zonaEquipoData)
      ).unwrap();
      dispatch(fetchZonasEquiposByTorneo(idtorneo ?? 0));

      // ✅ Mantener la zona seleccionada, solo resetear el equipo
      setFormData({
        ...initialFormData,
        idzona: formData.idzona,
        valor_insc: formData.valor_insc,
        valor_fecha: formData.valor_fecha,
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

  // ✅ Obtener equipos ya asignados a la zona actual
  const equiposYaAsignados = new Set(
    zonasEquipos
      .filter((ze) => ze.idzona === formData.idzona && ze.id !== formData.id)
      .map((ze) => ze.idequipo)
  );

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
              setFormData({
                ...formData,
                idequipo: equipo.id ?? 0,
                nombre: equipo.nombre ?? "",
              })
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

      {/* ✅ Mostrar información sobre equipos en la zona */}
      {formData.idzona && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>Zona seleccionada:</strong>{" "}
            {zonas.find((z) => z.id === formData.idzona)?.nombre}
            <br />
            <strong>Equipos en esta zona:</strong> {filteredZonasEquipos.length}
            {equiposYaAsignados.size > 0 && (
              <span className="text-orange-600 ml-2">
                ({equiposYaAsignados.size} equipos ya asignados)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default ZonasEquipos;
