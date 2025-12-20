import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Factura, FacturaInput } from "../../types/factura";
import DataTable from "../../components/tables/DataTable";
import FacturaForm from "../../components/forms/FacturaForm";
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
import { facturasColumns } from "../../components/tables/columns/facturaColumns";
import { dateToInputValue } from "../../helpers/dateHelpers";

const Facturas: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { facturas, loading, error, page, limit, total, totalPages } =
    useSelector((state: RootState) => state.facturas);

  const {
    formData,
    setFormData,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<FacturaInput & { id?: number }>({
    fechaorigen: dateToInputValue(new Date()),
    fechavencimiento: dateToInputValue(new Date()),
    proveedor: 0,
    comprobante: "",
    nrocomprobante: 0,
    tipo: "A",
    formapago: 1,
    pagoautomatico: false,
    importesubtotal: 0,
    importeingrbru: 0,
    alicuotaingrbru: 0,
    importeiva: 0,
    alicuotaiva: 0,
    importetotal: 0,
    id: undefined,
  });

  const today = new Date();
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date>(
    new Date(today.getFullYear(), 0, 1)
  );
  const [fechaHasta, setFechaHasta] = useState<Date>(
    new Date(today.getFullYear(), 11, 31)
  );

  const loadFacturas = useCallback(() => {
    dispatch(
      fetchFacturas({
        page,
        limit,
        searchTerm,
        fechaDesde: fechaDesde || new Date("1900-01-01"),
        fechaHasta: fechaHasta || new Date("2099-12-31"),
      })
    );
  }, [dispatch, page, limit, searchTerm, fechaDesde, fechaHasta]);

  useEffect(() => {
    loadFacturas();
  }, [loadFacturas]);

  useEffect(() => {
    const subtotal = formData.importesubtotal || 0;
    const alicuotaIngBru = formData.alicuotaingrbru || 0;
    const importeIngBru = (subtotal * alicuotaIngBru) / 100;
    setFormData((prev) => ({ ...prev, importeingrbru: importeIngBru }));
  }, [formData.importesubtotal, formData.alicuotaingrbru, setFormData]);

  useEffect(() => {
    const subtotal = formData.importesubtotal || 0;
    const alicuotaIva = formData.alicuotaiva || 0;
    const importeIva = (subtotal * alicuotaIva) / 100;
    setFormData((prev) => ({ ...prev, importeiva: importeIva }));
  }, [formData.importesubtotal, formData.alicuotaiva, setFormData]);

  useEffect(() => {
    const subtotal = formData.importesubtotal || 0;
    const ingBru = formData.importeingrbru || 0;
    const iva = formData.importeiva || 0;
    const total = subtotal + ingBru + iva;
    setFormData((prev) => ({ ...prev, importetotal: total }));
  }, [
    formData.importesubtotal,
    formData.importeingrbru,
    formData.importeiva,
    setFormData,
  ]);

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

  const handleFormChange = (name: string, value: string | number | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...facturaData } = formData;
      await dispatch(saveFacturaThunk(id ? formData : facturaData)).unwrap();
      loadFacturas();
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar factura:", err);
      alert("Error al guardar la factura");
    }
  };

  const handleDelete = async (factura: Factura) => {
    if (!window.confirm("¿Está seguro de eliminar esta factura?")) {
      return;
    }

    try {
      await dispatch(removeFactura(factura.id!)).unwrap();
      loadFacturas();
    } catch (err) {
      console.error("Error al eliminar factura:", err);
      alert("Error al eliminar la factura");
    }
  };

  const handleEdit = (factura: Factura) => {
    setFormData({
      id: factura.id,
      comprobante: factura.comprobante || "",
      proveedor: factura.proveedor,
      nrocomprobante: factura.nrocomprobante || 0,
      fechaorigen: factura.fechaorigen
        ? dateToInputValue(new Date(factura.fechaorigen))
        : dateToInputValue(new Date()),
      fechavencimiento: factura.fechavencimiento
        ? dateToInputValue(new Date(factura.fechavencimiento))
        : dateToInputValue(new Date()),
      formapago: factura.formapago || 1,
      pagoautomatico: factura.pagoautomatico || false,
      tipo: factura.tipo || "A",
      importesubtotal: factura.importesubtotal || 0,
      importeingrbru: factura.importeingrbru || 0,
      alicuotaingrbru: factura.alicuotaingrbru || 0,
      importeiva: factura.importeiva || 0,
      alicuotaiva: factura.alicuotaiva || 0,
      importetotal: factura.importetotal || 0,
    });
    handleOpenModal();
  };

  const handleNewFactura = () => {
    setFormData({
      fechaorigen: dateToInputValue(new Date()),
      fechavencimiento: dateToInputValue(new Date()),
      proveedor: 0,
      comprobante: "",
      nrocomprobante: 0,
      tipo: "A",
      formapago: 1,
      pagoautomatico: false,
      importesubtotal: 0,
      importeingrbru: 0,
      alicuotaingrbru: 0,
      importeiva: 0,
      alicuotaiva: 0,
      importetotal: 0,
      id: undefined,
    });
    handleOpenModal();
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <PageHeader
          title="Gestión de Facturas"
          actions={[
            {
              label: "Agregar Factura",
              onClick: handleNewFactura,
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
          columns={facturasColumns}
          data={Array.isArray(facturas) ? facturas : []}
          onEdit={(row) => handleEdit(row as Factura)}
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
                  fechaDesde,
                  fechaHasta,
                })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-700">
            Página {page} de {totalPages || Math.ceil(total / limit)} | Total:{" "}
            {total} registros
          </span>
          <button
            disabled={page >= (totalPages || Math.ceil(total / limit))}
            onClick={() =>
              dispatch(
                fetchFacturas({
                  page: page + 1,
                  limit,
                  searchTerm,
                  fechaDesde,
                  fechaHasta,
                })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50 hover:bg-gray-400"
          >
            Siguiente
          </button>
        </div>

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.id ? "Editar Factura" : "Nueva Factura"}
        >
          <FacturaForm
            formData={formData}
            onChange={handleFormChange}
            onSubmit={handleSubmit}
            submitLabel={formData.id ? "Actualizar" : "Guardar"}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Facturas;
