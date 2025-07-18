import React, { useEffect, useState, useCallback } from "react";
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
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { sancionColumns } from "../../components/tables";
import DateRangePicker from "../../components/common/DateRangePicker";
import { DynamicForm } from "../../components";
import { Equipo } from "../../types/equipos";
import { Torneo } from "../../types/torneos";
import { getTorneosByEquipoID } from "../../api/torneosService";
import { getEquiposByJugador } from "../../api/equiposService";
import JugadorAutocomplete from "../../components/forms/JugadorAutocomplete";
import { Jugador } from "../../types/jugadores";
import { getJugadorById } from "../../api/jugadoresService";

const Sanciones: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { sanciones, loading, error, page, limit, total, totalPages } =
    useSelector((state: RootState) => state.sanciones);

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [torneos, setTorneos] = useState<Torneo[]>([]);

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
  const [jugadorSeleccionado, setJugadorSeleccionado] =
    useState<Jugador | null>(null);

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

  const setFieldManualmente = useCallback(
    (campo: string, valor: string | number | boolean) => {
      const syntheticEvent = {
        target: { name: campo, value: valor },
      } as React.ChangeEvent<HTMLInputElement>;
      handleInputChange(syntheticEvent);
    },
    [handleInputChange]
  );

  const setTitulo = useCallback(
    (jugador?: Jugador, equipo?: Equipo) => {
      setFieldManualmente(
        "titulo",
        `SANCIÓN JUGADOR: ${jugador?.nombres} ${jugador?.apellido} ${
          equipo ? `- EQUIPO: ${equipo?.nombre}` : ""
        }`
      );
    },
    [setFieldManualmente]
  );

  useEffect(() => {
    const cargarJugador = async () => {
      if (formData.idjugador) {
        const jugador = await getJugadorById(formData.idjugador);
        if (jugador) {
          setJugadorSeleccionado(jugador);
          if (!formData.id) {
            setTitulo(jugador, undefined);
          }
        }

        try {
          const equiposByJugador = await getEquiposByJugador(
            formData.idjugador
          );
          setEquipos(equiposByJugador);
          if (equiposByJugador.length > 0) {
            if (!formData.id) {
              setFieldManualmente("idequipo", equiposByJugador[0].id!);
            }

            const torneosByEquipo = await getTorneosByEquipoID(
              equiposByJugador[0].id!
            );
            if (torneosByEquipo.length > 0) {
              if (!formData.id) {
                setFieldManualmente("idtorneo", torneosByEquipo[0].id!);
              }
              setTorneos(torneosByEquipo);

              if (!formData.id) {
                setTitulo(jugador, equiposByJugador[0]);
              }
            } else {
              setTorneos([]);
            }
          } else {
            setEquipos([]);
          }
        } catch (error) {
          console.error("Error al obtener equipos y torneos:", error);
        }
      } else {
        setFieldManualmente("idequipo", 0);
        setFieldManualmente("idtorneo", 0);
        setFieldManualmente("titulo", "");
        setEquipos([]);
        setTorneos([]);
      }
    };
    if (isModalOpen) {
      cargarJugador();
    } else {
      setJugadorSeleccionado(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.id, formData.idjugador, isModalOpen]);

  useEffect(() => {
    if (formData.idequipo) {
      const cargarTorneos = async () => {
        const torneos = await getTorneosByEquipoID(formData.idequipo!);
        setTorneos(torneos);
      };
      cargarTorneos();
    }
  }, [formData.idequipo]);

  const handleManualCloseModal = () => {
    handleCloseModal();
    setJugadorSeleccionado(null);
    setEquipos([]);
    setTorneos([]);
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
    try {
      const { id, ...sancionData } = formData;
      await dispatch(saveSancionThunk(id ? formData : sancionData)).unwrap();
      handleManualCloseModal();
      dispatch(
        fetchSanciones({
          page,
          limit,
          searchTerm,
          startDate: startDate || "1900-01-01",
          endDate: endDate || "2099-12-31",
        })
      );
    } catch (err) {
      console.error("Error al guardar sanción:", err);
    }
  };

  const filteredSanciones = Array.isArray(sanciones)
    ? sanciones.filter(
        (sancion) =>
          sancion.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sancion.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
          {/* ---- JUGADOR ---- */}
          {formData.id ? (
            /* Modo EDICIÓN – nombre readonly */
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
            /* Modo ALTA – autocomplete */
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Jugador
              </label>
              <JugadorAutocomplete
                value={formData.idjugador ?? 0}
                onChange={(jugador) => {
                  setFieldManualmente("idjugador", jugador.id!);
                  setJugadorSeleccionado(jugador);
                }}
              />
            </div>
          )}
          <DynamicForm
            fields={[
              {
                name: "idequipo",
                type: "select",
                placeholder: "Equipo",
                options: equipos.map((equipo) => ({
                  label: equipo.nombre,
                  value: equipo.id ?? "",
                })),
                value: formData.idequipo ?? "",
              },
              {
                name: "idtorneo",
                type: "select",
                placeholder: "Torneo",
                options: torneos.map((torneo) => ({
                  label: torneo.nombre,
                  value: torneo.id ?? "",
                })),
                value: formData.idtorneo ?? "",
              },
              {
                name: "fecha",
                type: "date",
                placeholder: "Fecha inicio",
                value: formData.fecha ?? "",
              },
              {
                name: "fechafin",
                type: "date",
                placeholder: "Fecha fin",
                value: formData.fechafin ?? "",
              },
              {
                name: "titulo",
                type: "text",
                placeholder: "Título",
                value: formData.titulo ?? "",
                colSpan: 2,
              },
              {
                name: "descripcion",
                type: "richtext",
                placeholder: "Descripción",
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
        </Modal>
      </div>
    </div>
  );
};

export default Sanciones;
