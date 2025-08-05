import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Proveedor } from "../../types/proveedores";
import DataTable from "../../components/tables/DataTable";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchProveedores,
  removeProveedor,
} from "../../store/slices/proveedoresSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { proveedorColumns } from "../../components/tables";
import { Accordion, AccordionItem } from "../../components/common/Accordion";
import DatosBasicos from "../../components/proveedores/DatosBasicos";

const Proveedores: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  const { proveedores, loading, error, page, limit, total } = useSelector(
    (state: RootState) => state.proveedores
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Proveedor>({
    id: undefined,
    codtipo: 1,
    nombre: "",
    domicilio: "",
    localidad: "",
    pais: "Argentina",
    provincia: "",
    cpostal: "",
    telefono: "",
    celular: "",
    email: "",
    documento: "",
    fhnac: "",
    estcivil: "",
    hijos: "",
    estudios: "",
    facebook: "",
    valor_hora: 0,
    valor_fijo: 0,
    sumarhs: 0,
    contrasenia: "",
    sedes: "",
    nombrefiscal: "",
    codcateg: 0,
    cuit: "",
    fax: "",
    contacto: "",
    producto: "",
    codtipogasto: 2,
    fhcarga: undefined,
    fhbaja: undefined,
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchProveedores({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSearch = () => {
    dispatch(
      fetchProveedores({ page: 1, limit, searchTerm: pendingSearchTerm })
    );
    setSearchTerm(pendingSearchTerm);
  };

  const handleDelete = async (proveedor: Proveedor) => {
    await dispatch(removeProveedor(proveedor.id!)).unwrap();
    dispatch(fetchProveedores({ page, limit, searchTerm }));
  };

  const filteredProveedores = Array.isArray(proveedores)
    ? proveedores.filter((proveedor) =>
        proveedor.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Proveedores"
          actions={[
            {
              label: "Agregar Proveedor",
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

        <DataTable<Proveedor>
          columns={proveedorColumns}
          data={filteredProveedores}
          onEdit={(row) => handleOpenModal(row as Proveedor)}
          onDelete={(row) => handleDelete(row as Proveedor)}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(fetchProveedores({ page: page - 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            disabled={proveedores.length < limit}
            onClick={() =>
              dispatch(fetchProveedores({ page: page + 1, limit, searchTerm }))
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Proveedor" : "Crear Proveedor"}
        >
          <Accordion>
            <AccordionItem title="Datos Básicos" defaultOpen={true}>
              <DatosBasicos formData={formData} onChange={handleInputChange} />
            </AccordionItem>
          </Accordion>
        </Modal>
      </div>
    </div>
  );
};

export default Proveedores;
