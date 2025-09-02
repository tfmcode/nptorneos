import React, { useEffect, useState } from "react";
import DynamicForm from "../forms/DynamicForm";
import { StatusMessage } from "../common";
import { DataTable } from "..";
import { useCrudForm } from "../../hooks/useCrudForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchZonasByTorneo,
  setZonasError,
} from "../../store/slices/zonaSlice";
import { Partido } from "../../types/partidos";
import {
  removePartido,
  savePartidoThunk,
} from "../../store/slices/partidoSlice";
import { fetchPartidosByZona } from "../../store/slices/partidoSlice";
import { partidosColumns } from "../tables/columns/partidosColumns";
import { fetchSedes } from "../../store/slices/sedeSlice";
import { ZonaEquipo } from "../../types/zonasEquipos";
import { fetchZonasEquiposByTorneo } from "../../store/slices/zonasEquiposSlice";

interface PartidosProps {
  idtorneo: number;
}

function Partidos({ idtorneo }: PartidosProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { zonas } = useSelector((state: RootState) => state.zonas);
  const { zonasEquipos } = useSelector(
    (state: RootState) => state.zonasEquipos
  );
  const { sedes } = useSelector((state: RootState) => state.sedes);
  const { partidos, loading, error } = useSelector(
    (state: RootState) => state.partidos
  );

  useEffect(() => {
    dispatch(fetchPartidosByZona(0));
    dispatch(fetchZonasByTorneo(idtorneo));
    dispatch(fetchZonasEquiposByTorneo(idtorneo ?? 0));
    dispatch(fetchSedes());
  }, [dispatch, idtorneo]);

  const initialFormData: Partido = {
    id: undefined,
    idzona: 0,
    nrofecha: 1, // Valor por defecto más lógico
    fecha: "",
    horario: "",
    idsede: 0,
    codtipo: 9, // "Zona" por defecto
    idequipo1: 0,
    idequipo2: 0,
    codestado: 1,
    idusuario: user?.idusuario ?? 0,
    fhcarga: undefined,
    fhbaja: undefined,
    nombre1: "",
    nombre2: "",
    sede: "",
    goles1: 0,
    goles2: 0,
    arbitro: "",
    puntobonus1: 0,
    puntobonus2: 0,
    formacion1: "",
    formacion2: "",
    cambios1: "",
    cambios2: "",
    dt1: "",
    dt2: "",
    suplentes1: "",
    suplentes2: "",
    ausente1: 0,
    ausente2: 0,
    idfecha: 0,
  };

  const [equiposPartido, setEquiposPartido] = useState<ZonaEquipo[]>([]);
  const [horario, setHorario] = useState<string>("00:00");
  // ✅ Estados para mantener los filtros persistentes
  const [persistentFilters, setPersistentFilters] = useState({
    idzona: 0,
    nrofecha: 1,
    fecha: "",
    idsede: 0,
    codtipo: 9,
  });

  const { formData, setFormData, handleInputChange } = useCrudForm<Partido>({
    ...initialFormData,
    ...persistentFilters, // ✅ Inicializar con filtros persistentes
  });

  useEffect(() => {
    setEquiposPartido(
      zonasEquipos.filter((equipo) => equipo.idzona === formData.idzona)
    );
  }, [formData.idzona, zonasEquipos]);

  useEffect(() => {
    dispatch(fetchPartidosByZona(formData.idzona ?? 0));
  }, [formData.idzona, dispatch]);

  useEffect(() => {
    if (formData.fecha) {
      setHorario(formData.fecha.split(" ")[1] ?? "00:00");
    }
  }, [formData.fecha]);

  // ✅ Función para validar duplicados
  const validatePartido = (): string[] => {
    const errores: string[] = [];

    // Validación básica
    if (!formData.idzona || formData.idzona === 0) {
      errores.push("• Seleccionar una zona");
    }
    if (!formData.nrofecha || formData.nrofecha === 0) {
      errores.push("• Ingresar el número de fecha");
    }
    if (!formData.fecha) {
      errores.push("• Ingresar la fecha del partido");
    }
    if (!formData.idsede || formData.idsede === 0) {
      errores.push("• Seleccionar una sede");
    }
    if (!formData.idequipo1 || formData.idequipo1 === 0) {
      errores.push("• Seleccionar equipo local");
    }
    if (!formData.idequipo2 || formData.idequipo2 === 0) {
      errores.push("• Seleccionar equipo visitante");
    }

    // ✅ Validación: mismo equipo
    if (formData.idequipo1 === formData.idequipo2 && formData.idequipo1 !== 0) {
      errores.push("• No se puede crear un partido entre el mismo equipo");
    }

    // ✅ Validación: equipo ya tiene partido en esa fecha
    const partidosExistentes = partidos.filter(
      (p) =>
        p.nrofecha === formData.nrofecha &&
        p.idzona === formData.idzona &&
        p.id !== formData.id // Excluir el partido actual si estamos editando
    );

    const equiposOcupados = new Set<number>();
    partidosExistentes.forEach((p) => {
      if (p.idequipo1) equiposOcupados.add(p.idequipo1);
      if (p.idequipo2) equiposOcupados.add(p.idequipo2);
    });

    if (formData.idequipo1 && equiposOcupados.has(formData.idequipo1)) {
      const nombreEquipo1 =
        equiposPartido.find((e) => e.idequipo === formData.idequipo1)?.nombre ||
        "Equipo local";
      errores.push(
        `• ${nombreEquipo1} ya tiene un partido programado en la fecha ${formData.nrofecha}`
      );
    }

    if (formData.idequipo2 && equiposOcupados.has(formData.idequipo2)) {
      const nombreEquipo2 =
        equiposPartido.find((e) => e.idequipo === formData.idequipo2)?.nombre ||
        "Equipo visitante";
      errores.push(
        `• ${nombreEquipo2} ya tiene un partido programado en la fecha ${formData.nrofecha}`
      );
    }

    return errores;
  };

  const handleSubmitPartido = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validar antes de enviar
    const errores = validatePartido();
    if (errores.length > 0) {
      dispatch(setZonasError(errores.join("\n")));
      return;
    }

    try {
      if (formData.fecha) {
        formData.fecha = `${formData.fecha.split(" ")[0]} ${horario}`;
      }

      const { id, ...partidoData } = formData;
      await dispatch(savePartidoThunk(id ? formData : partidoData)).unwrap();
      dispatch(fetchPartidosByZona(formData.idzona ?? 0));

      // ✅ Mantener filtros persistentes, solo resetear equipos
      const newFormData = {
        ...initialFormData,
        idzona: formData.idzona,
        nrofecha: formData.nrofecha,
        fecha: formData.fecha ? formData.fecha.split(" ")[0] : "", // Mantener fecha sin hora
        idsede: formData.idsede,
        codtipo: formData.codtipo,
        // Solo resetear equipos
        idequipo1: 0,
        idequipo2: 0,
      };

      setFormData(newFormData);

      // ✅ Actualizar filtros persistentes
      setPersistentFilters({
        idzona: formData.idzona ?? 0,
        nrofecha: formData.nrofecha ?? 1,
        fecha: formData.fecha ? formData.fecha.split(" ")[0] : "",
        idsede: formData.idsede ?? 0,
        codtipo: formData.codtipo ?? 9,
      });
    } catch (err) {
      console.error("Error al guardar partido:", err);
    }
  };

  const handleDeletePartido = async (partido: Partido) => {
    await dispatch(removePartido(partido.id!)).unwrap();
    dispatch(fetchPartidosByZona(formData.idzona ?? 0));
  };

  // ✅ Filtrar equipos disponibles (excluir los que ya tienen partido en esa fecha)
  const getEquiposDisponibles = (): ZonaEquipo[] => {
    if (!formData.nrofecha || !formData.idzona) return equiposPartido;

    const partidosEnFecha = partidos.filter(
      (p) =>
        p.nrofecha === formData.nrofecha &&
        p.idzona === formData.idzona &&
        p.id !== formData.id // Excluir el partido actual si estamos editando
    );

    const equiposOcupados = new Set<number>();
    partidosEnFecha.forEach((p) => {
      if (p.idequipo1) equiposOcupados.add(p.idequipo1);
      if (p.idequipo2) equiposOcupados.add(p.idequipo2);
    });

    return equiposPartido.filter(
      (equipo) => !equiposOcupados.has(equipo.idequipo ?? 0)
    );
  };

  const equiposDisponibles = getEquiposDisponibles();

  const filteredPartidos = Array.isArray(partidos)
    ? partidos.filter((partido) => partido.idzona === formData.idzona)
    : [];

  return (
    <div>
      <DynamicForm
        fields={[
          {
            name: "idzona",
            type: "select",
            value: formData.idzona ?? 0,
            label: "Zona",
            options: zonas.map((zona) => ({
              value: zona.id ?? 0,
              label: zona.nombre ?? "",
            })),
          },
          {
            name: "nrofecha",
            type: "number",
            value: formData.nrofecha ?? 0,
            label: "Nro. Fecha",
          },
          {
            name: "fecha",
            type: "date",
            value: formData.fecha?.split(" ")[0] ?? "",
            label: "Fecha",
          },
          {
            name: "horario",
            type: "time",
            value: horario,
            onChange: (e) => setHorario(e.target.value),
            label: "Horario",
          },
          {
            name: "idsede",
            type: "select",
            value: formData.idsede ?? 0,
            label: "Sede",
            options: sedes.map((sede) => ({
              value: sede.id ?? 0,
              label: sede.nombre ?? "",
            })),
          },
          {
            name: "codtipo",
            type: "select",
            value: formData.codtipo ?? 0,
            label: "Tipo de Partido",
            options: [
              { label: "32vos De Final", value: 1 },
              { label: "16vos De Final", value: 2 },
              { label: "Octavos De Final", value: 3 },
              { label: "Cuartos De Final", value: 4 },
              { label: "Semifinal", value: 5 },
              { label: "Final", value: 6 },
              { label: "Tercer Puesto", value: 7 },
              { label: "Repechaje", value: 8 },
              { label: "Zona", value: 9 },
            ],
          },
          {
            name: "idequipo1",
            type: "select",
            value: formData.idequipo1 ?? 0,
            label: "Equipo Local",
            options: equiposDisponibles.map((equipo) => ({
              value: equipo.idequipo ?? 0,
              label: equipo.nombre ?? "",
            })),
          },
          {
            name: "idequipo2",
            type: "select",
            value: formData.idequipo2 ?? 0,
            label: "Equipo Visitante",
            options: equiposDisponibles
              .filter((equipo) => equipo.idequipo !== formData.idequipo1)
              .map((equipo) => ({
                value: equipo.idequipo ?? 0,
                label: equipo.nombre ?? "",
              })),
          },
        ]}
        onChange={handleInputChange}
        onSubmit={handleSubmitPartido}
        submitLabel="Agregar"
      />

      <StatusMessage loading={loading} error={error} />

      <DataTable<Partido>
        columns={partidosColumns}
        data={Array.isArray(filteredPartidos) ? filteredPartidos : []}
        onEdit={(row) => setFormData(row as Partido)}
        onDelete={(row) => handleDeletePartido(row as Partido)}
      />

      {/* ✅ Mostrar información útil sobre equipos disponibles */}
      {formData.nrofecha && formData.idzona && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>Fecha {formData.nrofecha}:</strong>{" "}
            {equiposDisponibles.length} equipos disponibles
            {equiposDisponibles.length < equiposPartido.length && (
              <span className="text-orange-600 ml-2">
                ({equiposPartido.length - equiposDisponibles.length} equipos ya
                tienen partido programado)
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Partidos;
