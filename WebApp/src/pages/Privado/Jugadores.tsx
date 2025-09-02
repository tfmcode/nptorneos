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
  clearError, // ✅ Importar nueva acción
} from "../../store/slices/jugadoresSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
  PopupNotificacion,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { jugadorColumns } from "../../components/tables/columns/jugadorColumns";

const Jugadores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jugadores, loading, error, errorType, page, limit, total } =
    useSelector(
      // ✅ Agregar errorType
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
    dispatch(fetchJugadores({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errores: string[] = [];

    if (!formData.apellido) errores.push("• Ingresar el apellido");
    if (!formData.nombres) errores.push("• Ingresar el nombre");
    if (!formData.docnro) errores.push("• Ingresar el documento");
    if (!formData.fhnacimiento)
      errores.push("• Ingresar la fecha de nacimiento");

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const { id, ...jugadorData } = formData;
      await dispatch(saveJugadorThunk(id ? formData : jugadorData)).unwrap();
      dispatch(fetchJugadores({ page, limit, searchTerm }));
      handleCloseModal();
      showPopup("success", "Jugador guardado correctamente");
    } catch (err: unknown) {
      console.error("Error al guardar jugador:", err);

      // ✅ Manejar específicamente el error de documento duplicado
      if (
        typeof err === "object" &&
        err !== null &&
        "type" in err &&
        (err as { type?: string }).type === "DUPLICATE_DOCUMENT"
      ) {
        showPopup(
          "error",
          "⚠️ El número de documento ya existe en el sistema. Por favor, ingrese un documento diferente."
        );
      } else {
        const message =
          typeof err === "object" &&
          err !== null &&
          "message" in err &&
          typeof (err as { message?: unknown }).message === "string"
            ? (err as { message: string }).message
            : "Error al guardar el jugador";
        showPopup("error", message);
      }
    }
  };

  const handleDelete = async (jugador: Jugador) => {
    try {
      await dispatch(removeJugador(jugador.id!)).unwrap();
      dispatch(fetchJugadores({ page, limit, searchTerm }));
      showPopup("success", "Jugador eliminado correctamente");
    } catch (err: unknown) {
      const message =
        typeof err === "object" &&
        err !== null &&
        "message" in err &&
        typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Error al eliminar el jugador";
      showPopup("error", message);
    }
  };

  const handleSearch = () => {
    dispatch(fetchJugadores({ page: 1, limit, searchTerm: pendingSearchTerm }));
    setSearchTerm(pendingSearchTerm);
  };

  // ✅ Función para cerrar modal y limpiar errores
  const handleCloseModalAndClearError = () => {
    handleCloseModal();
    dispatch(clearError());
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
          onClose={handleCloseModalAndClearError} // ✅ Usar nueva función
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

          {/* ✅ Mostrar error específico de documento duplicado en el modal */}
          {errorType === "DUPLICATE_DOCUMENT" && (
            <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>⚠️ Documento duplicado:</strong> El número de documento
              ingresado ya existe en el sistema.
            </div>
          )}

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

export default Jugadores;
