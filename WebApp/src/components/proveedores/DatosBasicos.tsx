import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { Proveedor } from "../../types/proveedores";
import DynamicForm from "../forms/DynamicForm";
import { saveProveedorThunk } from "../../store/slices/proveedoresSlice";

interface DatosBasicosProps {
  formData: Proveedor;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

function DatosBasicos({ formData, onChange }: DatosBasicosProps) {
  const dispatch = useDispatch<AppDispatch>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...proveedorData } = formData;

      if (proveedorData.codtipo !== 4 && proveedorData.cuit === "") {
        delete proveedorData.cuit;
      }

      await dispatch(
        saveProveedorThunk(id ? formData : proveedorData)
      ).unwrap();
    } catch (err) {
      console.error("Error al guardar proveedor:", err);
    }
  };

  const fields = [
    {
      name: "nombre",
      type: "text" as const,
      placeholder: "Nombre del Proveedor",
      value: formData.nombre ?? "",
      colSpan: 2,
    },
    {
      name: "codtipo",
      type: "select" as const,
      options: [
        { label: "ÁRBITRO", value: 1 },
        { label: "PROFESOR", value: 2 },
        { label: "SERV. MÉDICO", value: 3 },
        { label: "OTROS", value: 4 },
      ],
      value: formData.codtipo ?? 0,
      label: "Tipo de Proveedor",
    },
    ...(formData.codtipo === 4
      ? [
          {
            name: "nombrefiscal",
            type: "text" as const,
            placeholder: "Nombre Fiscal",
            value: formData.nombrefiscal ?? "",
          },
          {
            name: "codcateg",
            type: "select" as const,
            options: [
              { label: "Consumidor Final", value: 1 },
              { label: "Exento", value: 2 },
              { label: "Monotributo", value: 3 },
              { label: "Resp. Inscripto", value: 4 },
            ],
            value: formData.codcateg ?? 1,
            label: "Categoría",
          },
          {
            name: "cuit",
            type: "text" as const,
            placeholder: "CUIT",
            value: formData.cuit ?? "",
          },
          {
            name: "fax",
            type: "text" as const,
            placeholder: "Fax",
            value: formData.fax ?? "",
          },
          {
            name: "contacto",
            type: "text" as const,
            placeholder: "Contacto",
            value: formData.contacto ?? "",
          },
          {
            name: "producto",
            type: "text" as const,
            placeholder: "Producto",
            value: formData.producto ?? "",
          },
          {
            name: "codtipogasto",
            type: "select" as const,
            options: [
              { label: "Directo", value: 1 },
              { label: "Indirecto", value: 2 },
            ],
            value: formData.codtipogasto ?? 2,
            label: "Tipo de Gasto",
          },
        ]
      : []),
    ...(formData.codtipo === 2
      ? [
          {
            name: "documento",
            type: "text" as const,
            placeholder: "Documento",
            value: formData.documento ?? "",
          },
          {
            name: "fhnac",
            type: "date" as const,
            value: formData.fhnac ?? "",
            label: "Fecha de Nacimiento",
          },
          {
            name: "estcivil",
            type: "text" as const,
            placeholder: "Estado Civil",
            value: formData.estcivil ?? "",
          },
          {
            name: "hijos",
            type: "text" as const,
            placeholder: "Cantidad de Hijos",
            value: formData.hijos ?? "",
          },
          {
            name: "estudios",
            type: "text" as const,
            placeholder: "Estudios",
            value: formData.estudios ?? "",
          },
          {
            name: "facebook",
            type: "text" as const,
            placeholder: "Facebook",
            value: formData.facebook ?? "",
          },
          {
            name: "valor_hora",
            type: "money" as const,
            value: formData.valor_hora ?? 0,
            label: "Valor Hora",
          },
          {
            name: "valor_fijo",
            type: "money" as const,
            value: formData.valor_fijo ?? 0,
            label: "Valor Fijo",
          },
          {
            name: "sumarhs",
            type: "checkbox" as const,
            value: formData.sumarhs ?? 0,
            label: "Sumar Horas a Liquidación",
          },
          {
            name: "contrasenia",
            type: "text" as const,
            placeholder: "Contraseña",
            value: formData.contrasenia ?? "",
          },
          {
            name: "sedes",
            type: "text" as const,
            placeholder: "Sedes (separadas por coma)",
            value: formData.sedes ?? "",
          },
        ]
      : []),
    {
      name: "domicilio",
      type: "text" as const,
      placeholder: "Domicilio",
      value: formData.domicilio ?? "",
    },
    {
      name: "cpostal",
      type: "text" as const,
      placeholder: "Código Postal",
      value: formData.cpostal ?? "",
    },
    {
      name: "localidad",
      type: "text" as const,
      placeholder: "Localidad",
      value: formData.localidad ?? "",
    },
    {
      name: "provincia",
      type: "text" as const,
      placeholder: "Provincia",
      value: formData.provincia ?? "",
    },
    {
      name: "pais",
      type: "text" as const,
      placeholder: "País",
      value: formData.pais ?? "Argentina",
    },
    {
      name: "telefono",
      type: "text" as const,
      placeholder: "Teléfono",
      value: formData.telefono ?? "",
    },
    {
      name: "celular",
      type: "text" as const,
      placeholder: "Celular",
      value: formData.celular ?? "",
    },
    {
      name: "email",
      type: "text" as const,
      placeholder: "Email",
      value: formData.email ?? "",
    },
  ];

  return (
    <div>
      <DynamicForm
        fields={fields}
        onChange={onChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar"
      />
    </div>
  );
}

export default DatosBasicos;
