import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import DataTable from "../../components/tables/DataTable";
import { fetchPartidosByZona } from "../../store/slices/partidoSlice";
import {
  PageHeader,
  StatusMessage,
  Modal,
  Accordion,
  AccordionItem,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { resultadoColumns } from "../../components/tables";
import DatosBasicos from "../../components/resultados/DatosBasicos";
import { Partido } from "../../types";
import SelectorTorneoZonaFecha from "../../components/resultados/SelectorResultado";
import JugadoresEquipo from "../../components/resultados/JugadoresEquipo";

const Resultados: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { partidos, loading, error } = useSelector(
    (state: RootState) => state.partidos
  );

  const {
    formData,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
    isModalOpen,
  } = useCrudForm<Partido>({
    id: undefined,
    idzona: 0,
    nrofecha: 0,
    fecha: "",
    horario: "",
    idsede: 0,
    codtipo: 0,
    idequipo1: 0,
    idequipo2: 0,
    codestado: 1,
    idusuario: 0,
    fhcarga: new Date().toISOString(),
    fhbaja: undefined,
    nombre1: "",
    nombre2: "",
    sede: "",
    goles1: 0,
    goles2: 0,
    arbitro: "",
    puntobonus1: 0,
    puntobonus2: 0,
    formacion1: "",
    formacion2: "",
    cambios1: "",
    cambios2: "",
    dt1: "",
    dt2: "",
    suplentes1: "",
    suplentes2: "",
    ausente1: 0,
    ausente2: 0,
    idfecha: 0,
  });

  const [, setIdzonaSeleccionada] = useState<number | null>(null);
  const [nrofechaSeleccionada, setNrofechaSeleccionada] = useState<
    number | null
  >(null);

  const handleSeleccionar = (idzona: number, nrofecha: number) => {
    setIdzonaSeleccionada(idzona);
    setNrofechaSeleccionada(nrofecha);
    dispatch(fetchPartidosByZona(idzona));
  };

  const partidosFiltrados =
    nrofechaSeleccionada !== null
      ? partidos.filter((p) => p.nrofecha === nrofechaSeleccionada)
      : partidos;

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <PageHeader title="Resultados" />
        <SelectorTorneoZonaFecha onSeleccionar={handleSeleccionar} />
        <StatusMessage loading={loading} error={error} />

        <DataTable<Partido>
          columns={resultadoColumns}
          data={partidosFiltrados}
          onEdit={(row) => handleOpenModal(row)}
          // onDelete removido - los resultados no se eliminan
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title="Editar Resultado"
        >
          <Accordion>
            <AccordionItem title="Datos Básicos" defaultOpen>
              <DatosBasicos formData={formData} onChange={handleInputChange} />
            </AccordionItem>

            {formData.id && (
              <>
                <AccordionItem title={`Equipo Local ${formData.idequipo1}`}>
                  <JugadoresEquipo
                    idpartido={formData.id}
                    idequipo={formData.idequipo1}
                  />
                </AccordionItem>

                <AccordionItem title={`Equipo Visitante ${formData.idequipo2}`}>
                  <JugadoresEquipo
                    idpartido={formData.id}
                    idequipo={formData.idequipo2}
                  />
                </AccordionItem>
              </>
            )}
          </Accordion>
        </Modal>
      </div>
    </div>
  );
};

export default Resultados;
