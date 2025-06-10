import React, { useEffect } from "react";
import DynamicForm from "../forms/DynamicForm";
import { StatusMessage } from "../common";
import { DataTable, torneosImagenesColumns } from "..";
import { useCrudForm } from "../../hooks/useCrudForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchZonasByTorneo } from "../../store/slices/zonaSlice";
import { TorneosImagen } from "../../types/torneosImagenes";
import {
  fetchTorneoImagenesByTorneo,
  removeTorneoImagen,
  saveTorneoImagenThunk,
  setTorneoImagenError,
} from "../../store/slices/torneosImagenSlice";

interface ImagenesProps {
  idtorneo: number;
}

function Imagenes({ idtorneo }: ImagenesProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { zonas } = useSelector((state: RootState) => state.zonas);
  const { imagenes, loading, error } = useSelector(
    (state: RootState) => state.torneosImagenes
  );

  const initialFormData: TorneosImagen = {
    id: undefined,
    idtorneo: idtorneo,
    idzona: 0,
    idimagen: 0,
    descripcion: "",
    nombre: "",
    ubicacion: "",
    home: 0,
    orden: 0,
    fhcarga: "",
    usrultmod: 0,
    fhultmod: "",
    fhbaja: "",
  };

  useEffect(() => {
    dispatch(fetchZonasByTorneo(idtorneo));
    dispatch(fetchTorneoImagenesByTorneo(idtorneo ?? 0));
  }, [dispatch, idtorneo]);

  const { formData, setFormData, handleInputChange } =
    useCrudForm<TorneosImagen>(initialFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.idzona == null || formData.idzona == 0) {
        dispatch(
          setTorneoImagenError(
            "No se puede guardar un equipo sin una zona seleccionada"
          )
        );
        return;
      }
      const { id, ...torneosImagenData } = formData;
      await dispatch(
        saveTorneoImagenThunk(id ? formData : torneosImagenData)
      ).unwrap();
      dispatch(fetchTorneoImagenesByTorneo(idtorneo ?? 0));
      setFormData({
        ...initialFormData,
        idzona: formData.idzona,
      });
    } catch (err) {
      console.error("Error al guardar zona equipo:", err);
    }
  };

  const handleDelete = async (torneosImagen: TorneosImagen) => {
    await dispatch(removeTorneoImagen(torneosImagen.id!)).unwrap();
    dispatch(fetchTorneoImagenesByTorneo(idtorneo ?? 0));
  };

  const filteredImagenes = Array.isArray(imagenes)
    ? imagenes.filter((imagen) => imagen.idzona === formData.idzona)
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
            name: "descripcion",
            type: "text",
            value: formData.descripcion ?? "",
            label: "Descripción",
          },
          {
            name: "nombre",
            type: "file",
            value: formData.nombre ?? "",
            label: "Subir Imagenes",
          },
        ]}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLabel="Agregar"
      />
      <StatusMessage loading={loading} error={error} />

      <DataTable<TorneosImagen>
        columns={torneosImagenesColumns}
        data={Array.isArray(filteredImagenes) ? filteredImagenes : []}
        onEdit={(row) => setFormData(row as TorneosImagen)}
        onDelete={(row) => handleDelete(row as TorneosImagen)}
      />
    </div>
  );
}

export default Imagenes;
