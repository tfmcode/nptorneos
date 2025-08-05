import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Campeonato } from "../../types/campeonato";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchCampeonatos,
  saveCampeonatoThunk,
  removeCampeonato,
} from "../../store/slices/campeonatoSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
  PopupNotificacion,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { campeonatoColumns } from "../../components/tables";

const Campeonatos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { campeonatos, loading, error } = useSelector(
    (state: RootState) => state.campeonatos
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Campeonato>({
    nombre: "",
    coddeporte: 1,
    codestado: 1,
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
    dispatch(fetchCampeonatos());
  }, [dispatch]);

  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errores: string[] = [];

    if (!formData.nombre?.trim()) {
      errores.push("• Ingresar el nombre del campeonato");
    }

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const { id, ...campeonatoData } = formData;
      await dispatch(
        saveCampeonatoThunk(id ? formData : campeonatoData)
      ).unwrap();
      dispatch(fetchCampeonatos());
      handleCloseModal();
      showPopup("success", "Campeonato guardado correctamente");
    } catch (err) {
      console.error("Error al guardar campeonato:", err);
      showPopup("error", "Error al guardar el campeonato");
    }
  };

  const handleDelete = async (campeonato: Campeonato) => {
    await dispatch(removeCampeonato(campeonato.id!)).unwrap();
    dispatch(fetchCampeonatos());
  };

  const filteredCampeonatos = Array.isArray(campeonatos)
    ? campeonatos.filter((campeonato) =>
        campeonato.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Campeonatos"
          actions={[
            {
              label: "Agregar Campeonato",
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

        <DataTable<Campeonato>
          columns={campeonatoColumns}
          data={Array.isArray(filteredCampeonatos) ? filteredCampeonatos : []}
          onEdit={(row) => handleOpenModal(row as Campeonato)}
          onDelete={(row) => handleDelete(row as Campeonato)}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Campeonato" : "Crear Campeonato"}
        >
          <DynamicForm
            fields={[
              {
                name: "nombre",
                type: "text",
                placeholder: "Nombre del Campeonato",
                value: formData.nombre ?? "",
              },
              {
                name: "coddeporte",
                type: "number",
                placeholder: "Código de Deporte",
                value: formData.coddeporte ?? 1,
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

export default Campeonatos;
