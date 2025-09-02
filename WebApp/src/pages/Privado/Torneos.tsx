import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/index";
import { Torneo } from "../../types/torneos";
import DataTable from "../../components/tables/DataTable";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { fetchTorneos, removeTorneo } from "../../store/slices/torneoSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { torneoColumns } from "../../components/tables";
import { AccordionItem } from "../../components/common/Accordion";
import { Accordion } from "../../components/common/Accordion";
import DatosBasicos from "../../components/torneos/DatosBasicos";
import Zonas from "../../components/torneos/Zonas";
import ZonasEquipos from "../../components/torneos/ZonasEquipos";
import Partidos from "../../components/torneos/Partidos";
import Imagenes from "../../components/torneos/Imagenes";

const Torneos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { torneos, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.torneos
  );

  const {
    formData,
    setFormData, // ✅ Necesitamos esta función para actualizar el formData
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Torneo>({
    id: undefined,
    nombre: "",
    abrev: "",
    anio: new Date().getFullYear(),
    idcampeonato: 0,
    idsede: 0,
    codestado: 1,
    codtipoestado: 1,
    cposicion: 1,
    cpromedio: 1,
    codmodelo: 1,
    codtipo: 1,
    cantmin: 0,
    torneodefault: 0,
    fotojugador: 0,
    idpadre: 0,
    idgaleria: 0,
    valor_insc: 0,
    valor_fecha: 0,
    individual: 0,
    valor_arbitro: 0,
    valor_cancha: 0,
    valor_medico: 0,
    excluir_res: 0,
    fhcarga: undefined,
    fhbaja: undefined,
    idusuario: user?.idusuario ?? 0,
    sas: 0,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchTorneos({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSearch = () => {
    dispatch(fetchTorneos({ page: 1, limit, searchTerm: pendingSearchTerm }));
    setSearchTerm(pendingSearchTerm);
  };

  const handleDelete = async (torneo: Torneo) => {
    await dispatch(removeTorneo(torneo.id!)).unwrap();
    dispatch(fetchTorneos({ page, limit, searchTerm }));
  };

  // ✅ Función para manejar cuando se crea un nuevo torneo
  const handleTorneoCreated = (torneoCreado: Torneo) => {
    console.log("🔥 Callback ejecutado! Torneo creado:", torneoCreado); // Debug

    // Actualizar el formData COMPLETO con todos los datos del torneo creado
    setFormData(torneoCreado);

    // Actualizar la lista de torneos
    dispatch(fetchTorneos({ page, limit, searchTerm }));
  };

  const filteredTorneos = Array.isArray(torneos)
    ? torneos.filter((torneo) =>
        torneo.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Torneos"
          actions={[
            {
              label: "Agregar Torneo",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por nombre"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Torneo>
          columns={torneoColumns}
          data={Array.isArray(filteredTorneos) ? filteredTorneos : []}
          onEdit={(row) => handleOpenModal(row as Torneo)}
          onDelete={(row) => handleDelete(row as Torneo)}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(fetchTorneos({ page: page - 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={torneos.length < limit}
            onClick={() =>
              dispatch(fetchTorneos({ page: page + 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Torneo" : "Crear Torneo"}
        >
          <Accordion>
            <AccordionItem title="Datos Básicos" defaultOpen={true}>
              <DatosBasicos
                formData={formData}
                onChange={handleInputChange}
                onTorneoCreated={handleTorneoCreated} // ✅ Pasar la función callback
              />
            </AccordionItem>
            <AccordionItem title="Zonas" defaultOpen={false}>
              <Zonas idtorneo={formData.id ?? 0} />
            </AccordionItem>
            <AccordionItem title="Equipos" defaultOpen={false}>
              <ZonasEquipos
                idtorneo={formData.id ?? 0}
                valor_fecha={formData.valor_fecha ?? 0}
              />
            </AccordionItem>
            <AccordionItem title="Fixture" defaultOpen={false}>
              <Partidos idtorneo={formData.id ?? 0} />
            </AccordionItem>
            <AccordionItem title="Imágenes" defaultOpen={false}>
              <Imagenes idtorneo={formData.id ?? 0} />
            </AccordionItem>
          </Accordion>
        </Modal>
      </div>
    </div>
  );
};

export default Torneos;
