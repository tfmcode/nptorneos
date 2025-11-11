import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { Partido } from "../../types/partidos";
import {
  fetchPartidosByZona,
  savePartidoThunk,
} from "../../store/slices/partidoSlice";
import { fetchSedes } from "../../store/slices/sedeSlice";
import { fetchUsuarios } from "../../store/slices/usuarioSlice";
import { fetchProveedores } from "../../store/slices/proveedoresSlice";

function DatosBasicos({
  formData,
  onChange,
}: {
  formData: Partido;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { sedes } = useSelector((state: RootState) => state.sedes);
  const { proveedores } = useSelector((state: RootState) => state.proveedores);

  // ✅ NUEVO: Obtener perfil del usuario
  const { user } = useSelector((state: RootState) => state.auth);
  const isStaff = user?.perfil === 2;
  const isAdmin = user?.perfil === 1;

  // ✅ NUEVO: Campos restringidos para Staff
  const canEditRestrictedFields = isAdmin;

  useEffect(() => {
    dispatch(fetchSedes());
    dispatch(fetchUsuarios());
    dispatch(fetchProveedores({ page: 1, limit: 1000, searchTerm: "" }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const partido = {
        ...formData,
        ausente1: Number(formData.ausente1),
        ausente2: Number(formData.ausente2),
        codestado: Number(formData.codestado),
        idprofesor: Number(formData.idprofesor || 0),
      };
      await dispatch(savePartidoThunk(partido)).unwrap();
      dispatch(fetchPartidosByZona(formData.idzona));
    } catch (err) {
      console.error("Error al guardar partido:", err);
    }
  };

  // Filtrar solo los profesores (codtipo = 2)
  const profesores = Array.isArray(proveedores)
    ? proveedores.filter((p) => p.codtipo === 2)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm text-gray-800">
      {/* ✅ NUEVO: Mensaje informativo para Staff */}
      {isStaff && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Nota:</strong> Como usuario Staff, no podés modificar la
                fecha, sede ni profesor asignado. Solo el administrador puede
                cambiar estos campos.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info principal */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
        {/* ✅ MODIFICADO: Fecha - Deshabilitada para Staff */}
        <div>
          <label className="block font-medium mb-1">
            Fecha
            {isStaff && (
              <span className="ml-2 text-xs text-red-600">(Solo Admin)</span>
            )}
          </label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha ? formData.fecha.split("T")[0] : ""}
            onChange={onChange}
            disabled={!canEditRestrictedFields}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              !canEditRestrictedFields
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : ""
            }`}
            title={
              isStaff ? "Solo el administrador puede modificar la fecha" : ""
            }
          />
        </div>

        {/* ✅ MODIFICADO: Sede - Deshabilitada para Staff */}
        <div>
          <label className="block font-medium mb-1">
            Sede
            {isStaff && (
              <span className="ml-2 text-xs text-red-600">(Solo Admin)</span>
            )}
          </label>
          <select
            name="idsede"
            value={formData.idsede ?? 0}
            onChange={onChange}
            disabled={!canEditRestrictedFields}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              !canEditRestrictedFields
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : ""
            }`}
            title={
              isStaff ? "Solo el administrador puede modificar la sede" : ""
            }
          >
            <option value={0}>Seleccionar</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ MODIFICADO: Profesor - Deshabilitado para Staff */}
        <div>
          <label className="block font-medium mb-1">
            Profesor/Árbitro
            {isStaff && (
              <span className="ml-2 text-xs text-red-600">(Solo Admin)</span>
            )}
          </label>
          <select
            name="idprofesor"
            value={formData.idprofesor ?? 0}
            onChange={onChange}
            disabled={!canEditRestrictedFields}
            className={`w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none ${
              !canEditRestrictedFields
                ? "bg-gray-100 cursor-not-allowed opacity-60"
                : ""
            }`}
            title={
              isStaff
                ? "Solo el administrador puede modificar el profesor asignado"
                : ""
            }
          >
            <option value={0}>Sin asignar</option>
            {profesores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Estado - Staff SÍ puede modificar */}
        <div>
          <label className="block font-medium mb-1">Estado</label>
          <select
            name="codestado"
            value={formData.codestado ?? 10}
            onChange={onChange}
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value={10}>No Comenzado</option>
            <option value={20}>Iniciado</option>
            <option value={21}>Primer Tiempo</option>
            <option value={22}>Segundo Tiempo</option>
            <option value={23}>Primer Suplementario</option>
            <option value={24}>Segundo Suplementario</option>
            <option value={25}>Penales</option>
            <option value={30}>Entretiempo</option>
            <option value={40}>Finalizado</option>
            <option value={50}>Suspendido</option>
            <option value={60}>Demorado</option>
            <option value={70}>No Computa</option>
          </select>
        </div>
      </section>

      {/* Equipo 1 */}
      <fieldset className="border border-gray-200 rounded-lg p-4 shadow-sm">
        <legend className="text-sm font-semibold text-gray-700 px-2">
          {formData.nombre1 ?? "Equipo 1"}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <label className="block font-medium mb-1">Goles</label>
            <input
              type="number"
              name="goles1"
              value={formData.goles1 ?? 0}
              onChange={onChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Punto Bonus</label>
            <select
              name="puntobonus1"
              value={formData.puntobonus1 ?? 0}
              onChange={onChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={0}>NO</option>
              <option value={1}>SI</option>
            </select>
          </div>

          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="ausente1"
              checked={formData.ausente1 === 1}
              onChange={(e) =>
                onChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: "ausente1",
                    value: e.target.checked ? "1" : "0",
                  },
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            Ausente
          </label>
        </div>
      </fieldset>

      {/* Equipo 2 */}
      <fieldset className="border border-gray-200 rounded-lg p-4 shadow-sm">
        <legend className="text-sm font-semibold text-gray-700 px-2">
          {formData.nombre2 ?? "Equipo 2"}
        </legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
          <div>
            <label className="block font-medium mb-1">Goles</label>
            <input
              type="number"
              name="goles2"
              value={formData.goles2 ?? 0}
              onChange={onChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Punto Bonus</label>
            <select
              name="puntobonus2"
              value={formData.puntobonus2 ?? 0}
              onChange={onChange}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value={0}>NO</option>
              <option value={1}>SI</option>
            </select>
          </div>

          <label className="flex items-center gap-2 mt-6">
            <input
              type="checkbox"
              name="ausente2"
              checked={formData.ausente2 === 1}
              onChange={(e) =>
                onChange({
                  ...e,
                  target: {
                    ...e.target,
                    name: "ausente2",
                    value: e.target.checked ? "1" : "0",
                  },
                })
              }
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            Ausente
          </label>
        </div>
      </fieldset>

      {/* Botón */}
      <div className="mt-6 text-right">
        <button
          type="submit"
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition"
        >
          Grabar
        </button>
      </div>
    </form>
  );
}

export default DatosBasicos;
