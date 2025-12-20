import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { fetchCuentasCorrientesGeneral } from "../../store/slices/cuentasCorrientesSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import {
  CurrencyDollarIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";
import CuentaCorriente from "../../components/equipos/CuentaCorriente";

const CuentasCorrientes: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { resumenes, loading, error } = useSelector(
    (state: RootState) => state.cuentasCorrientes
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filtroSaldo, setFiltroSaldo] = useState<
    "todos" | "deudores" | "acreedores"
  >("todos");
  const [selectedEquipo, setSelectedEquipo] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Paginado
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    dispatch(fetchCuentasCorrientesGeneral());
  }, [dispatch]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Sin movimientos";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return "text-green-600 font-bold";
    if (saldo < 0) return "text-red-600 font-bold";
    return "text-gray-600 font-bold";
  };

  const getSaldoBgColor = (saldo: number) => {
    if (saldo > 0) return "bg-green-50 border-green-200";
    if (saldo < 0) return "bg-red-50 border-red-200";
    return "bg-gray-50 border-gray-200";
  };

  // Filtrar resumenes
  const resumeneFiltrados = resumenes.filter((resumen) => {
    const matchSearch = resumen.nombre_equipo
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchSaldo =
      filtroSaldo === "todos" ||
      (filtroSaldo === "deudores" && resumen.saldo_actual < 0) ||
      (filtroSaldo === "acreedores" && resumen.saldo_actual > 0);

    return matchSearch && matchSaldo;
  });

  // Calcular paginación
  const totalPages = Math.ceil(resumeneFiltrados.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const resumenePaginados = resumeneFiltrados.slice(startIndex, endIndex);

  // Resetear a página 1 cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filtroSaldo]);

  // Calcular totales
  const totalDeudores = resumenes.filter((r) => r.saldo_actual < 0).length;
  const totalAcreedores = resumenes.filter((r) => r.saldo_actual > 0).length;
  const saldoTotalGeneral = resumenes.reduce(
    (acc, r) => acc + r.saldo_actual,
    0
  );

  const handleVerDetalle = (idequipo: number) => {
    setSelectedEquipo(idequipo);
    setIsModalOpen(true);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-7xl">
        <PageHeader
          title="Cuentas Corrientes"
          subtitle="Resumen de saldos de todos los equipos"
        />

        {/* Estadísticas generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CurrencyDollarIcon className="h-5 w-5 text-blue-600" />
              <p className="text-sm text-blue-600 font-medium">Total Equipos</p>
            </div>
            <p className="text-2xl font-bold text-blue-700">
              {resumenes.length}
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowTrendingDownIcon className="h-5 w-5 text-red-600" />
              <p className="text-sm text-red-600 font-medium">Deudores</p>
            </div>
            <p className="text-2xl font-bold text-red-700">{totalDeudores}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <ArrowTrendingUpIcon className="h-5 w-5 text-green-600" />
              <p className="text-sm text-green-600 font-medium">Acreedores</p>
            </div>
            <p className="text-2xl font-bold text-green-700">
              {totalAcreedores}
            </p>
          </div>

          <div
            className={`border rounded-lg p-4 ${getSaldoBgColor(
              saldoTotalGeneral
            )}`}
          >
            <p
              className={`text-sm font-medium mb-2 ${
                saldoTotalGeneral > 0
                  ? "text-green-600"
                  : saldoTotalGeneral < 0
                  ? "text-red-600"
                  : "text-gray-600"
              }`}
            >
              Saldo Total
            </p>
            <p
              className={`text-2xl font-bold ${getSaldoColor(
                saldoTotalGeneral
              )}`}
            >
              {formatCurrency(saldoTotalGeneral)}
            </p>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <SearchField
              placeholder="Buscar por nombre de equipo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onSearch={() => {}}
            />
          </div>

          <div className="flex items-center gap-2">
            <FunnelIcon className="h-5 w-5 text-gray-600" />
            <select
              value={filtroSaldo}
              onChange={(e) =>
                setFiltroSaldo(
                  e.target.value as "todos" | "deudores" | "acreedores"
                )
              }
              className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="todos">Todos</option>
              <option value="deudores">Solo Deudores</option>
              <option value="acreedores">Solo Acreedores</option>
            </select>
          </div>
        </div>

        <StatusMessage loading={loading} error={error} />

        {!loading && resumeneFiltrados.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">No se encontraron equipos</p>
            <p className="text-sm mt-2">
              {searchTerm
                ? `No hay equipos que coincidan con "${searchTerm}"`
                : "No hay equipos con movimientos en cuenta corriente"}
            </p>
          </div>
        )}

        {!loading && resumenePaginados.length > 0 && (
          <>
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Equipo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Debe
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Haber
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo Actual
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Último Movimiento
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {resumenePaginados.map((resumen) => (
                    <tr
                      key={resumen.idequipo}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div
                            className={`w-3 h-3 rounded-full mr-3 ${
                              resumen.saldo_actual > 0
                                ? "bg-green-500"
                                : resumen.saldo_actual < 0
                                ? "bg-red-500"
                                : "bg-gray-500"
                            }`}
                          ></div>
                          <div className="text-sm font-medium text-gray-900">
                            {resumen.nombre_equipo}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-red-600">
                        {formatCurrency(resumen.total_debe)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-green-600">
                        {formatCurrency(resumen.total_haber)}
                      </td>
                      <td
                        className={`px-6 py-4 whitespace-nowrap text-sm text-right ${getSaldoColor(
                          resumen.saldo_actual
                        )}`}
                      >
                        {formatCurrency(resumen.saldo_actual)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-700">
                        {formatDate(resumen.ultimo_movimiento)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleVerDetalle(resumen.idequipo)}
                          className="text-blue-600 hover:text-blue-900 hover:underline"
                        >
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Controles de paginado */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 px-4">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-700">
                  Página {currentPage} de {totalPages} (
                  {resumeneFiltrados.length} equipos)
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}

        {/* Modal con detalle */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEquipo(null);
          }}
          title="Detalle de Cuenta Corriente"
        >
          {selectedEquipo && <CuentaCorriente idequipo={selectedEquipo} />}
        </Modal>
      </div>
    </div>
  );
};

export default CuentasCorrientes;
