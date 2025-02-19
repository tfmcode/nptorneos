import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Championship } from "../../types/championship";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchChampionships,
  saveChampionshipThunk,
  removeChampionship,
} from "../../store/slices/championshipSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { championshipColumns } from "../../components/tables";

const Championships: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { championships, loading, error } = useSelector(
    (state: RootState) => state.championships
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Championship>({
    name: "",
    sport: "Futbol",
    enabled: true,
    _id: "",
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState(""); // Estado temporal del input
  const [searchTerm, setSearchTerm] = useState(""); // Estado aplicado al filtrar

  useEffect(() => {
    dispatch(fetchChampionships());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { _id, ...championshipData } = formData;
      await dispatch(
        saveChampionshipThunk(_id ? formData : championshipData)
      ).unwrap();

      // ✅ Actualiza Redux manualmente sin hacer otra petición
      dispatch(fetchChampionships()); // 🔥 Asegura actualización inmediata

      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar campeonato:", err);
    }
  };

  const handleDelete = async (championship: Championship) => {
    await dispatch(removeChampionship(championship._id)).unwrap();
    dispatch(fetchChampionships()); // 🔥 Asegura actualización inmediata
  };

  // 🔥 Aplica el filtro solo cuando se presiona el botón
  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
  };

  // 🔥 Solo filtra cuando `searchTerm` cambia
  const filteredChampionships = searchTerm
    ? championships.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : championships;

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
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

        {/* 🔥 SearchField con botón integrado */}
        <SearchField
          placeholder="Buscar por nombre o email"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch} // 🔥 Botón dispara la búsqueda
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Championship>
          columns={championshipColumns}
          data={filteredChampionships}
          onEdit={(row) => handleOpenModal(row as Championship)}
          onDelete={handleDelete}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData._id ? "Editar Campeonato" : "Crear Campeonato"}
        >
          <DynamicForm
            fields={[
              {
                name: "name",
                type: "text",
                placeholder: "Nombre",
                value: formData.name,
              },
              {
                name: "sport",
                type: "select",
                options: [
                  { label: "Futbol", value: "Futbol" },
                  { label: "Otro", value: "Otro" },
                ],
                value: formData.sport,
              },
              {
                name: "enabled",
                type: "checkbox",
                label: "Habilitado",
                value: formData.enabled,
              },
            ]}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            submitLabel="Guardar"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Championships;
