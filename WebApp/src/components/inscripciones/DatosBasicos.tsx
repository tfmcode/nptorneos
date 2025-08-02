import React, { useEffect } from "react";
import { Inscripcion } from "../../types/inscripciones";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchTorneos } from "../../store/slices/torneoSlice";
import { fetchZonasByTorneo } from "../../store/slices/zonaSlice";
import DynamicForm from "../forms/DynamicForm";
import {
  fetchInscripciones,
  saveInscripcionThunk,
} from "../../store/slices/inscripcionSlice";

function DatosBasicos({
  formData,
  onChange,
}: {
  formData: Inscripcion;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}) {
  const dispatch = useDispatch<AppDispatch>();
  const { torneos } = useSelector((state: RootState) => state.torneos);
  const { zonas } = useSelector((state: RootState) => state.zonas);

  useEffect(() => {
    dispatch(fetchTorneos({ page: 1, limit: 1000, searchTerm: "" }));
    dispatch(fetchZonasByTorneo(formData.idtorneo ?? 0));
  }, [dispatch, formData.idtorneo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...inscripcionData } = formData;
      await dispatch(
        saveInscripcionThunk(id ? formData : inscripcionData)
      ).unwrap();
      dispatch(fetchInscripciones({ page: 1, limit: 10, searchTerm: "" }));
    } catch (err) {
      console.error("Error al guardar inscripción:", err);
    }
  };

  return (
    <div>
      <DynamicForm
        fields={[
          {
            name: "email",
            type: "email",
            placeholder: "Email",
            value: formData.email ?? "",
            colSpan: 2,
          },
          {
            name: "equipo",
            type: "text",
            placeholder: "Equipo",
            value: formData.equipo ?? "",
            colSpan: 2,
          },
          {
            name: "idtorneo",
            type: "select",
            placeholder: "Torneo",
            value: formData.idtorneo ?? "",
            options: [
              { label: "Seleccionar Torneo", value: 0 },
              ...torneos.map((torneo) => ({
                label: torneo.nombre,
                value: torneo.id ?? 0,
              })),
            ],
            colSpan: 2,
          },
          {
            name: "idzona",
            type: "select",
            placeholder: "Zona",
            value: formData.idzona ?? "",
            options: [
              { label: "Seleccionar Zona", value: 0 },
              ...zonas.map((zona) => ({
                label: zona.nombre,
                value: zona.id ?? 0,
              })),
            ],
            colSpan: 2,
          },
        ]}
        onChange={onChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar"
        disabled={formData.codestado === 1}
      />
    </div>
  );
}

export default DatosBasicos;
