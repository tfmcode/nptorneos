export interface MovimientoCuentaCorriente {
  txfecha: string;
  descripcion: string;
  debe: number;
  haber: number;
}

export interface CuentaCorrienteEquipo {
  idequipo: number;
  nombre_equipo: string;
  movimientos: MovimientoCuentaCorriente[];
  saldo_final: number;
}

export interface ResumenCuentaCorriente {
  idequipo: number;
  nombre_equipo: string;
  saldo_actual: number;
  ultimo_movimiento: string | null;
  total_debe: number;
  total_haber: number;
}
