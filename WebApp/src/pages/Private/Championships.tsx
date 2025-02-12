import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Championship } from "../../types/championship";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchChampionships,
  saveChampionship,
  removeChampionship,
} from "../../store/slices/championshipSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { championshipColumns } from "../../components/tables";
import { useCrudForm } from "../../components/hooks/useCrudForm";

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
    tournaments: [],
    enabled: true,
    _id: "",
  });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchChampionships());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await dispatch(saveChampionship(formData)).unwrap();
    handleCloseModal();
  };

  const filteredChampionships = championships.filter((championship) =>
    championship.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <SearchField
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Championship>
          columns={championshipColumns}
          data={filteredChampionships}
          onEdit={(row) => handleOpenModal(row as Championship)}
          onDelete={(row) =>
            dispatch(removeChampionship((row as Championship)._id || ""))
          }
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
                placeholder: "Nombre del campeonato",
                value: formData.name || "",
              },
              {
                name: "sport",
                type: "select",
                options: [
                  { label: "Fútbol", value: "Futbol" },
                  { label: "Otro", value: " " },
                ],
                value: formData.sport || "Futbol",
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
