import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Sede } from "../../types/sede";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchSedes,
  saveSedeThunk,
  removeSede,
} from "../../store/slices/sedeSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
  PopupNotificacion,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { sedeColumns } from "../../components/tables/columns/sedeColumns";

const Sedes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { sedes, loading, error } = useSelector(
    (state: RootState) => state.sedes
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Sede>({
    nombre: "",
    domicilio: "",
    provincia: "",
    telefono: "",
    email: "",
    contacto: "",
    emailcto: "",
    telefonocto: "",
    celularcto: "",
    latitud: "",
    longitud: "",
    descripcion: "",
    codestado: 1,
    mapa: 0,
    cpostal: "",
    localidad: "",
    id: undefined,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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
    dispatch(fetchSedes());
  }, [dispatch]);

  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errores: string[] = [];

    if (!formData.nombre) errores.push("• Ingresar el nombre");
    if (!formData.domicilio) errores.push("• Ingresar el domicilio");
    if (!formData.cpostal) errores.push("• Ingresar el cod. postal");
    if (!formData.telefono) errores.push("• Ingresar el teléfono");

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const { id, ...sedeData } = formData;
      await dispatch(saveSedeThunk(id ? formData : sedeData)).unwrap();
      dispatch(fetchSedes());
      handleCloseModal();
      showPopup("success", "Sede guardada correctamente");
    } catch (err) {
      console.error("Error al guardar sede:", err);
      showPopup("error", "Error al guardar la sede");
    }
  };

  const handleDelete = async (sede: Sede) => {
    await dispatch(removeSede(sede.id!)).unwrap();
    dispatch(fetchSedes());
  };

  const filteredSedes = Array.isArray(sedes)
    ? sedes.filter((sede) =>
        sede.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Sedes"
          actions={[
            {
              label: "Agregar Sede",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por nombre"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Sede>
          columns={sedeColumns}
          data={Array.isArray(filteredSedes) ? filteredSedes : []}
          onEdit={(row) => handleOpenModal(row as Sede)}
          onDelete={(row) => handleDelete(row as Sede)}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Sede" : "Crear Sede"}
        >
          <DynamicForm
            fields={[
              {
                name: "nombre",
                type: "text",
                placeholder: "Nombre",
                value: formData.nombre ?? "",
              },
              {
                name: "domicilio",
                type: "text",
                placeholder: "Domicilio",
                value: formData.domicilio ?? "",
              },
              {
                name: "cpostal",
                type: "text",
                placeholder: "Código Postal",
                value: formData.cpostal ?? "",
              },
              {
                name: "telefono",
                type: "text",
                placeholder: "Teléfono",
                value: formData.telefono ?? "",
              },
              {
                name: "localidad",
                type: "text",
                placeholder: "Localidad",
                value: formData.localidad ?? "",
              },
              {
                name: "provincia",
                type: "text",
                placeholder: "Provincia",
                value: formData.provincia ?? "",
              },
              {
                name: "email",
                type: "email",
                placeholder: "Email",
                value: formData.email ?? "",
              },
              {
                name: "contacto",
                type: "text",
                placeholder: "Nombre del Contacto",
                value: formData.contacto ?? "",
              },
              {
                name: "emailcto",
                type: "email",
                placeholder: "Email del Contacto",
                value: formData.emailcto ?? "",
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
                name: "mapa",
                type: "checkbox",
                label: "Mostrar en Mapa",
                value: Boolean(formData.mapa),
              },
              {
                name: "latitud",
                type: "text",
                placeholder: "Latitud",
                value: formData.latitud ?? "",
              },
              {
                name: "longitud",
                type: "text",
                placeholder: "Longitud",
                value: formData.longitud ?? "",
              },
              {
                name: "descripcion",
                type: "text",
                placeholder: "Descripción",
                value: formData.descripcion ?? "",
              },
              {
                name: "codestado",
                type: "select",
                options: [
                  { label: "Activo", value: 1 },
                  { label: "Inactivo", value: 0 },
                ],
                value: formData.codestado ?? 1,
              },
            ]}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            submitLabel="Guardar"
          />
          <PopupNotificacion
            open={popup.open}
            type={popup.type}
            message={popup.message}
            onClose={() => setPopup({ ...popup, open: false })}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Sedes;
