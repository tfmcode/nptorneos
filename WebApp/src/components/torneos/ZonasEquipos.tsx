import React, { useEffect } from "react";
import DynamicForm from "../forms/DynamicForm";
import { StatusMessage } from "../common";
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

  const { formData, setFormData, handleInputChange } =
    useCrudForm<ZonaEquipo>(initialFormData);

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
            name: "nombre",
            type: "text",
            value: formData.nombre ?? "",
            label: "Equipo",
          },
          {
            name: "valor_insc",
            type: "money",
            value: formData.valor_insc ?? 0,
            label: "Valor Inscripción",
          },
          {
            name: "valor_fecha",
            type: "money",
            value: formData.valor_fecha ?? 0,
            label: "Valor Fecha",
          },
        ]}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLabel="Agregar"
      />
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
