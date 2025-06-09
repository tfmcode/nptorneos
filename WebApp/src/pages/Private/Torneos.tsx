import React, { useEffect, useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import { RootState, AppDispatch } from "../../store"
import { Torneo } from "../../types/torneos"
import DataTable from "../../components/tables/DataTable"
import DynamicForm, { FieldConfig } from "../../components/forms/DynamicForm"
import { PlusCircleIcon } from "@heroicons/react/20/solid"
import {
  fetchTorneos,
  saveTorneoThunk,
  removeTorneo
} from "../../store/slices/torneoSlice"
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField
} from "../../components/common"
import { useCrudForm } from "../../hooks/useCrudForm"
import { torneoColumns } from "../../components/tables"
import { fetchCampeonatos } from "../../store/slices/campeonatoSlice"
import { fetchSedes } from "../../store/slices/sedeSlice"
import { fetchCodificadores } from "../../store/slices/codificadorSlice"
import { AccordionItem } from "../../components/common/Accordion"
import { Accordion } from "../../components/common/Accordion"

const Torneos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()

  const { torneos, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.torneos
  )

  const { user } = useSelector((state: RootState) => state.auth)
  const { campeonatos } = useSelector((state: RootState) => state.campeonatos)
  const { sedes } = useSelector((state: RootState) => state.sedes)
  const { codificadores } = useSelector(
    (state: RootState) => state.codificadores
  )

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal
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
    sas: 0
  })

  const [pendingSearchTerm, setPendingSearchTerm] = useState("")
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    dispatch(fetchTorneos({ page, limit, searchTerm }))
    dispatch(fetchCampeonatos())
    dispatch(fetchSedes())
    dispatch(fetchCodificadores())
  }, [dispatch, page, limit, searchTerm])

  const handleSearch = () => {
    dispatch(fetchTorneos({ page: 1, limit, searchTerm: pendingSearchTerm }))
    setSearchTerm(pendingSearchTerm)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { id, ...torneoData } = formData
      await dispatch(saveTorneoThunk(id ? formData : torneoData)).unwrap()
      dispatch(fetchTorneos({ page, limit, searchTerm }))
      handleCloseModal()
    } catch (err) {
      console.error("Error al guardar torneo:", err)
    }
  }

  const handleDelete = async (torneo: Torneo) => {
    await dispatch(removeTorneo(torneo.id!)).unwrap()
    dispatch(fetchTorneos({ page, limit, searchTerm }))
  }

  const filteredTorneos = Array.isArray(torneos)
    ? torneos.filter((torneo) =>
        torneo.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const torneoFields: FieldConfig[] = [
    {
      name: "nombre",
      type: "text",
      placeholder: "Nombre del Torneo",
      value: formData.nombre ?? "",
      colSpan: 2
    },
    {
      name: "abrev",
      type: "text",
      placeholder: "Abreviatura del Torneo",
      value: formData.abrev ?? ""
    },
    {
      name: "sas",
      type: "checkbox",
      value: formData.sas ?? 0,
      label: "Torneo Sas"
    },
    {
      name: "idcampeonato",
      type: "select",
      options: campeonatos
        .filter((campeonato) => campeonato.codestado === 1)
        .map((campeonato) => ({
          label: campeonato.nombre,
          value: campeonato.id ?? 0
        })),
      value: formData.idcampeonato ?? 0,
      label: "Campeonato"
    },
    {
      name: "idsede",
      type: "select",
      options: sedes.map((sede) => ({
        label: sede.nombre,
        value: sede.id ?? 1
      })),
      value: formData.idsede ?? 0,
      label: "Sede"
    },
    {
      name: "codmodelo",
      type: "select",
      options: [
        { label: "Regular", value: 1 },
        { label: "Playoff", value: 2 }
      ],
      value: formData.codmodelo ?? 1,
      label: "Modelo de Torneo"
    },
    {
      name: "idpadre",
      type: "select",
      options: torneos
        .filter((torneo) => torneo.codestado === 1)
        .map((torneo) => ({
          label: torneo.nombre,
          value: torneo.id ?? 1
        })),
      value: formData.idpadre ?? 0,
      label: "Torneo Padre"
    },
    {
      name: "anio",
      type: "number",
      value: formData.anio ?? 1,
      label: "Año"
    },
    {
      name: "codestado",
      type: "select",
      options: [
        { label: "Activo", value: 1 },
        { label: "Inactivo", value: 0 }
      ],
      value: formData.codestado ?? 1,
      label: "Estado"
    },
    {
      name: "codtipo",
      type: "select",
      options: codificadores
        .filter(
          (codificador) =>
            codificador.habilitado === "1" && codificador.idcodificador === 3
        )
        .map((codificador) => ({
          label: codificador.descripcion ?? "",
          value: codificador.id ?? 1
        })),
      value: formData.codtipo ?? 0,
      label: "Tipo de Torneo"
    },
    {
      name: "cantmin",
      type: "number",
      value: formData.cantmin ?? 1,
      label: "Cant. Mínima"
    },
    {
      name: "cposicion",
      type: "checkbox",
      value: formData.cposicion ?? 1,
      label: "Calc. Posiciones"
    },
    {
      name: "cpromedio",
      type: "checkbox",
      value: formData.cpromedio ?? 1,
      label: "Calc. Promedio"
    },
    {
      name: "torneodefault",
      type: "checkbox",
      value: formData.torneodefault ?? 0,
      label: "Torneo Default"
    },
    {
      name: "fotojugador",
      type: "checkbox",
      value: formData.fotojugador ?? 0,
      label: "Foto Jugador"
    },
    {
      name: "excluir_res",
      type: "checkbox",
      value: formData.excluir_res ?? 0,
      label: "Excluir Resultados"
    },
    {
      name: "individual",
      type: "checkbox",
      value: formData.individual ?? 0,
      label: "Individual"
    },
    {
      name: "idgaleria",
      type: "select",
      options: [],
      value: formData.idgaleria ?? 0,
      label: "Galeria"
    },
    {
      name: "valor_insc",
      type: "money",
      value: formData.valor_insc ?? 0,
      label: "Inscripción"
    },
    {
      name: "valor_arbitro",
      type: "money",
      value: formData.valor_arbitro ?? 1,
      label: "Valor Árbitro"
    },
    {
      name: "valor_cancha",
      type: "money",
      value: formData.valor_cancha ?? 1,
      label: "Valor Cancha"
    },
    {
      name: "valor_fecha",
      type: "money",
      value: formData.valor_fecha ?? 1,
      label: "Valor Fecha"
    },
    {
      name: "valor_medico",
      type: "money",
      value: formData.valor_medico ?? 1,
      label: "Valor Médico"
    }
  ]

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Torneos"
          actions={[
            {
              label: "Agregar Torneo",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />
            }
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
              <DynamicForm
                fields={torneoFields}
                onChange={handleInputChange}
                onSubmit={handleSubmit}
                submitLabel="Guardar"
              />
            </AccordionItem>
            <AccordionItem title="Zonas" defaultOpen={false}>
              <div>
                <h1>Zonas</h1>
              </div>
            </AccordionItem>
            <AccordionItem title="Equipos" defaultOpen={false}>
              <div>
                <h1>Equipos</h1>
              </div>
            </AccordionItem>
            <AccordionItem title="Fixture" defaultOpen={false}>
              <div>
                <h1>Fixture</h1>
              </div>
            </AccordionItem>
            <AccordionItem title="Imágenes" defaultOpen={false}>
              <div>
                <h1>Imágenes</h1>
              </div>
            </AccordionItem>
          </Accordion>
        </Modal>
      </div>
    </div>
  );
};

export default Torneos;
