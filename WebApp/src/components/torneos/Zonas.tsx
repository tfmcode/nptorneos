import React, { useEffect } from "react";
import { Zona } from "../../types/zonas";
import DynamicForm from "../forms/DynamicForm";
import { StatusMessage } from "../common";
import { DataTable, zonaColumns } from "..";
import { removeZona } from "../../store/slices/zonaSlice";
import { useCrudForm } from "../../hooks/useCrudForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchZonasByTorneo,
  setZonasError,
  saveZonaThunk,
} from "../../store/slices/zonaSlice";

interface ZonasProps {
  idtorneo: number;
}

function Zonas({ idtorneo }: ZonasProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const {
    zonas,
    loading: loadingZonas,
    error: errorZonas,
  } = useSelector((state: RootState) => state.zonas);

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
    try {
      if (idtorneo == null || idtorneo == 0) {
        dispatch(
          setZonasError(
            "No se puede guardar una zona sin un torneo seleccionado"
          )
        );
        return;
      }
      const { id, ...zonaData } = formData;
      await dispatch(saveZonaThunk(id ? formData : zonaData)).unwrap();
      dispatch(fetchZonasByTorneo(idtorneo ?? 0));
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
    }
  };

  const handleDelete = async (zona: Zona) => {
    await dispatch(removeZona(zona.id!)).unwrap();
    dispatch(fetchZonasByTorneo(idtorneo ?? 0));
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
          },
          {
            name: "abrev",
            type: "text",
            value: formData.abrev,
            label: "Nombre Abrev.",
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
              ...Array.from({ length: 20 }, (_, i) => ({
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
        submitLabel="Agregar"
      />
      <StatusMessage loading={loadingZonas} error={errorZonas} />

      <DataTable<Zona>
        columns={zonaColumns}
        data={Array.isArray(zonas) ? zonas : []}
        onEdit={(row) => setFormData(row as Zona)}
        onDelete={(row) => handleDelete(row as Zona)}
      />
    </div>
  );
}

export default Zonas;
