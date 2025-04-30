import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Equipo } from "../../types/equipos";
import {
  fetchEquipos,
  saveEquipoThunk,
  removeEquipo,
} from "../../store/slices/equiposSlice";
import { fetchSedes } from "../../store/slices/sedeSlice";
import { useCrudForm } from "../../hooks/useCrudForm";
import { equipoColumns } from "../../components/tables/columns/equiposColumns";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { PlusCircleIcon } from "@heroicons/react/20/solid";

const Equipos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { equipos, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.equipos
  );
  const { sedes } = useSelector((state: RootState) => state.sedes);

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Equipo>({
    nombre: "",
    abrev: "",
    iniciales: "",
    coddeporte: 1,
    idsede: 0,
    id: undefined,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchEquipos({ page, limit, searchTerm }));
    dispatch(fetchSedes());
  }, [dispatch, page, limit, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...equipoData } = formData;
      await dispatch(saveEquipoThunk(id ? formData : equipoData)).unwrap();
      handleCloseModal();
      dispatch(fetchEquipos({ page, limit, searchTerm }));
    } catch (err) {
      console.error("Error al guardar equipo:", err);
    }
  };

  const handleDelete = async (equipo: Equipo) => {
    await dispatch(removeEquipo(equipo.id!)).unwrap();
    dispatch(fetchEquipos({ page, limit, searchTerm }));
  };

  const handleSearch = () => {
    dispatch(fetchEquipos({ page: 1, limit, searchTerm: pendingSearchTerm }));
    setSearchTerm(pendingSearchTerm);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Equipos"
          actions={[
            {
              label: "Agregar Equipo",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por nombre o abreviatura"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Equipo>
          columns={equipoColumns}
          data={equipos}
          onEdit={(row) => handleOpenModal(row)}
          onDelete={handleDelete}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(fetchEquipos({ page: page - 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={equipos.length < limit}
            onClick={() =>
              dispatch(fetchEquipos({ page: page + 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Equipo" : "Crear Equipo"}
        >
          <DynamicForm
            fields={[
              {
                name: "nombre",
                type: "text",
                placeholder: "Nombre del Equipo",
                value: formData.nombre ?? "",
              },
              {
                name: "abrev",
                type: "text",
                placeholder: "Abreviatura",
                value: formData.abrev ?? "",
              },
              {
                name: "iniciales",
                type: "text",
                placeholder: "Iniciales",
                value: formData.iniciales ?? "",
              },
              {
                name: "coddeporte",
                type: "number",
                placeholder: "Código de Deporte",
                value: formData.coddeporte ?? 1,
              },
              {
                name: "idsede",
                type: "select",
                placeholder: "Seleccione una sede",
                value: formData.idsede ?? "",
                options: [
                  { label: "Seleccionar sede...", value: "" },
                  ...sedes.map((sede) => ({
                    label: sede.nombre,
                    value: sede.id!,
                  })),
                ],
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

export default Equipos;
