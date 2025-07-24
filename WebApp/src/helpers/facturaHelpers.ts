export function calcularImporteIVA(subtotal: number, alicuotaIVA: number) {
  return subtotal * (alicuotaIVA / 100);
}

export function calcularImporteIngrBru(subtotal: number, alicuotaIngrBru: number) {
  return subtotal * (alicuotaIngrBru / 100);
}

export function calcularImporteTotal(subtotal: number, iva: number, ingrBruto: number) {
  return Number(subtotal) + Number(iva) + Number(ingrBruto);
}
