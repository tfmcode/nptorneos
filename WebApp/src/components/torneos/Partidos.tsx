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
    nrofecha: 1,
    fecha: "",
    horario: "",
    idsede: 0,
    codtipo: 9,
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
  const [persistentFilters, setPersistentFilters] = useState({
    idzona: 0,
    nrofecha: 1,
    fecha: "",
    idsede: 0,
    codtipo: 9,
  });

  const { formData, setFormData, handleInputChange } = useCrudForm<Partido>({
    ...initialFormData,
    ...persistentFilters,
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

  const zonaSeleccionada = zonas.find((z) => z.id === formData.idzona);
  const cantidadFechasZona = zonaSeleccionada?.codcantfechas ?? 20;

  const partidosFiltradosPorZona = Array.isArray(partidos)
    ? partidos.filter((partido) => partido.idzona === formData.idzona)
    : [];

  const partidosFiltradosPorFecha = partidosFiltradosPorZona.filter(
    (partido) => partido.nrofecha === formData.nrofecha
  );

  const validatePartido = (): string[] => {
    const errores: string[] = [];

    if (!formData.idzona || formData.idzona === 0) {
      errores.push("• Seleccionar una zona");
    }
    if (!formData.nrofecha || formData.nrofecha === 0) {
      errores.push("• Ingresar el número de fecha");
    }
    if (formData.nrofecha && formData.nrofecha > cantidadFechasZona) {
      errores.push(
        `• El número de fecha no puede ser mayor a ${cantidadFechasZona} (total de fechas de la zona)`
      );
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

    if (formData.idequipo1 === formData.idequipo2 && formData.idequipo1 !== 0) {
      errores.push("• No se puede crear un partido entre el mismo equipo");
    }

    const partidosEnFecha = partidosFiltradosPorZona.filter(
      (p) => p.nrofecha === formData.nrofecha && p.id !== formData.id
    );

    const equiposOcupados = new Set<number>();
    partidosEnFecha.forEach((p) => {
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

      const newFormData = {
        ...initialFormData,
        idzona: formData.idzona,
        nrofecha: formData.nrofecha,
        fecha: formData.fecha ? formData.fecha.split(" ")[0] : "",
        idsede: formData.idsede,
        codtipo: formData.codtipo,
        idequipo1: 0,
        idequipo2: 0,
      };

      setFormData(newFormData);

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

  const getEquiposDisponibles = (): ZonaEquipo[] => {
    if (!formData.nrofecha || !formData.idzona) return equiposPartido;

    const partidosEnFecha = partidosFiltradosPorZona.filter(
      (p) => p.nrofecha === formData.nrofecha && p.id !== formData.id
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
            type: "select",
            value: formData.nrofecha ?? 1,
            label: "Nro. Fecha",
            options: Array.from({ length: cantidadFechasZona }, (_, i) => ({
              value: i + 1,
              label: `Fecha ${i + 1}`,
            })),
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

      {formData.nrofecha && formData.idzona !== 0 && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-sm text-blue-700">
            <strong>Zona:</strong> {zonaSeleccionada?.nombre}
            {" • "}
            <strong>Total de fechas:</strong> {cantidadFechasZona}
            {" • "}
            <strong>Fecha {formData.nrofecha}:</strong>{" "}
            {equiposDisponibles.length} equipos disponibles
            {equiposDisponibles.length < equiposPartido.length && (
              <span className="text-orange-600 ml-2">
                ({equiposPartido.length - equiposDisponibles.length} ya tienen
                partido)
              </span>
            )}
            {" • "}
            <strong>{partidosFiltradosPorFecha.length}</strong> partidos
            programados
          </div>
        </div>
      )}

      <DataTable<Partido>
        columns={partidosColumns}
        data={partidosFiltradosPorFecha}
        onEdit={(row) => setFormData(row as Partido)}
        onDelete={(row) => handleDeletePartido(row as Partido)}
      />
    </div>
  );
}

export default Partidos;
