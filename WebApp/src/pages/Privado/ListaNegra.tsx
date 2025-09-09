import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { ListaNegra } from "../../types/listaNegra";
import { Jugador } from "../../types/jugadores";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import JugadorAutocomplete from "../../components/forms/JugadorAutocomplete";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchListaNegra,
  saveRegistroListaNegra,
  removeRegistroListaNegra,
} from "../../store/slices/listaNegraSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
  PopupNotificacion,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { listaNegraColumns } from "../../components/tables/columns/listaNegraColumns";
import { getJugadorById } from "../../api/jugadoresService";

const ListaNegraPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { registros, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.listaNegra
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<ListaNegra>({
    idjugador: 0,
    fecha: "",
    observ: "",
    codestado: 0,
    usrultmod: 1,
    id: undefined,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [jugadorSeleccionado, setJugadorSeleccionado] =
    useState<Jugador | null>(null);

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
    dispatch(fetchListaNegra({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleDelete = async (registro: ListaNegra) => {
    await dispatch(removeRegistroListaNegra(registro.id!)).unwrap();
    dispatch(fetchListaNegra({ page, limit, searchTerm }));
  };

  const handleSearch = () => {
    dispatch(
      fetchListaNegra({ page: 1, limit, searchTerm: pendingSearchTerm })
    );
    setSearchTerm(pendingSearchTerm);
  };

  const setFieldManualmente = (
    campo: string,
    valor: string | number | boolean
  ) => {
    const syntheticEvent = {
      target: { name: campo, value: valor },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(syntheticEvent);
  };

  useEffect(() => {
    const cargarJugador = async () => {
      if (formData.idjugador) {
        const jugador = await getJugadorById(formData.idjugador);
        if (jugador) setJugadorSeleccionado(jugador);
      }
    };
    if (isModalOpen) {
      cargarJugador();
    } else {
      setJugadorSeleccionado(null);
    }
  }, [formData.idjugador, isModalOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errores: string[] = [];
    if (!formData.idjugador) errores.push("• Ingresar el nombre del jugador");
    if (!formData.fecha) errores.push("• Ingresar una fecha");

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const payload = {
        ...formData,
        codestado: Number(formData.codestado),
      };
      const { id, ...rest } = payload;
      await dispatch(saveRegistroListaNegra(id ? payload : rest)).unwrap();
      handleCloseModal();
      dispatch(fetchListaNegra({ page, limit, searchTerm }));
      showPopup("success", "Registro guardado correctamente");
    } catch (err) {
      console.error("Error al guardar registro:", err);
      showPopup("error", "Error al guardar el registro");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Lista Negra"
          actions={[
            {
              label: "Agregar Sanción",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por nombre o apellido"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<ListaNegra>
          columns={listaNegraColumns}
          data={registros}
          onEdit={(row) => handleOpenModal(row as ListaNegra)}
          onDelete={handleDelete}
        />
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(fetchListaNegra({ page: page - 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={registros.length < limit}
            onClick={() =>
              dispatch(fetchListaNegra({ page: page + 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Sanción" : "Registrar Sanción"}
        >
          {formData.id ? (
            <>
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Jugador
                </label>
                <input
                  type="text"
                  value={
                    jugadorSeleccionado
                      ? `${jugadorSeleccionado.nombres} ${jugadorSeleccionado.apellido}`
                      : ""
                  }
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700"
                />
              </div>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Documento
                </label>
                <input
                  type="text"
                  value={jugadorSeleccionado?.docnro ?? ""}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-sm text-gray-700"
                />
              </div>
            </>
          ) : (
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jugador
              </label>
              <JugadorAutocomplete
                value={formData.idjugador}
                onChange={(jugador) => {
                  if (jugador && jugador.id) {
                    setFieldManualmente("idjugador", jugador.id);
                    setJugadorSeleccionado(jugador as Jugador);
                  }
                }}
              />
            </div>
          )}

          <DynamicForm
            fields={[
              {
                name: "fecha",
                type: "date",
                placeholder: "Fecha de sanción",
                value: formData.fecha ?? "",
              },
              {
                name: "observ",
                type: "textarea",
                placeholder: "Motivo de la sanción",
                value: formData.observ ?? "",
              },
              {
                name: "codestado",
                type: "select",
                options: [
                  { label: "Inhabilitado", value: "0" },
                  { label: "Habilitado", value: "1" },
                ],
                value: (formData.codestado ?? 0).toString(),
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

export default ListaNegraPage;
