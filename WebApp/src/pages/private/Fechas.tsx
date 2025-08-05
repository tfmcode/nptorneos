import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { FechaResumen, FechaInput } from "../../types/fechas";
import { fetchFechas, removeFecha } from "../../store/slices/fechasSlice";
import DataTable from "../../components/tables/DataTable";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { fechasColumns } from "../../components/tables";
import { Accordion, AccordionItem } from "../../components/common/Accordion";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import { DatosBasicos } from "../../components/fechas/DatosBasicos";

const Fechas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { fechas, loading, error } = useSelector(
    (state: RootState) => state.fechas
  );

  const { formData, isModalOpen, handleOpenModal, handleCloseModal } =
    useCrudForm<FechaInput & { id?: number }>({
      id: undefined,
      fecha: "",
      idsede: 0,
      idsubsede: 0,
      idtorneo: 0,
      codfecha: 0,
      idturno: 0,
      idprofesor: 0,
      observ: "",
    });

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchFechas());
  }, [dispatch]);

  useEffect(() => {}, [dispatch, formData.id]);

  const handleSearch = () => {
    // Filtrado en frontend
  };

  const handleDelete = async (fecha: FechaResumen) => {
    await dispatch(removeFecha(fecha.id)).unwrap();
    dispatch(fetchFechas());
  };

  const filteredFechas = fechas.filter((f) =>
    f.torneo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <PageHeader
          title="Fechas"
          actions={[
            {
              label: "Agregar Fecha",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por torneo"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<FechaResumen>
          columns={fechasColumns}
          data={filteredFechas}
          onEdit={(row) => handleOpenModal(row)}
          onDelete={(row) => handleDelete(row)}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Fecha" : "Crear Fecha"}
        >
          <Accordion>
            <AccordionItem title="Datos Básicos" defaultOpen={true}>
              <DatosBasicos />
            </AccordionItem>
          </Accordion>
        </Modal>
      </div>
    </div>
  );
};

export default Fechas;
