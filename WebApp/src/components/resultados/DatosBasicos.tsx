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

  // ✅ Obtener perfil del usuario
  const { user } = useSelector((state: RootState) => state.auth);
  const isStaff = user?.perfil === 2;
  const isAdmin = user?.perfil === 1;

  // ✅ Solo estos 3 campos están restringidos para Staff
  const canEditRestrictedFields = isAdmin;

  useEffect(() => {
    dispatch(fetchSedes());
    dispatch(fetchUsuarios());
    dispatch(fetchProveedores({ page: 1, limit: 1000, searchTerm: "" }));
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let partido: Partial<Partido>;

      if (isStaff) {
        // ⭐ Staff: construir objeto SOLO con campos permitidos
        partido = {
          id: formData.id,
          idzona: formData.idzona,
          codtipo: formData.codtipo,
          idequipo1: formData.idequipo1,
          idequipo2: formData.idequipo2,
          codestado: Number(formData.codestado),
          goles1: formData.goles1,
          goles2: formData.goles2,
          puntobonus1: formData.puntobonus1,
          puntobonus2: formData.puntobonus2,
          ausente1: Number(formData.ausente1),
          ausente2: Number(formData.ausente2),
          observaciones: formData.observaciones,
          arbitro: formData.arbitro,
          incidencias: formData.incidencias,
          formacion1: formData.formacion1,
          formacion2: formData.formacion2,
          cambios1: formData.cambios1,
          cambios2: formData.cambios2,
          dt1: formData.dt1,
          dt2: formData.dt2,
          suplentes1: formData.suplentes1,
          suplentes2: formData.suplentes2,
          idusuario: formData.idusuario,
          idfecha: formData.idfecha,
        };
      } else {
        // ⭐ Admin: enviar TODOS los campos
        partido = {
          ...formData,
          ausente1: Number(formData.ausente1),
          ausente2: Number(formData.ausente2),
          codestado: Number(formData.codestado),
          idprofesor: Number(formData.idprofesor || 0),
        };
      }

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
      {/* ✅ Mensaje informativo mejorado para Staff */}
      {isStaff && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-blue-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Modo Staff:</strong> Podés modificar el resultado del
                partido, goles, estado y gestionar jugadores. Los campos de
                fecha, sede y profesor solo pueden ser modificados por un
                administrador.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Info principal */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg border">
        {/* ✅ Fecha - Deshabilitada para Staff */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            Fecha
            {isStaff && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded font-normal">
                Solo Admin
              </span>
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

        {/* ✅ Sede - Deshabilitada para Staff */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            Sede
            {isStaff && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded font-normal">
                Solo Admin
              </span>
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

        {/* ✅ Profesor - Deshabilitado para Staff */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            Profesor/Árbitro
            {isStaff && (
              <span className="px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded font-normal">
                Solo Admin
              </span>
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

        {/* ✅ Estado - EDITABLE para Staff */}
        <div>
          <label className="block font-medium mb-1 flex items-center gap-2">
            Estado
            {isStaff && (
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded font-normal">
                ✓ Editable
              </span>
            )}
          </label>
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
        <legend className="text-sm font-semibold text-gray-700 px-2 flex items-center gap-2">
          {formData.nombre1 ?? "Equipo 1"}
          {isStaff && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded font-normal">
              ✓ Editable
            </span>
          )}
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
        <legend className="text-sm font-semibold text-gray-700 px-2 flex items-center gap-2">
          {formData.nombre2 ?? "Equipo 2"}
          {isStaff && (
            <span className="px-2 py-0.5 text-xs bg-green-100 text-green-800 rounded font-normal">
              ✓ Editable
            </span>
          )}
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
