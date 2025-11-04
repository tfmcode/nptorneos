/**
 * Formatea un número como moneda argentina
 */
export const formatearMoneda = (valor: number = 0): string => {
  return `$ ${valor.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Formatea un número con decimales
 */
export const formatearDecimal = (
  valor: number = 0,
  decimales: number = 2
): string => {
  return valor.toLocaleString("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  });
};

/**
 * Valida que un valor sea un número válido y mayor a cero
 */
export const esNumeroValido = (valor: unknown): boolean => {
  return typeof valor === "number" && !isNaN(valor) && valor > 0;
};

/**
 * Calcula el total de una propiedad en un array de objetos
 */
export const calcularTotalPropiedad = <T extends Record<string, unknown>>(
  datos: T[],
  propiedad: keyof T
): number => {
  return datos.reduce((total, item) => {
    const valor = item[propiedad];
    return total + (typeof valor === "number" ? valor : 0);
  }, 0);
};

/**
 * Calcula el total multiplicando dos propiedades
 */
export const calcularTotalMultiplicado = <T extends Record<string, unknown>>(
  datos: T[],
  prop1: keyof T,
  prop2: keyof T
): number => {
  return datos.reduce((total, item) => {
    const valor1 = item[prop1];
    const valor2 = item[prop2];
    const producto =
      typeof valor1 === "number" && typeof valor2 === "number"
        ? valor1 * valor2
        : 0;
    return total + producto;
  }, 0);
};

/**
 * Resetea un objeto a valores iniciales según su tipo
 */
export const resetearFormulario = <T extends Record<string, unknown>>(
  formulario: T,
  valoresPorDefecto?: Partial<T>
): T => {
  const nuevoFormulario = { ...formulario };

  Object.keys(nuevoFormulario).forEach((key) => {
    const tipedKey = key as keyof T;
    if (valoresPorDefecto && tipedKey in valoresPorDefecto) {
      nuevoFormulario[tipedKey] = valoresPorDefecto[tipedKey] as T[keyof T];
    } else if (typeof nuevoFormulario[tipedKey] === "number") {
      nuevoFormulario[tipedKey] = 0 as T[keyof T];
    } else if (typeof nuevoFormulario[tipedKey] === "string") {
      nuevoFormulario[tipedKey] = "" as T[keyof T];
    }
  });

  return nuevoFormulario;
};

/**
 * Valida que los campos requeridos de un formulario estén completos
 */
export const validarFormulario = <T extends Record<string, unknown>>(
  formulario: T,
  camposRequeridos: Array<{ campo: keyof T; mensaje: string }>
): { valido: boolean; mensaje?: string } => {
  for (const { campo, mensaje } of camposRequeridos) {
    const valor = formulario[campo];

    if (valor === undefined || valor === null || valor === "" || valor === 0) {
      return { valido: false, mensaje };
    }
  }

  return { valido: true };
};
