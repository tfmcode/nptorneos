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
    dispatch(fetchZonasByTorneo(idtorneo));
    dispatch(fetchZonasEquiposByTorneo(idtorneo ?? 0));
    dispatch(fetchSedes());
  }, [dispatch, idtorneo]);

  const [equiposPartido, setEquiposPartido] = useState<ZonaEquipo[]>([]);

  const { formData, setFormData, handleInputChange } = useCrudForm<Partido>({
    id: undefined,
    idzona: 0,
    nrofecha: 0,
    fecha: "",
    horario: "",
    idsede: 0,
    codtipo: 0,
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
    ausente1: "",
    ausente2: "",
    idfecha: 0,
  });

  useEffect(() => {
    setEquiposPartido(
      zonasEquipos.filter((equipo) => equipo.idzona === formData.idzona)
    );
  }, [formData.idzona, zonasEquipos]);

  const handleSubmitPartido = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id == null || formData.id == 0) {
        dispatch(
          setZonasError(
            "No se puede guardar un partido sin una zona seleccionada"
          )
        );
        return;
      }
      const { id, ...partidoData } = formData;
      await dispatch(savePartidoThunk(id ? formData : partidoData)).unwrap();
      dispatch(fetchPartidosByZona(formData.idzona ?? 0));
    } catch (err) {
      console.error("Error al guardar partido:", err);
    }
  };

  const handleDeletePartido = async (partido: Partido) => {
    await dispatch(removePartido(partido.id!)).unwrap();
    dispatch(fetchPartidosByZona(formData.idzona ?? 0));
  };

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
            value: formData.fecha ?? "",
            label: "Fecha",
          },
          {
            name: "horario",
            type: "date",
            value: formData.fecha?.split(" ")[0] ?? "",
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
            options: equiposPartido.map((equipo) => ({
              value: equipo.idequipo ?? 0,
              label: equipo.nombre ?? "",
            })),
          },
          {
            name: "idequipo2",
            type: "select",
            value: formData.idequipo2 ?? 0,
            label: "Equipo Visitante",
            options: equiposPartido.map((equipo) => ({
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
    </div>
  );
}

export default Partidos;
