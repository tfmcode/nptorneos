import React, { useEffect, useState, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import {
  CajaMovimiento,
  CajaMovimientoInput,
  CajaAfectacion,
} from "../../types/cajamovimiento";
import DataTable from "../../components/tables/DataTable";
import CajaMovimientoForm from "../../components/forms/CajaMovimientoForm";
import DateRangePicker from "../../components/common/DateRangePicker";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchCajaMovimientos,
  saveCajaMovimientoThunk,
  removeCajaMovimiento,
} from "../../store/slices/cajamovimientosSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { cajamovimientoColumns } from "../../components/tables/columns/cajamovimientoColumns";
import { dateToInputValue } from "../../helpers/dateHelpers";

const CajaMovimientos: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { cajamovimientos, loading, error, page, limit, total, totalPages } =
    useSelector((state: RootState) => state.cajamovimientos);

  const {
    formData,
    setFormData,
    isModalOpen,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<CajaMovimientoInput & { id?: number }>({
    fechaorigen: dateToInputValue(new Date()),
    fechavencimiento: dateToInputValue(new Date()),
    proveedor: 0,
    comprobante: "",
    nrocomprobante: 0,
    importeefectivo: 0,
    importecheque: 0,
    importeneto: 0,
    importeafectado: 0,
    cajaafectacion: [],
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

  const loadCajaMovimientos = useCallback(() => {
    dispatch(
      fetchCajaMovimientos({
        page,
        limit,
        searchTerm,
        fechaDesde: fechaDesde || new Date("1900-01-01"),
        fechaHasta: fechaHasta || new Date("2099-12-31"),
      })
    );
  }, [dispatch, page, limit, searchTerm, fechaDesde, fechaHasta]);

  useEffect(() => {
    loadCajaMovimientos();
  }, [loadCajaMovimientos]);

  const handleSearch = () => {
    dispatch(
      fetchCajaMovimientos({
        page: 1,
        limit,
        searchTerm: pendingSearchTerm,
        fechaDesde: fechaDesde || new Date("1900-01-01"),
        fechaHasta: fechaHasta || new Date("2099-12-31"),
      })
    );
    setSearchTerm(pendingSearchTerm);
  };

  const handleFormChange = (
    name: string,
    value: string | number | boolean | CajaAfectacion[]
  ) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validación: el importe afectado debe coincidir con la suma de afectaciones
    const totalAfectado =
      formData.cajaafectacion?.reduce(
        (sum, af) => sum + af.importeafectado,
        0
      ) || 0;

    if (Math.abs(totalAfectado - (formData.importeafectado || 0)) > 0.01) {
      alert(
        "El importe afectado no coincide con la suma de las facturas seleccionadas."
      );
      return;
    }

    try {
      const { id, ...movimientoData } = formData;
      await dispatch(
        saveCajaMovimientoThunk(id ? formData : movimientoData)
      ).unwrap();
      loadCajaMovimientos();
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar movimiento de caja:", err);
      alert("Error al guardar el movimiento de caja");
    }
  };

  const handleDelete = async (movimiento: CajaMovimiento) => {
    if (
      !window.confirm(
        "¿Está seguro de eliminar este movimiento? Se revertirán todas las afectaciones."
      )
    ) {
      return;
    }

    try {
      await dispatch(removeCajaMovimiento(movimiento.id!)).unwrap();
      loadCajaMovimientos();
    } catch (err) {
      console.error("Error al eliminar movimiento de caja:", err);
      alert("Error al eliminar el movimiento de caja");
    }
  };

  const handleEdit = (movimiento: CajaMovimiento) => {
    setFormData({
      id: movimiento.id,
      comprobante: movimiento.comprobante || "",
      proveedor: movimiento.proveedor,
      nrocomprobante: movimiento.nrocomprobante || 0,
      fechaorigen: movimiento.fechaorigen
        ? dateToInputValue(new Date(movimiento.fechaorigen))
        : dateToInputValue(new Date()),
      fechavencimiento: movimiento.fechavencimiento
        ? dateToInputValue(new Date(movimiento.fechavencimiento))
        : dateToInputValue(new Date()),
      importeefectivo: movimiento.importeefectivo || 0,
      importecheque: movimiento.importecheque || 0,
      importeneto: movimiento.importeneto || 0,
      importeafectado: movimiento.importeafectado || 0,
      cajaafectacion: movimiento.cajaafectacion || [],
    });
    handleOpenModal();
  };

  const handleNewMovimiento = () => {
    setFormData({
      fechaorigen: dateToInputValue(new Date()),
      fechavencimiento: dateToInputValue(new Date()),
      proveedor: 0,
      comprobante: "",
      nrocomprobante: 0,
      importeefectivo: 0,
      importecheque: 0,
      importeneto: 0,
      importeafectado: 0,
      cajaafectacion: [],
      id: undefined,
    });
    handleOpenModal();
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <PageHeader
          title="Movimientos de Caja"
          actions={[
            {
              label: "Agregar Movimiento",
              onClick: handleNewMovimiento,
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

        <DataTable<CajaMovimiento>
          columns={cajamovimientoColumns}
          data={Array.isArray(cajamovimientos) ? cajamovimientos : []}
          onEdit={(row) => handleEdit(row as CajaMovimiento)}
          onDelete={(row) => handleDelete(row as CajaMovimiento)}
        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(
                fetchCajaMovimientos({
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
                fetchCajaMovimientos({
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
          title={
            formData.id
              ? "Editar Movimiento de Caja"
              : "Nuevo Movimiento de Caja"
          }
        >
          <CajaMovimientoForm
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

export default CajaMovimientos;
