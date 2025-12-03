import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Equipo } from "../../types/equipos";
import { fetchEquipos, removeEquipo } from "../../store/slices/equiposSlice";
import DataTable from "../../components/tables/DataTable";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { equipoColumns } from "../../components/tables";
import { Accordion, AccordionItem } from "../../components/common/Accordion";
import DatosBasicos from "../../components/equipos/DatosBasicos";
import Jugadores from "../../components/equipos/Jugadores";
import TorneosEquipo from "../../components/equipos/TorneosEquipo";
import { PlusCircleIcon } from "@heroicons/react/20/solid";

const Equipos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth);
  const { equipos, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.equipos
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Equipo>({
    id: undefined,
    nombre: "",
    abrev: "",
    contacto: "",
    telefonocto: "",
    celularcto: "",
    emailcto: "",
    contrasenia: "",
    iniciales: "",
    codestado: 1,
    idsede: 0,
    foto: "",
    observ: "",
    saldodeposito: 0,
    idusuario: user?.idusuario ?? 0,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchEquipos({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSearch = () => {
    dispatch(fetchEquipos({ page: 1, limit, searchTerm: pendingSearchTerm }));
    setSearchTerm(pendingSearchTerm);
  };

  const handleDelete = async (equipo: Equipo) => {
    await dispatch(removeEquipo(equipo.id!)).unwrap();
    dispatch(fetchEquipos({ page, limit, searchTerm }));
  };

  const filteredEquipos = Array.isArray(equipos)
    ? equipos.filter((eq) =>
        eq.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
          placeholder="Buscar por nombre"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Equipo>
          columns={equipoColumns}
          data={filteredEquipos}
          onEdit={(row) => handleOpenModal(row as Equipo)}
          onDelete={(row) => handleDelete(row as Equipo)}
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
          <Accordion>
            <AccordionItem title="Datos Básicos" defaultOpen={true}>
              <DatosBasicos formData={formData} onChange={handleInputChange} />
            </AccordionItem>
            <AccordionItem title="Jugadores" defaultOpen={false}>
              <Jugadores idequipo={formData.id ?? 0} />
            </AccordionItem>
            {formData.id && (
              <AccordionItem title="Torneos" defaultOpen={false}>
                <TorneosEquipo idequipo={formData.id} />
              </AccordionItem>
            )}
          </Accordion>
        </Modal>
      </div>
    </div>
  );
};

export default Equipos;
