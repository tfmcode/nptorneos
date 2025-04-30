import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Jugador } from "../../types/jugadores";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchJugadores,
  saveJugadorThunk,
  removeJugador,
} from "../../store/slices/jugadoresSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { jugadorColumns } from "../../components/tables/columns/jugadorColumns";

const Jugadores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jugadores, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.jugadores
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Jugador>({
    nombres: "",
    apellido: "",
    docnro: "",
    fhnacimiento: "",
    telefono: "",
    email: "",
    categoria: "",
    posicion: "",
    piernahabil: "",
    altura: "",
    peso: "",
    codestado: 1,
    id: undefined,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchJugadores({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...jugadorData } = formData;
      await dispatch(saveJugadorThunk(id ? formData : jugadorData)).unwrap();
      handleCloseModal();
      dispatch(fetchJugadores({ page, limit, searchTerm }));
    } catch (err) {
      console.error("Error al guardar jugador:", err);
    }
  };

  const handleDelete = async (jugador: Jugador) => {
    await dispatch(removeJugador(jugador.id!)).unwrap();
    dispatch(fetchJugadores({ page, limit, searchTerm }));
  };

  const handleSearch = () => {
    dispatch(fetchJugadores({ page: 1, limit, searchTerm: pendingSearchTerm }));
    setSearchTerm(pendingSearchTerm);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
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

        <DataTable<Jugador>
          columns={jugadorColumns}
          data={jugadores}
          onEdit={(row) => handleOpenModal(row as Jugador)}
          onDelete={handleDelete}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(fetchJugadores({ page: page - 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={jugadores.length < limit}
            onClick={() =>
              dispatch(fetchJugadores({ page: page + 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Jugador" : "Crear Jugador"}
        >
          <DynamicForm
            fields={[
              {
                name: "nombres",
                type: "text",
                placeholder: "Nombre",
                value: formData.nombres ?? "",
              },
              {
                name: "apellido",
                type: "text",
                placeholder: "Apellido",
                value: formData.apellido ?? "",
              },
              {
                name: "docnro",
                type: "text",
                placeholder: "Documento",
                value: formData.docnro ?? "",
              },
              {
                name: "fhnacimiento",
                type: "date",
                placeholder: "Fecha de nacimiento",
                value: formData.fhnacimiento ?? "",
              },
              {
                name: "telefono",
                type: "text",
                placeholder: "Teléfono",
                value: formData.telefono ?? "",
              },
              {
                name: "email",
                type: "email",
                placeholder: "Email",
                value: formData.email ?? "",
              },
              {
                name: "categoria",
                type: "text",
                placeholder: "Categoría",
                value: formData.categoria ?? "",
              },
              {
                name: "posicion",
                type: "text",
                placeholder: "Posición",
                value: formData.posicion ?? "",
              },
              {
                name: "piernahabil",
                type: "text",
                placeholder: "Pierna Hábil",
                value: formData.piernahabil ?? "",
              },
              {
                name: "altura",
                type: "text",
                placeholder: "Altura",
                value: formData.altura ?? "",
              },
              {
                name: "peso",
                type: "text",
                placeholder: "Peso",
                value: formData.peso ?? "",
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
        </Modal>
      </div>
    </div>
  );
};

export default Jugadores;
