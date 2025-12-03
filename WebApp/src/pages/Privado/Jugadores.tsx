import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Jugador } from "../../types/jugadores";
import DataTable from "../../components/tables/DataTable";
import ImageUploaderInline from "../../components/common/ImageUploaderInline";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchJugadores,
  saveJugadorThunk,
  removeJugador,
  clearError,
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
import { Accordion, AccordionItem } from "../../components/common/Accordion";
import EquiposJugador from "../../components/jugadores/EquiposJugador";

const Jugadores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { jugadores, loading, error, errorType, page, limit, total } =
    useSelector((state: RootState) => state.jugadores);

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
    foto: undefined,
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

  const handleCloseModalAndClearError = () => {
    handleCloseModal();
    dispatch(clearError());
  };

  const handleImageUploadSuccess = (imageUrl: string) => {
    console.log("✅ Imagen subida correctamente:", imageUrl);
    showPopup("success", "Foto actualizada correctamente");
    if (formData.id) {
      dispatch(fetchJugadores({ page, limit, searchTerm }));
    }
  };

  const handleImageUploadError = (error: string) => {
    showPopup("error", `Error al subir imagen: ${error}`);
  };

  const handleImageDeleteSuccess = () => {
    showPopup("success", "Imagen eliminada correctamente");
    if (formData.id) {
      dispatch(fetchJugadores({ page, limit, searchTerm }));
    }
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
          placeholder="Buscar por nombre, documento o teléfono"
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
          onClose={handleCloseModalAndClearError}
          title={formData.id ? "Editar Jugador" : "Crear Jugador"}
          size="large"
        >
          <Accordion>
            <AccordionItem title="Datos Básicos" defaultOpen={true}>
              {!formData.id && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    ℹ️ La foto del jugador se puede agregar después de crear el
                    registro
                  </p>
                </div>
              )}

              {formData.id && (
                <div className="mb-6">
                  <div className="flex flex-col sm:flex-row gap-6 mb-6">
                    <div className="flex-shrink-0">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto del Jugador
                      </label>
                      <ImageUploaderInline
                        entityId={formData.id}
                        entityType="jugador"
                        currentImageUrl={formData.foto}
                        size="large"
                        aspectRatio={1}
                        onUploadSuccess={handleImageUploadSuccess}
                        onUploadError={handleImageUploadError}
                        onDeleteSuccess={handleImageDeleteSuccess}
                      />
                    </div>

                    <div className="flex-1 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Nombre *
                        </label>
                        <input
                          type="text"
                          name="nombres"
                          value={formData.nombres ?? ""}
                          onChange={handleInputChange}
                          placeholder="Nombre del jugador"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Apellido *
                        </label>
                        <input
                          type="text"
                          name="apellido"
                          value={formData.apellido ?? ""}
                          onChange={handleInputChange}
                          placeholder="Apellido del jugador"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {!formData.id && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      name="nombres"
                      value={formData.nombres ?? ""}
                      onChange={handleInputChange}
                      placeholder="Nombre del jugador"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      name="apellido"
                      value={formData.apellido ?? ""}
                      onChange={handleInputChange}
                      placeholder="Apellido del jugador"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento *
                  </label>
                  <input
                    type="text"
                    name="docnro"
                    value={formData.docnro ?? ""}
                    onChange={handleInputChange}
                    placeholder="Número de documento"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento *
                  </label>
                  <input
                    type="date"
                    name="fhnacimiento"
                    value={formData.fhnacimiento ?? ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="text"
                    name="telefono"
                    value={formData.telefono ?? ""}
                    onChange={handleInputChange}
                    placeholder="Teléfono"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email ?? ""}
                    onChange={handleInputChange}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <input
                    type="text"
                    name="categoria"
                    value={formData.categoria ?? ""}
                    onChange={handleInputChange}
                    placeholder="Ej: Sub-20"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posición
                  </label>
                  <input
                    type="text"
                    name="posicion"
                    value={formData.posicion ?? ""}
                    onChange={handleInputChange}
                    placeholder="Ej: Delantero"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pierna Hábil
                  </label>
                  <select
                    name="piernahabil"
                    value={formData.piernahabil ?? ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Seleccionar...</option>
                    <option value="Derecha">Derecha</option>
                    <option value="Izquierda">Izquierda</option>
                    <option value="Ambas">Ambas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Altura (cm)
                  </label>
                  <input
                    type="text"
                    name="altura"
                    value={formData.altura ?? ""}
                    onChange={handleInputChange}
                    placeholder="Ej: 175"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (kg)
                  </label>
                  <input
                    type="text"
                    name="peso"
                    value={formData.peso ?? ""}
                    onChange={handleInputChange}
                    placeholder="Ej: 70"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    name="codestado"
                    value={formData.codestado ?? 1}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
              </div>

              {errorType === "DUPLICATE_DOCUMENT" && (
                <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                  <strong>⚠️ Documento duplicado:</strong> El número de
                  documento ingresado ya existe en el sistema.
                </div>
              )}

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModalAndClearError}
                  className="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  Guardar
                </button>
              </div>
            </AccordionItem>

            {formData.id && (
              <AccordionItem title="Equipos" defaultOpen={false}>
                <EquiposJugador idjugador={formData.id} />
              </AccordionItem>
            )}
          </Accordion>

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
