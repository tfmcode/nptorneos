import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Factura } from "../../types/factura";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import DateRangePicker from "../../components/common/DateRangePicker";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchFacturas,
  saveFacturaThunk,
  removeFactura,
} from "../../store/slices/facturasSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { facturaColumns } from "../../components/tables/columns/facturaColumns";
import { dateToInputValue } from '../../helpers/dateHelpers';

const Facturas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { facturas, loading, error, page, limit, total, totalPages } = 
    useSelector((state: RootState) => state.facturas);

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Factura>({
    fechaorigen: dateToInputValue(new Date()),
    proveedor: "",
    comprobante: "",
    tipo: "",
    nrocomprobante: 0,
    fechavencimiento: dateToInputValue(new Date()),
    formapago: "",
    pagoautomatico: false,
    importesubtotal: 0,
    importeingrbru: 0,
    importeiva: 0,
    alicuotaingrbru: 0,
    alicuotaiva: 1,
    importetotal: 0,
    id: undefined,
  });

  const today = new Date();
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date>(new Date(today.getFullYear(), 0, 1));
  const [fechaHasta, setFechaHasta] = useState<Date>(new Date(today.getFullYear(), 11, 31));

  useEffect(() => {
    dispatch(
      fetchFacturas({
        page,
        limit,
        searchTerm,
        fechaDesde: fechaDesde || new Date("1900-01-01"),
        fechaHasta: fechaHasta || new Date("2099-12-31"),
      }));
  }, [dispatch, page, limit, searchTerm, fechaDesde, fechaHasta]);

  const handleSearch = () => {
      dispatch(
        fetchFacturas({
          page: 1,
          limit,
          searchTerm: pendingSearchTerm,
          fechaDesde: fechaDesde || new Date("1900-01-01"),
          fechaHasta: fechaHasta || new Date("2099-12-31"),
        })
      );
      setSearchTerm(pendingSearchTerm);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...facturaData } = formData;
      await dispatch(saveFacturaThunk(id ? formData : facturaData)).unwrap();
      dispatch(
          fetchFacturas({
            page,
            limit,
            searchTerm,
            fechaDesde: fechaDesde || new Date("1900-01-01"),
            fechaHasta: fechaHasta || new Date("2099-12-31"),
          })
        );
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar factura:", err);
    }
  };

  const handleDelete = async (factura: Factura) => {
    await dispatch(removeFactura(factura.id!)).unwrap();
    dispatch(
      fetchFacturas({
        page,
        limit,
        searchTerm,
        fechaDesde: fechaDesde || new Date("1900-01-01"),
        fechaHasta: fechaHasta || new Date("2099-12-31"),
      }));
  };

  const filteredFacturas = Array.isArray(facturas)
    ? (searchTerm
        ? facturas.filter((factura) =>
            factura.nroComprobante?.toString().includes(searchTerm)
          )
        : facturas)
    : [];

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Facturas"
          actions={[
            {
              label: "Agregar Factura",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <DateRangePicker
          startDate={dateToInputValue(fechaDesde)}
          endDate={dateToInputValue(fechaHasta)}
          setStartDate={(value) => setFechaDesde(new Date(value))}
          setEndDate={(value) => setFechaHasta(new Date(value))}
        />

        <SearchField
          placeholder="Buscar por N° comprobante"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Factura>
          columns={facturaColumns}
          data={Array.isArray(filteredFacturas) ? filteredFacturas : []}
          onEdit={(row) => handleOpenModal(row as Factura)}
          onDelete={(row) => handleDelete(row as Factura)}
        />
        
        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(
                fetchFacturas({
                  page: page - 1,
                  limit,
                  searchTerm,
                  fechaDesde: fechaDesde || new Date("1900-01-01"),
                  fechaHasta: fechaHasta || new Date("2099-12-31"),
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
                fetchFacturas({
                  page: page + 1,
                  limit,
                  searchTerm,
                  fechaDesde: fechaDesde || new Date("1900-01-01"),
                  fechaHasta: fechaHasta || new Date("2099-12-31"),
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
          onClose={handleCloseModal}
          title={formData.id ? "Editar Factura" : "Crear Factura"}
        >
          <DynamicForm
            fields={[
              {
                name: "nrocomprobante",
                type: "number",
                placeholder: "N° Comprobante",
                value: formData.nrocomprobante ?? "",
              },
              {
                name: "fechaorigen",
                type: "date",
                placeholder: "Fecha",
                value: dateToInputValue(formData.fechaorigen),
              },
              {
                name: "comprobante",
                type: "text",
                placeholder: "Comprobante",
                value: formData.comprobante ?? "",
              },
              {
                name: "tipo",
                type: "text",
                placeholder: "Tipo",
                value: formData.tipo ?? "",
              },
              {
                name: "proveedor",
                type: "text",
                placeholder: "Proveedor",
                value: formData.proveedor ?? "",
              },
              {
                name: "fechavencimiento",
                type: "date",
                placeholder: "Fecha Vto.",
                value: dateToInputValue(formData.fechavencimiento),
              },
              {
                name: "formapago",
                type: "text",
                placeholder: "Pago",
                value: formData.formapago ?? "",
              },
              {
                name: "pagoautomatico",
                type: "checkbox",
                placeholder: "Pago automatico",
                value: formData.pagoautomatico ?? false,
              },
              {
                name: "importeingrbru",
                type: "money",
                placeholder: "Importe Ingr. Br.",
                value: formData.importeingrbru ?? 0,
              },
              {
                name: "importeiva",
                type: "money",
                placeholder: "Importe IVA",
                value: formData.importeiva ?? 0,
              },
              {
                name: "importetotal",
                type: "money",
                placeholder: "Importe Neto",
                value: formData.importetotal ?? 0,
              }
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

export default Facturas;
