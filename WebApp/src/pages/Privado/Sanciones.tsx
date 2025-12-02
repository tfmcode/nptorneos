import React, { useEffect, useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/index";
import { Sancion } from "../../types/sanciones";
import DataTable from "../../components/tables/DataTable";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchSanciones,
  removeSancion,
  saveSancionThunk,
} from "../../store/slices/sancionSlice";
import {
  PageHeader,
  StatusMessage,
  SearchField,
  Modal,
  PopupNotificacion,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { sancionColumns } from "../../components/tables";
import DateRangePicker from "../../components/common/DateRangePicker";
import { DynamicForm } from "../../components";
import { Equipo } from "../../types/equipos";
import JugadorAutocomplete from "../../components/forms/JugadorAutocomplete";
import { Jugador } from "../../types/jugadores";
import { getJugadorById } from "../../api/jugadoresService";
import { fetchTorneos } from "../../store/slices/torneoSlice";
import { getEquiposByJugador } from "../../api/equiposService";

const Sanciones: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { sanciones, loading, error, page, limit, total, totalPages } =
    useSelector((state: RootState) => state.sanciones);
  const { torneos } = useSelector((state: RootState) => state.torneos);

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [jugadorSeleccionado, setJugadorSeleccionado] =
    useState<Jugador | null>(null);
  const jugadorCargadoRef = useRef<number | null>(null);

  const [popup, setPopup] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    message: "",
  });

  const {
    formData,
    setFormData,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
    isModalOpen,
  } = useCrudForm<Sancion>({
    id: undefined,
    fecha: new Date().toISOString().split("T")[0],
    idjugador: undefined,
    idequipo: undefined,
    idtorneo: undefined,
    titulo: "",
    descripcion: "",
    codestado: 1,
    fechafin: undefined,
    fhcarga: undefined,
    fhbaja: undefined,
    idusuario: user?.idusuario ?? 0,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2025-12-31");

  const showPopup = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setPopup({ open: true, type, message });
    setTimeout(() => setPopup({ ...popup, open: false }), 4000);
  };

  useEffect(() => {
    dispatch(
      fetchSanciones({
        page,
        limit,
        searchTerm,
        startDate: startDate || "1900-01-01",
        endDate: endDate || "2099-12-31",
      })
    );
  }, [dispatch, page, limit, searchTerm, startDate, endDate]);

  useEffect(() => {
    dispatch(fetchTorneos({ page: 1, limit: 100, searchTerm: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (!isModalOpen) {
      setJugadorSeleccionado(null);
      setEquipos([]);
      jugadorCargadoRef.current = null;
      return;
    }

    if (!formData.idjugador) {
      setJugadorSeleccionado(null);
      setEquipos([]);
      jugadorCargadoRef.current = null;
      return;
    }

    if (jugadorCargadoRef.current === formData.idjugador) {
      return;
    }

    const cargarDatosJugador = async () => {
      jugadorCargadoRef.current = formData.idjugador!;

      try {
        const jugador = await getJugadorById(formData.idjugador!);
        if (jugador) {
          setJugadorSeleccionado(jugador);
        }

        const equiposData = await getEquiposByJugador(formData.idjugador!);
        setEquipos(equiposData);

        if (equiposData.length > 0 && !formData.id) {
          setFormData((prev) => ({
            ...prev,
            idequipo: equiposData[0].id!,
            titulo: `SANCIÓN JUGADOR: ${jugador?.nombres} ${jugador?.apellido} - EQUIPO: ${equiposData[0].nombre}`,
          }));
        }
      } catch (error) {
        console.error("Error al cargar datos del jugador:", error);
        jugadorCargadoRef.current = null;
      }
    };

    cargarDatosJugador();
  }, [formData.idjugador, isModalOpen, formData.id]);

  const handleManualCloseModal = () => {
    handleCloseModal();
    setJugadorSeleccionado(null);
    setEquipos([]);
    jugadorCargadoRef.current = null;
  };

  const handleSearch = () => {
    dispatch(
      fetchSanciones({
        page: 1,
        limit,
        searchTerm: pendingSearchTerm,
        startDate: startDate || "1900-01-01",
        endDate: endDate || "2099-12-31",
      })
    );
    setSearchTerm(pendingSearchTerm);
  };

  const handleDelete = async (sancion: Sancion) => {
    await dispatch(removeSancion(sancion.id!)).unwrap();
    dispatch(
      fetchSanciones({
        page,
        limit,
        searchTerm,
        startDate: startDate || "1900-01-01",
        endDate: endDate || "2099-12-31",
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errores: string[] = [];

    if (!formData.fecha)
      errores.push("• Ingresar una fecha de inicio de sanción");
    if (!formData.fechafin)
      errores.push("• Ingresar una fecha de fin de sanción");
    if (!formData.titulo?.trim()) errores.push("• Ingresar un título");
    if (!formData.idjugador) errores.push("• Ingresar el nombre del jugador");
    if (!formData.idequipo) errores.push("• Seleccionar un equipo");
    if (!formData.idtorneo) errores.push("• Seleccionar un torneo");

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const { id, ...sancionData } = formData;
      await dispatch(saveSancionThunk(id ? formData : sancionData)).unwrap();
      handleManualCloseModal();
      dispatch(fetchSanciones({ page, limit, searchTerm, startDate, endDate }));
      showPopup("success", "Sanción guardada correctamente");
    } catch (err) {
      console.error("Error al guardar sanción:", err);
      showPopup("error", "Error al guardar la sanción");
    }
  };

  const filteredSanciones = Array.isArray(sanciones)
    ? sanciones.filter(
        (sancion) =>
          sancion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sancion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const torneosActivos = torneos.filter((t) => t.codestado === 1);

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <PageHeader
          title="Sanciones"
          actions={[
            {
              label: "Agregar Sanción",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          setStartDate={setStartDate}
          setEndDate={setEndDate}
        />

        <SearchField
          placeholder="Buscar por título o descripción"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />
        <StatusMessage loading={loading} error={error} />

        <DataTable<Sancion>
          columns={sancionColumns}
          data={Array.isArray(filteredSanciones) ? filteredSanciones : []}
          onEdit={(row) => handleOpenModal(row as Sancion)}
          onDelete={(row) => handleDelete(row as Sancion)}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(
                fetchSanciones({
                  page: page - 1,
                  limit,
                  searchTerm,
                  startDate: startDate || "1900-01-01",
                  endDate: endDate || "2099-12-31",
                })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {totalPages || Math.ceil(total / limit)}
          </span>
          <button
            disabled={page >= (totalPages || Math.ceil(total / limit))}
            onClick={() =>
              dispatch(
                fetchSanciones({
                  page: page + 1,
                  limit,
                  searchTerm,
                  startDate: startDate || "1900-01-01",
                  endDate: endDate || "2099-12-31",
                })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleManualCloseModal}
          title={formData.id ? "Editar Sanción" : "Crear Sanción"}
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
                Jugador *
              </label>
              <JugadorAutocomplete
                value={formData.idjugador ?? 0}
                onChange={(jugador) => {
                  if (jugador && jugador.id) {
                    setFormData({
                      ...formData,
                      idjugador: jugador.id,
                    });
                    setJugadorSeleccionado(jugador);
                  }
                }}
              />
            </div>
          )}
          <DynamicForm
            fields={[
              {
                name: "idequipo",
                type: "select",
                placeholder: "Equipo *",
                label: "Equipo *",
                options: [
                  { label: "Seleccionar equipo", value: 0 },
                  ...equipos.map((equipo) => ({
                    label: equipo.nombre,
                    value: equipo.id ?? 0,
                  })),
                ],
                value: formData.idequipo ?? 0,
              },
              {
                name: "idtorneo",
                type: "select",
                placeholder: "Torneo *",
                label: "Torneo *",
                options: [
                  { label: "Seleccionar torneo", value: 0 },
                  ...torneosActivos.map((torneo) => ({
                    label: torneo.nombre,
                    value: torneo.id ?? 0,
                  })),
                ],
                value: formData.idtorneo ?? 0,
              },
              {
                name: "fecha",
                type: "date",
                placeholder: "Fecha inicio *",
                label: "Fecha inicio *",
                value: formData.fecha ?? "",
              },
              {
                name: "fechafin",
                type: "date",
                placeholder: "Fecha fin *",
                label: "Fecha fin *",
                value: formData.fechafin ?? "",
              },
              {
                name: "titulo",
                type: "text",
                placeholder: "Título *",
                label: "Título *",
                value: formData.titulo ?? "",
                colSpan: 2,
              },
              {
                name: "descripcion",
                type: "richtext",
                placeholder: "Descripción",
                label: "Descripción",
                value: formData.descripcion ?? "",
                onChange: (e) =>
                  setFormData({
                    ...formData,
                    descripcion: e.target.value as string,
                  }),
                colSpan: 2,
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

export default Sanciones;
