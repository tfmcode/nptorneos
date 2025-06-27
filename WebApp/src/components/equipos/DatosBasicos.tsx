import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { Equipo } from "../../types/equipos";
import { fetchSedes } from "../../store/slices/sedeSlice";
import { saveEquipoThunk } from "../../store/slices/equiposSlice";
import DynamicForm from "../forms/DynamicForm";

interface Props {
  formData: Equipo;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

const DatosBasicos = ({ formData, onChange }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sedes } = useSelector((state: RootState) => state.sedes);

  useEffect(() => {
    dispatch(fetchSedes());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...equipoData } = formData;
      await dispatch(saveEquipoThunk(id ? formData : equipoData)).unwrap();
    } catch (error) {
      console.error("❌ Error al guardar equipo:", error);
    }
  };

  return (
    <div>
      <DynamicForm
        fields={[
          {
            name: "nombre",
            type: "text",
            placeholder: "Nombre del Equipo",
            value: formData.nombre ?? "",
            colSpan: 2,
          },
          {
            name: "abrev",
            type: "text",
            placeholder: "Abreviatura",
            value: formData.abrev ?? "",
          },
          {
            name: "contacto",
            type: "text",
            placeholder: "Nombre del Contacto",
            value: formData.contacto ?? "",
          },
          {
            name: "telefonocto",
            type: "text",
            placeholder: "Teléfono del Contacto",
            value: formData.telefonocto ?? "",
          },
          {
            name: "celularcto",
            type: "text",
            placeholder: "Celular del Contacto",
            value: formData.celularcto ?? "",
          },
          {
            name: "emailcto",
            type: "email",
            placeholder: "Email del Contacto",
            value: formData.emailcto ?? "",
          },
          {
            name: "contrasenia",
            type: "password",
            placeholder: "Contraseña",
            value: formData.contrasenia ?? "",
          },
          {
            name: "iniciales",
            type: "text",
            placeholder: "Iniciales",
            value: formData.iniciales ?? "",
          },
          {
            name: "codestado",
            type: "select",
            options: [
              { label: "Activo", value: 1 },
              { label: "Inactivo", value: 0 },
            ],
            value: formData.codestado ?? 1,
            label: "Estado",
          },
          {
            name: "idsede",
            type: "select",
            options: sedes.map((s) => ({
              label: s.nombre,
              value: s.id ?? 0,
            })),
            value: formData.idsede ?? 0,
            label: "Sede",
          },
          {
            name: "foto",
            type: "text",
            placeholder: "URL de Foto",
            value: formData.foto ?? "",
          },
          {
            name: "observ",
            type: "textarea",
            placeholder: "Observaciones",
            value: formData.observ ?? "",
            colSpan: 2,
          },
          {
            name: "saldodeposito",
            type: "number",
            value: formData.saldodeposito ?? 0,
            label: "Saldo a favor",
          },
        ]}
        onChange={onChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar"
      />
    </div>
  );
};

export default DatosBasicos;
