import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchCuentaCorrienteEquipo,
  clearCuentaEquipo,
} from "../../store/slices/cuentasCorrientesSlice";
import { StatusMessage } from "../common";
import {
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
} from "@heroicons/react/24/outline";

interface CuentaCorrienteProps {
  idequipo: number;
}

const CuentaCorriente = ({ idequipo }: CuentaCorrienteProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { cuentaEquipo, loading, error } = useSelector(
    (state: RootState) => state.cuentasCorrientes
  );

  const [saldosAcumulados, setSaldosAcumulados] = useState<number[]>([]);

  useEffect(() => {
    if (idequipo) {
      dispatch(fetchCuentaCorrienteEquipo(idequipo));
    }

    return () => {
      dispatch(clearCuentaEquipo());
    };
  }, [dispatch, idequipo]);

  // Calcular saldos acumulados cuando cambian los movimientos
  useEffect(() => {
    if (cuentaEquipo?.movimientos) {
      // Primero calculamos los saldos en orden cronológico
      let saldo = 0;
      const saldos = cuentaEquipo.movimientos.map((mov) => {
        if (mov.debe > 0) {
          saldo -= mov.debe;
        }
        if (mov.haber > 0) {
          saldo += mov.haber;
        }
        return saldo;
      });
      // Invertimos para que coincida con el orden invertido de los movimientos
      setSaldosAcumulados(saldos.reverse());
    }
  }, [cuentaEquipo]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 2,
    }).format(value);
  };

  const getSaldoColor = (saldo: number) => {
    if (saldo > 0) return "text-green-600 font-bold";
    if (saldo < 0) return "text-red-600 font-bold";
    return "text-gray-600 font-bold";
  };

  return (
    <div className="space-y-4">
      <StatusMessage loading={loading} error={error} />

      {!loading && cuentaEquipo && (
        <>
          {/* Título */}
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800">
              {cuentaEquipo.nombre_equipo}
            </h3>
            <p className="text-sm text-gray-600">Cuenta Corriente</p>
          </div>

          {/* Cajas de resumen: Debe, Haber y Saldo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-600 font-medium">Total Debe</p>
              <p className="text-xl font-bold text-red-700">
                {formatCurrency(
                  cuentaEquipo.movimientos.reduce(
                    (acc, mov) => acc + mov.debe,
                    0
                  )
                )}
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Total Haber</p>
              <p className="text-xl font-bold text-green-700">
                {formatCurrency(
                  cuentaEquipo.movimientos.reduce(
                    (acc, mov) => acc + mov.haber,
                    0
                  )
                )}
              </p>
            </div>
            <div
              className={`border rounded-lg p-4 ${
                cuentaEquipo.saldo_final > 0
                  ? "bg-green-50 border-green-200"
                  : cuentaEquipo.saldo_final < 0
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              }`}
            >
              <p
                className={`text-sm font-medium ${
                  cuentaEquipo.saldo_final > 0
                    ? "text-green-600"
                    : cuentaEquipo.saldo_final < 0
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                Saldo Actual
              </p>
              <p
                className={`text-xl font-bold ${
                  cuentaEquipo.saldo_final > 0
                    ? "text-green-700"
                    : cuentaEquipo.saldo_final < 0
                    ? "text-red-700"
                    : "text-gray-700"
                }`}
              >
                {formatCurrency(cuentaEquipo.saldo_final)}
              </p>
            </div>
          </div>

          {/* Tabla de movimientos */}
          {cuentaEquipo.movimientos.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">No hay movimientos registrados</p>
              <p className="text-sm mt-2">
                La cuenta corriente está sin movimientos
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto border rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debe
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Haber
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Saldo
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[...cuentaEquipo.movimientos].reverse().map((mov, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                        {mov.txfecha}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-2">
                          {mov.debe > 0 ? (
                            <ArrowTrendingDownIcon className="h-4 w-4 text-red-500" />
                          ) : (
                            <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />
                          )}
                          {mov.descripcion}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-red-600">
                        {mov.debe > 0 ? formatCurrency(mov.debe) : "—"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-green-600">
                        {mov.haber > 0 ? formatCurrency(mov.haber) : "—"}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap text-sm text-right ${getSaldoColor(
                          saldosAcumulados[index]
                        )}`}
                      >
                        {formatCurrency(saldosAcumulados[index])}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-100">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-right font-bold text-gray-700"
                    >
                      SALDO FINAL
                    </td>
                    <td className="px-4 py-3"></td>
                    <td className="px-4 py-3"></td>
                    <td
                      className={`px-4 py-3 text-right text-lg ${getSaldoColor(
                        cuentaEquipo.saldo_final
                      )}`}
                    >
                      {formatCurrency(cuentaEquipo.saldo_final)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CuentaCorriente;
