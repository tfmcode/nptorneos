import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { Equipo } from "../../types/equipos";
import { fetchSedes } from "../../store/slices/sedeSlice";
import { saveEquipoThunk } from "../../store/slices/equiposSlice";
import DynamicForm from "../forms/DynamicForm";
import { PopupNotificacion } from "../common/PopupNotificacion";
import ImageUploaderInline from "../common/ImageUploaderWithCrop";

interface Props {
  formData: Equipo;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
}

interface ValidationError {
  field: string;
  message: string;
}

const DatosBasicos = ({ formData, onChange }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { sedes } = useSelector((state: RootState) => state.sedes);

  const [showPopup, setShowPopup] = useState({
    open: false,
    type: "error" as "success" | "error" | "warning",
    message: "",
  });

  useEffect(() => {
    dispatch(fetchSedes());
  }, [dispatch]);

  const validateForm = (): ValidationError[] => {
    const errors: ValidationError[] = [];

    if (!formData.nombre?.trim()) {
      errors.push({
        field: "nombre",
        message: "El nombre del equipo es obligatorio",
      });
    }

    const iniciales = formData.iniciales?.trim();
    if (!iniciales) {
      errors.push({
        field: "iniciales",
        message: "Las iniciales son obligatorias",
      });
    } else if (iniciales.length < 2 || iniciales.length > 3) {
      errors.push({
        field: "iniciales",
        message: "Las iniciales deben tener entre 2 y 3 caracteres",
      });
    } else if (!/^[A-Za-z]+$/.test(iniciales)) {
      errors.push({
        field: "iniciales",
        message: "Las iniciales solo pueden contener letras",
      });
    }

    if (!formData.idsede || formData.idsede === 0) {
      errors.push({
        field: "idsede",
        message: "Debe seleccionar una sede",
      });
    }

    if (!formData.emailcto?.trim()) {
      errors.push({
        field: "emailcto",
        message: "El email es obligatorio",
      });
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailcto)) {
        errors.push({
          field: "emailcto",
          message: "El formato del email no es válido",
        });
      }
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors = validateForm();

    if (errors.length > 0) {
      const errorMessages = errors
        .map((error) => `• ${error.message}`)
        .join("<br>");
      setShowPopup({
        open: true,
        type: "warning",
        message: `Por favor corrige los siguientes errores:<br><br>${errorMessages}`,
      });
      return;
    }

    try {
      const { id, ...equipoData } = formData;
      await dispatch(saveEquipoThunk(id ? formData : equipoData)).unwrap();

      setShowPopup({
        open: true,
        type: "success",
        message: `Equipo ${id ? "actualizado" : "creado"} exitosamente`,
      });
    } catch (error) {
      console.error("❌ Error al guardar equipo:", error);
      setShowPopup({
        open: true,
        type: "error",
        message: "Error al guardar el equipo. Por favor intenta nuevamente.",
      });
    }
  };

  return (
    <div>
      <PopupNotificacion
        open={showPopup.open}
        type={showPopup.type}
        message={showPopup.message}
        onClose={() => setShowPopup({ ...showPopup, open: false })}
      />

      {!formData.id && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            ℹ️ El logo del equipo se puede agregar después de crear el registro
          </p>
        </div>
      )}

      {/* ✅ NUEVO DISEÑO: Logo arriba + nombre/abrev al lado */}
      {formData.id && (
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-6 mb-6">
            {/* Logo - Izquierda */}
            <div className="flex-shrink-0">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo del Equipo
              </label>
              <ImageUploaderInline
                entityId={formData.id}
                entityType="equipo"
                currentImageUrl={formData.foto}
                size="large"
                aspectRatio={1}
                onUploadSuccess={(imageUrl) => {
                  console.log("✅ Logo subido:", imageUrl);
                  setShowPopup({
                    open: true,
                    type: "success",
                    message: "Logo actualizado correctamente",
                  });
                }}
                onUploadError={(error) => {
                  setShowPopup({
                    open: true,
                    type: "error",
                    message: `Error al subir logo: ${error}`,
                  });
                }}
                onDeleteSuccess={() => {
                  setShowPopup({
                    open: true,
                    type: "success",
                    message: "Logo eliminado correctamente",
                  });
                }}
              />
            </div>

            {/* Nombre y Abreviatura - Derecha */}
            <div className="flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Equipo *
                </label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre ?? ""}
                  onChange={onChange}
                  placeholder="Nombre completo del equipo"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Abreviatura
                </label>
                <input
                  type="text"
                  name="abrev"
                  value={formData.abrev ?? ""}
                  onChange={onChange}
                  placeholder="Ej: FCB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✅ RESTO DE CAMPOS EN GRID 2 COLUMNAS */}
      <DynamicForm
        fields={[
          // Si NO hay ID, mostrar nombre completo arriba
          ...(!formData.id
            ? [
                {
                  name: "nombre",
                  type: "text" as const,
                  placeholder: "Nombre del Equipo (Obligatorio)",
                  value: formData.nombre ?? "",
                  colSpan: 2,
                },
                {
                  name: "abrev",
                  type: "text" as const,
                  placeholder: "Abreviatura",
                  value: formData.abrev ?? "",
                },
              ]
            : []),
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
            placeholder: "Email del Contacto (Obligatorio)",
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
            placeholder: "Iniciales 2-3 letras (Obligatorio)",
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
            options: [
              { label: "Seleccionar Sede (Obligatorio)", value: 0 },
              ...sedes.map((s) => ({
                label: s.nombre,
                value: s.id ?? 0,
              })),
            ],
            value: formData.idsede ?? 0,
            label: "Sede",
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
