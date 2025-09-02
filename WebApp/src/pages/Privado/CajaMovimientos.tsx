import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { CajaMovimiento } from "../../types/cajamovimiento";
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
import { dateToInputValue } from '../../helpers/dateHelpers';

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
  } = useCrudForm<CajaMovimiento>({
    fechaorigen: dateToInputValue(new Date()),
    fechavencimiento: dateToInputValue(new Date()),
    proveedor: "",
    comprobante: "",
    nrocomprobante: 0,
    importeefectivo: 0,
    importecheque: 0,
    importeneto: 0,
    importeafectado: 0,
    id: undefined,
  });

  const today = new Date();
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [fechaDesde, setFechaDesde] = useState<Date>(new Date(today.getFullYear(), 0, 1));
  const [fechaHasta, setFechaHasta] = useState<Date>(new Date(today.getFullYear(), 11, 31));

  useEffect(() => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...movimientoData } = formData;
      await dispatch(saveCajaMovimientoThunk(id ? formData : movimientoData)).unwrap();
      dispatch(
        fetchCajaMovimientos({
          page,
          limit,
          searchTerm,
          fechaDesde: fechaDesde || new Date("1900-01-01"),
          fechaHasta: fechaHasta || new Date("2099-12-31"),
        })
      );
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar movimiento de caja:", err);
    }
  };

  const handleDelete = async (movimiento: CajaMovimiento) => {
    await dispatch(removeCajaMovimiento(movimiento.id!)).unwrap();
    dispatch(
      fetchCajaMovimientos({
        page,
        limit,
        searchTerm,
        fechaDesde: fechaDesde || new Date("1900-01-01"),
        fechaHasta: fechaHasta || new Date("2099-12-31"),
      })
    );
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Movimientos de Caja"
          actions={[{
            label: "Agregar Movimiento",
            onClick: () => handleOpenModal(),
            icon: <PlusCircleIcon className="h-5 w-5" />,
          }]}
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
          onEdit={(row) => handleOpenModal(row as CajaMovimiento)}
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
                fetchCajaMovimientos({
                  page: page + 1,
                  limit,
                  searchTerm,
                  fechaDesde,
                  fechaHasta,
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
          title={formData.id ? "Editar Movimiento" : "Crear Movimiento"}
        >
          <CajaMovimientoForm
            formData={formData}
            onChange={(name, value) => {
              setFormData(prev => ({ ...prev, [name]: value }));
            }}
            onSubmit={handleSubmit}
            submitLabel="Guardar"
          />
        </Modal>
      </div>
    </div>
  );
};

export default CajaMovimientos;
