// src/pages/Codificadores.tsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Codificador, CodificadorInput } from "../../types/codificador";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchCodificadores,
  saveCodificadorThunk,
  removeCodificador,
} from "../../store/slices/codificadorSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { codificadorColumns } from "../../components/tables/columns/codificadorColumns";

// Opciones para el select de idcodificador
const idCodificadorOptions = [
  { label: "Tipo Torneos", value: 3 },
  { label: "Gastos Varios", value: 4 },
  { label: "Ingresos Varios", value: 5 },
  { label: "Fechas Torneos", value: 6 },
  { label: "Turnos", value: 7 },
  { label: "Tipo Cancha", value: 8 },
  { label: "Tipo Inscrip.", value: 9 },
];

const Codificadores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { codificadores, loading, error } = useSelector(
    (state: RootState) => state.codificadores
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<CodificadorInput>({
    id: undefined,
    idcodificador: 8,
    descripcion: "",
    habilitado: "1",
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIdCodificador, setSelectedIdCodificador] = useState<number>(8);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchCodificadores());
  }, [dispatch]);

  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
  };

  const handleIdCodificadorChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedIdCodificador(Number(e.target.value));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (!formData.descripcion) {
        setFormError("La descripción es requerida");
        return;
      }
      if (!formData.idcodificador) {
        setFormError("Debe seleccionar un ID Codificador");
        return;
      }

      const isEditing = !!formData.id;
      const payload = { ...formData };

      if (!isEditing) {
        // Nuevo codificador: no enviar el campo id
        delete payload.id;
      }

      await dispatch(saveCodificadorThunk(payload)).unwrap();
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar codificador:", err);
      setFormError("Error al guardar el codificador");
    }
  };

  const handleDelete = async (codificador: Codificador) => {
    try {
      await dispatch(
        removeCodificador({
          id: codificador.id,
          idcodificador: codificador.idcodificador,
        })
      ).unwrap();
    } catch (err) {
      console.error("Error al eliminar codificador:", err);
    }
  };

  const filteredCodificadores = Array.isArray(codificadores)
    ? codificadores.filter((codificador) => {
        const matchesSearchTerm =
          codificador.descripcion
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ?? true;
        const matchesIdCodificador =
          codificador.idcodificador === selectedIdCodificador;
        return matchesSearchTerm && matchesIdCodificador;
      })
    : [];

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Codificadores"
          actions={[
            {
              label: "",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        {/* Filtros */}
        <div className="flex space-x-4 mb-4">
          <div className="flex-1">
            <select
              id="idcodificador-filter"
              value={selectedIdCodificador}
              onChange={handleIdCodificadorChange}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-md 
                focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                transition-colors duration-200 text-gray-700"
            >
              {idCodificadorOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <SearchField
              placeholder="Buscar por descripción"
              value={pendingSearchTerm}
              onChange={(e) => setPendingSearchTerm(e.target.value)}
              onSearch={handleSearch}
            />
          </div>
        </div>

        <StatusMessage loading={loading} error={error} />

        <DataTable<Codificador>
          columns={codificadorColumns}
          data={filteredCodificadores}
          onEdit={(row) => handleOpenModal(row as Codificador)}
          onDelete={(row) => handleDelete(row as Codificador)}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={
            formData.id && formData.idcodificador
              ? "Editar Codificador"
              : "Crear Codificador"
          }
        >
          {formError && (
            <div className="mb-4 text-red-500 text-sm">{formError}</div>
          )}
          <DynamicForm
            fields={[
              {
                name: "idcodificador",
                type: "select",
                options: idCodificadorOptions,
                value: formData.idcodificador,
              },
              {
                name: "descripcion",
                type: "text",
                placeholder: "Descripción",
                value: formData.descripcion ?? "",
              },
              {
                name: "habilitado",
                type: "select",
                options: [
                  { label: "Sí", value: "1" },
                  { label: "No", value: "0" },
                ],
                value: formData.habilitado ?? "1",
              },
            ]}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            submitLabel="Grabar"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Codificadores;
