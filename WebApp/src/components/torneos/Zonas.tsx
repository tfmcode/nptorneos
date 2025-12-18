import React, { useEffect, useState } from "react";
import { Zona } from "../../types/zonas";
import DynamicForm from "../forms/DynamicForm";
import { DataTable, zonaColumns } from "..";
import { removeZona } from "../../store/slices/zonaSlice";
import { useCrudForm } from "../../hooks/useCrudForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchZonasByTorneo,
  saveZonaThunk,
} from "../../store/slices/zonaSlice";
import { PopupNotificacion } from "../common/PopupNotificacion";

interface ZonasProps {
  idtorneo: number;
}

function Zonas({ idtorneo }: ZonasProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { zonas } = useSelector((state: RootState) => state.zonas);

  // ✅ Estado para el popup de notificaciones
  const [popup, setPopup] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    message: "",
  });

  const showPopup = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setPopup({ open: true, type, message });
    setTimeout(() => setPopup({ ...popup, open: false }), 4000);
  };

  useEffect(() => {
    dispatch(fetchZonasByTorneo(idtorneo));
  }, [dispatch, idtorneo]);

  const { formData, setFormData, handleInputChange } = useCrudForm<Zona>({
    id: undefined,
    nombre: "",
    abrev: "",
    codcantfechas: 1,
    codfechaactual: 1,
    amistoso: 0,
    idtorneo: idtorneo,
    codestado: 1,
    idusuario: user?.idusuario ?? 0,
    fhcarga: undefined,
    fhbaja: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // ✅ Validaciones
    const errores: string[] = [];

    // Validar que hay un torneo seleccionado
    if (idtorneo == null || idtorneo == 0) {
      showPopup(
        "warning",
        "No se puede guardar una zona sin un torneo seleccionado"
      );
      return;
    }

    // Validar nombre
    if (!formData.nombre || formData.nombre.trim() === "") {
      errores.push("• El nombre es obligatorio");
    }

    // Validar abreviatura (min 2, max 12 caracteres)
    if (!formData.abrev || formData.abrev.trim().length < 2) {
      errores.push("• La abreviatura debe tener al menos 2 caracteres");
    }

    if (formData.abrev && formData.abrev.trim().length > 12) {
      errores.push("• La abreviatura no puede tener más de 12 caracteres");
    }

    // Validar cantidad de fechas (mínimo 1)
    if (!formData.codcantfechas || formData.codcantfechas < 1) {
      errores.push("• La cantidad de fechas debe ser al menos 1");
    }

    // ✅ Si hay errores, mostrar popup y no enviar
    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const { id, ...zonaData } = formData;
      await dispatch(saveZonaThunk(id ? formData : zonaData)).unwrap();

      // ✅ Mostrar mensaje de éxito
      showPopup(
        "success",
        id ? "Zona actualizada correctamente" : "Zona agregada correctamente"
      );

      dispatch(fetchZonasByTorneo(idtorneo ?? 0));

      // Limpiar formulario
      setFormData({
        id: undefined,
        nombre: "",
        abrev: "",
        codcantfechas: 1,
        codfechaactual: 1,
        amistoso: 0,
        idtorneo: idtorneo ?? 0,
        codestado: 1,
        idusuario: user?.idusuario ?? 0,
        fhcarga: undefined,
        fhbaja: undefined,
      });
    } catch (err) {
      console.error("Error al guardar zona:", err);
      showPopup("error", "Error al guardar la zona");
    }
  };

  const handleDelete = async (zona: Zona) => {
    try {
      await dispatch(removeZona(zona.id!)).unwrap();
      showPopup("success", "Zona eliminada correctamente");
      dispatch(fetchZonasByTorneo(idtorneo ?? 0));
    } catch (err) {
      console.error("Error al eliminar zona:", err);
      showPopup("error", "Error al eliminar la zona");
    }
  };

  return (
    <div>
      <DynamicForm
        fields={[
          {
            name: "nombre",
            type: "text",
            value: formData.nombre,
            label: "Nombre",
            placeholder: "Nombre de la zona",
          },
          {
            name: "abrev",
            type: "text",
            value: formData.abrev,
            label: "Nombre Abrev.",
            placeholder: "Min 2, Max 12 caracteres",
          },
          {
            name: "codcantfechas",
            type: "select",
            value: formData.codcantfechas ?? 0,
            label: "Cant. de Fechas",
            options: [
              ...Array.from({ length: 20 }, (_, i) => ({
                value: i + 1,
                label: (i + 1).toString(),
              })),
            ],
          },
          {
            name: "codfechaactual",
            type: "select",
            value: formData.codfechaactual ?? 0,
            label: "Fecha Actual",
            options: [
              ...Array.from({ length: formData.codcantfechas || 1 }, (_, i) => ({
                value: i + 1,
                label: (i + 1).toString(),
              })),
            ],
          },
          {
            name: "amistoso",
            type: "checkbox",
            value: formData.amistoso ?? 0,
            label: "Amistoso",
          },
        ]}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLabel={formData.id ? "Actualizar" : "Agregar"}
      />

      <DataTable<Zona>
        columns={zonaColumns}
        data={Array.isArray(zonas) ? zonas : []}
        onEdit={(row) => setFormData(row as Zona)}
        onDelete={(row) => handleDelete(row as Zona)}
      />

      <PopupNotificacion
        open={popup.open}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ ...popup, open: false })}
      />
    </div>
  );
}

export default Zonas;
