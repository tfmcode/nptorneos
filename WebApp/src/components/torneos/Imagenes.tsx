import React, { useEffect } from "react";
import DynamicForm from "../forms/DynamicForm";
import { StatusMessage } from "../common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchZonasByTorneo } from "../../store/slices/zonaSlice";
import { TorneosImagen } from "../../types/torneosImagenes";
import {
  fetchTorneoImagenesByTorneo,
  saveTorneoImagenThunk,
  setTorneoImagenError,
} from "../../store/slices/torneosImagenSlice";
import { uploadImage } from "../../api/torneosImagenesService";
import ImageTournamentsTable from "../tables/ImageTournamentsTable";

interface ImagenesProps {
  idtorneo: number;
}

function Imagenes({ idtorneo }: ImagenesProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);

  const [processedImage, setProcessedImage] = React.useState<string | null>(
    null
  );

  const { zonas } = useSelector((state: RootState) => state.zonas);
  const { imagenes, loading, error } = useSelector(
    (state: RootState) => state.torneosImagenes
  );

  const [data, setData] = React.useState<TorneosImagen[]>([]);

  const initialFormData: TorneosImagen = {
    id: undefined,
    idtorneo: idtorneo,
    idzona: 0,
    idimagen: 0,
    descripcion: "",
    nombre: "",
    ubicacion: "wtorneos/files/",
    home: 1,
    orden: 0,
    fhcarga: "",
    usrultmod: user?.idusuario ?? 0,
    fhultmod: new Date().toISOString(),
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

      // Upload image if one was processed
      let fileName = formData.nombre;
      if (processedImage) {
        try {
          fileName = await uploadImage(processedImage);
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          dispatch(setTorneoImagenError("Error uploading image"));
          return;
        }
      }

      setFormData({
        ...formData,
        fhcarga: new Date().toISOString(),
        usrultmod: user?.idusuario ?? 0,
        fhultmod: new Date().toISOString(),
      });

      const { id, ...torneosImagenData } = { ...formData, nombre: fileName };
      await dispatch(
        saveTorneoImagenThunk(
          id ? { ...formData, nombre: fileName } : torneosImagenData
        )
      ).unwrap();
      dispatch(fetchTorneoImagenesByTorneo(idtorneo ?? 0));
      setFormData({
        ...initialFormData,
        idzona: formData.idzona,
      });
      setProcessedImage(null);
    } catch (err) {
      console.error("Error al guardar imagen:", err);
    }
  };

  const handleFileChange = async (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();

        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          // 80% quality
          const webpDataUrl = canvas.toDataURL("image/webp", 0.8);

          setProcessedImage(webpDataUrl);
          setFormData({ ...formData, nombre: file.name });
        };

        img.onerror = () => {
          console.error("Error loading image for conversion");
          dispatch(setTorneoImagenError("Error loading image for conversion"));
        };

        img.src = URL.createObjectURL(file);
      } catch (error) {
        console.error("Error processing file:", error);
        dispatch(setTorneoImagenError("Error processing file"));
      }
    }
  };

  useEffect(() => {
    const maxOrden = imagenes.reduce(
      (max, imagen) => Math.max(max, imagen.orden ?? 0),
      0
    );
    setFormData({ ...formData, orden: maxOrden + 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagenes]);

  useEffect(() => {
    const filteredImagenes = Array.isArray(imagenes)
      ? imagenes.filter((imagen) => imagen.idzona === formData.idzona)
      : [];
    setData(filteredImagenes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.idzona]);

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
            onChange: handleFileChange,
          },
        ]}
        onChange={handleInputChange}
        onSubmit={handleSubmit}
        submitLabel="Agregar"
      />
      <StatusMessage loading={loading} error={error} />

      <ImageTournamentsTable data={data} setData={setData} />
    </div>
  );
}

export default Imagenes;
