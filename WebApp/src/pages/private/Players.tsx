import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Player } from "../../types/player";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchPlayers,
  savePlayerThunk,
  removePlayer,
} from "../../store/slices/playerSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { playerColumns } from "../../components";

const Players: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { players, loading, error, page, limit, totalPlayers } = useSelector(
    (state: RootState) => state.players
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Player>({
    firstName: "",
    lastName: "",
    document: "",
    birthday: "",
    enabled: true,
    _id: "",
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchPlayers({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { _id, ...playerData } = formData;
      await dispatch(savePlayerThunk(_id ? formData : playerData)).unwrap();
      handleCloseModal();
      dispatch(fetchPlayers({ page, limit, searchTerm }));
    } catch (err) {
      console.error("Error al guardar jugador:", err);
    }
  };

  const handleDelete = async (player: Player) => {
    await dispatch(removePlayer(player._id)).unwrap();
    dispatch(fetchPlayers({ page, limit, searchTerm }));
  };

  const handleSearch = () => {
    dispatch(fetchPlayers({ page: 1, limit, searchTerm: pendingSearchTerm }));
    setSearchTerm(pendingSearchTerm);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <PageHeader
          title="Jugadores"
          actions={[
            {
              label: "Agregar Jugador",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por nombre o documento"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Player>
          columns={playerColumns}
          data={players}
          onEdit={(row) => handleOpenModal(row as Player)}
          onDelete={handleDelete}
        />

        {/* 🔥 Agregando paginación */}
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(fetchPlayers({ page: page - 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(totalPlayers / limit)}
          </span>
          <button
            disabled={players.length < limit}
            onClick={() =>
              dispatch(fetchPlayers({ page: page + 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData._id ? "Editar Jugador" : "Crear Jugador"}
        >
          <DynamicForm
            fields={[
              {
                name: "firstName",
                type: "text",
                placeholder: "Nombre",
                value: formData.firstName ?? "",
              },
              {
                name: "lastName",
                type: "text",
                placeholder: "Apellido",
                value: formData.lastName ?? "",
              },
              {
                name: "document",
                type: "text",
                placeholder: "Documento",
                value: formData.document ?? "",
              },
              {
                name: "birthday",
                type: "date",
                placeholder: "Fecha de nacimiento",
                value: formData.birthday ?? "",
              },
              {
                name: "enabled",
                type: "checkbox",
                label: "Habilitado",
                value: formData.enabled ?? false,
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

export default Players;
