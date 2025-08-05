import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store/index";
import { Inscripcion } from "../../types/inscripciones";
import DataTable from "../../components/tables/DataTable";
import {
  fetchInscripciones,
  removeInscripcion,
} from "../../store/slices/inscripcionSlice";
import {
  PageHeader,
  StatusMessage,
  SearchField,
  Modal,
  Accordion,
  AccordionItem,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { inscripcionColumns } from "../../components/tables";
import DatosBasicos from "../../components/inscripciones/DatosBasicos";
import ProcesarEquipo from "../../components/inscripciones/ProcesarEquipo";

const Inscripciones: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { inscripciones, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.inscripciones
  );

  const {
    formData,
    setFormData,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
    isModalOpen,
  } = useCrudForm<Inscripcion>({
    id: undefined,
    email: "",
    equipo: "",
    idtorneo: undefined,
    codestado: 1,
    idzona: 0,
    idequipoasoc: 0,
    foto: "",
    fhcarga: undefined,
    fhbaja: undefined,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchInscripciones({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSearch = () => {
    dispatch(
      fetchInscripciones({ page: 1, limit, searchTerm: pendingSearchTerm })
    );
    setSearchTerm(pendingSearchTerm);
  };

  const handleDelete = async (inscripcion: Inscripcion) => {
    await dispatch(removeInscripcion(inscripcion.id!)).unwrap();
    dispatch(fetchInscripciones({ page, limit, searchTerm }));
  };

  const filteredInscripciones = Array.isArray(inscripciones)
    ? inscripciones.filter(
        (inscripcion) =>
          inscripcion.equipo
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          inscripcion.torneo?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <PageHeader title="Inscripciones" />

        <SearchField
          placeholder="Buscar por equipo o torneo"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Inscripcion>
          columns={inscripcionColumns}
          data={
            Array.isArray(filteredInscripciones) ? filteredInscripciones : []
          }
          onEdit={(row) => handleOpenModal(row as Inscripcion)}
          onDelete={(row) => handleDelete(row as Inscripcion)}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(
                fetchInscripciones({ page: page - 1, limit, searchTerm })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={inscripciones.length < limit}
            onClick={() =>
              dispatch(
                fetchInscripciones({ page: page + 1, limit, searchTerm })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={"Editar Inscripción"}
        >
          <Accordion>
            <AccordionItem title="Datos Básicos" defaultOpen>
              <DatosBasicos formData={formData} onChange={handleInputChange} />
            </AccordionItem>
            <AccordionItem title="Procesar Equipo">
              <ProcesarEquipo
                inscripcion={formData as Inscripcion}
                setFormData={setFormData}
              />
            </AccordionItem>
          </Accordion>
        </Modal>
      </div>
    </div>
  );
};

export default Inscripciones;
