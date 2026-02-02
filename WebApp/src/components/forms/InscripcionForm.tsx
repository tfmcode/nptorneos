import React, { useState } from "react";
import { InscripcionJugadorInput } from "../../types/inscripcionesJugadores";
import { sendInscripcionPublic } from "../../api/inscripcionesPublicService";
import { PopupNotificacion } from "../common/PopupNotificacion";

// ==================== VALIDACIONES Y SEGURIDAD ====================

const VALIDACION = {
  DNI_MIN_LENGTH: 6,
  DNI_MAX_LENGTH: 9, // Máximo 9 dígitos para no exceder límite de INTEGER en PostgreSQL
  DNI_MAX_VALUE: 2147483647, // Límite máximo de INTEGER en PostgreSQL
  FECHA_MIN_YEAR: 1940,
  FECHA_MAX_YEAR: 2024,
  TEXTO_MAX_LENGTH: 200,
};

// Mínimo de jugadores según categoría (idtorneo)
const MINIMO_JUGADORES: Record<number, { minimo: number; nombre: string }> = {
  265: { minimo: 5, nombre: "Fútbol 5 / Infantil / Juvenil" },
  268: { minimo: 8, nombre: "Fútbol 8" },
  270: { minimo: 11, nombre: "Fútbol 11" },
  271: { minimo: 5, nombre: "Femenino" },
};

/**
 * Valida que el DNI sea numérico y tenga entre 6 y 9 dígitos
 */
const validarDNI = (dni: string | number | undefined): { valido: boolean; mensaje: string } => {
  if (!dni) {
    return { valido: false, mensaje: "El DNI es requerido" };
  }

  const dniStr = String(dni).trim();

  // Verificar que solo contenga números
  if (!/^\d+$/.test(dniStr)) {
    return { valido: false, mensaje: "El DNI debe contener solo números (sin letras ni símbolos)" };
  }

  // Verificar longitud
  if (dniStr.length < VALIDACION.DNI_MIN_LENGTH || dniStr.length > VALIDACION.DNI_MAX_LENGTH) {
    return {
      valido: false,
      mensaje: `El DNI debe tener entre ${VALIDACION.DNI_MIN_LENGTH} y ${VALIDACION.DNI_MAX_LENGTH} dígitos numéricos`
    };
  }

  // Verificar que no exceda el límite de INTEGER
  const dniNum = Number(dniStr);
  if (dniNum > VALIDACION.DNI_MAX_VALUE) {
    return {
      valido: false,
      mensaje: "El DNI ingresado es demasiado grande. Verificá que sea correcto."
    };
  }

  return { valido: true, mensaje: "" };
};

/**
 * Valida que la fecha de nacimiento esté entre 1940 y 2024
 */
const validarFechaNacimiento = (fecha: string): { valido: boolean; mensaje: string } => {
  if (!fecha) {
    return { valido: false, mensaje: "La fecha de nacimiento es requerida" };
  }

  const fechaDate = new Date(fecha);
  const year = fechaDate.getFullYear();
  const hoy = new Date();

  // Verificar fecha válida
  if (isNaN(fechaDate.getTime())) {
    return { valido: false, mensaje: "La fecha de nacimiento no es válida" };
  }

  // Verificar que no sea fecha futura
  if (fechaDate > hoy) {
    return { valido: false, mensaje: "La fecha de nacimiento no puede ser una fecha futura" };
  }

  // Verificar rango de años
  if (year < VALIDACION.FECHA_MIN_YEAR || year > VALIDACION.FECHA_MAX_YEAR) {
    return {
      valido: false,
      mensaje: `La fecha de nacimiento debe estar entre ${VALIDACION.FECHA_MIN_YEAR} y ${VALIDACION.FECHA_MAX_YEAR}`
    };
  }

  return { valido: true, mensaje: "" };
};

/**
 * Sanitiza texto para prevenir XSS y entradas maliciosas
 * - Elimina tags HTML/scripts
 * - Escapa caracteres peligrosos
 * - Limita longitud máxima
 */
const sanitizarTexto = (texto: string, maxLength: number = VALIDACION.TEXTO_MAX_LENGTH): string => {
  if (!texto) return "";

  let sanitizado = texto
    // Eliminar tags HTML y scripts
    .replace(/<[^>]*>/g, "")
    // Eliminar eventos javascript (onclick, onerror, etc.)
    .replace(/on\w+\s*=/gi, "")
    // Eliminar javascript: y data: URIs
    .replace(/javascript:/gi, "")
    .replace(/data:/gi, "")
    // Escapar caracteres peligrosos
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    // Mantener solo caracteres imprimibles (espacio a tilde, más acentos latinos)
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "")
    // Trim espacios
    .trim();

  // Limitar longitud
  if (sanitizado.length > maxLength) {
    sanitizado = sanitizado.substring(0, maxLength);
  }

  return sanitizado;
};

/**
 * Valida que el DNI solo contenga números mientras se escribe
 */
const soloNumeros = (valor: string): string => {
  return valor.replace(/\D/g, "");
};

// ==================== COMPONENTE ====================

export const InscripcionForm: React.FC = () => {
  const [form, setForm] = useState({
    email: "",
    emailConfirmacion: "",
    equipo: "",
    idtorneo: 0,
    foto: "",
  });

  const [jugador, setJugador] = useState<InscripcionJugadorInput>({
    apellido: "",
    nombres: "",
    docnro: undefined,
    fhnacimiento: "",
    telefono: "",
    email: "",
    posicion: "",
    facebook: "",
    capitan: 0,
    subcapitan: 0,
  });

  const [jugadores, setJugadores] = useState<InscripcionJugadorInput[]>([]);
  const [popup, setPopup] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    message: "",
  });

  const showPopup = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setPopup({ open: true, type, message });
    setTimeout(() => setPopup({ ...popup, open: false }), 4000);
  };

  const handleAddJugador = () => {
    const errores: string[] = [];

    if (!jugador.apellido) errores.push("• Ingresar el apellido");
    if (!jugador.nombres) errores.push("• Ingresar el nombre");
    if (!jugador.telefono) errores.push("• Ingresar el teléfono");

    // Validación de DNI con reglas específicas
    const validacionDNI = validarDNI(jugador.docnro);
    if (!validacionDNI.valido) {
      errores.push(`• ${validacionDNI.mensaje}`);
    }

    // Validación de fecha de nacimiento con rango permitido
    const validacionFecha = validarFechaNacimiento(jugador.fhnacimiento ?? "");
    if (!validacionFecha.valido) {
      errores.push(`• ${validacionFecha.mensaje}`);
    }

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    // Sanitizar campos de texto antes de agregar
    const jugadorSanitizado: InscripcionJugadorInput = {
      ...jugador,
      apellido: sanitizarTexto(jugador.apellido ?? ""),
      nombres: sanitizarTexto(jugador.nombres ?? ""),
      telefono: sanitizarTexto(jugador.telefono ?? "", 20),
      email: sanitizarTexto(jugador.email ?? "", 100),
      posicion: sanitizarTexto(jugador.posicion ?? "", 50),
      facebook: sanitizarTexto(jugador.facebook ?? "", 100),
    };

    setJugadores([...jugadores, jugadorSanitizado]);
    setJugador({
      apellido: "",
      nombres: "",
      docnro: undefined,
      fhnacimiento: "",
      telefono: "",
      email: "",
      posicion: "",
      facebook: "",
      capitan: 0,
      subcapitan: 0,
    });
  };

  const handleSubmit = async () => {
    const errores: string[] = [];

    if (!form.email) errores.push("• Ingresar el Email");
    if (!form.emailConfirmacion)
      errores.push("• Ingresar el Email de Confirmación");
    if (
      form.email &&
      form.emailConfirmacion &&
      form.email !== form.emailConfirmacion
    )
      errores.push("• Los emails no coinciden");
    if (!form.equipo) errores.push("• Ingresar el nombre del equipo");
    if (form.idtorneo === 0) errores.push("• Seleccionar un torneo");

    // Validar mínimo de jugadores según categoría
    const categoriaSeleccionada = MINIMO_JUGADORES[form.idtorneo];
    if (categoriaSeleccionada) {
      if (jugadores.length < categoriaSeleccionada.minimo) {
        errores.push(
          `• La categoría ${categoriaSeleccionada.nombre} requiere mínimo ${categoriaSeleccionada.minimo} jugadores (tenés ${jugadores.length})`
        );
      }
    } else if (jugadores.length === 0) {
      errores.push("• Agregar al menos un jugador");
    }

    jugadores.forEach((j, index) => {
      if (
        !j.apellido ||
        !j.nombres ||
        !j.docnro ||
        !j.fhnacimiento ||
        !j.telefono
      ) {
        errores.push(`• Jugador #${index + 1} tiene datos incompletos`);
      }
    });

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      // Sanitizar datos antes de enviar
      const equipoSanitizado = sanitizarTexto(form.equipo, 100);
      const emailSanitizado = sanitizarTexto(form.email, 100);

      await sendInscripcionPublic({
        email: emailSanitizado,
        equipo: equipoSanitizado,
        idtorneo: form.idtorneo,
        foto: form.foto,
        jugadores: jugadores.map((j, i) => ({
          ...j,
          orden: i + 1,
          capitan: j.capitan || 0,
          subcapitan: j.subcapitan || 0,
        })),
      });

      showPopup("success", "¡Inscripción enviada!");
      setForm({
        email: "",
        emailConfirmacion: "",
        equipo: "",
        idtorneo: 0,
        foto: "",
      });
      setJugadores([]);
    } catch {
      showPopup("error", "Error al enviar la inscripción");
    }
  };

  const eliminarJugador = (index: number) => {
    const nuevaLista = jugadores.filter((_, i) => i !== index);
    setJugadores(nuevaLista);
  };

  return (
    <>
      <PopupNotificacion
        open={popup.open}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ ...popup, open: false })}
      />

      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow space-y-6">
        <h2 className="text-2xl font-semibold text-center text-gray-800">
          Formulario de Inscripción
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="email"
            className="input input-bordered w-full"
            placeholder="Confirmar Email"
            value={form.emailConfirmacion}
            onChange={(e) =>
              setForm({ ...form, emailConfirmacion: e.target.value })
            }
          />
          <input
            className="input input-bordered w-full"
            placeholder="Nombre del equipo"
            value={form.equipo}
            maxLength={100}
            onChange={(e) => setForm({ ...form, equipo: e.target.value })}
          />
          <select
            className="select select-bordered w-full"
            value={form.idtorneo}
            onChange={(e) =>
              setForm({ ...form, idtorneo: Number(e.target.value) })
            }
          >
            <option value={0}>Seleccionar Categoría</option>
            <option value={265}>Fútbol 5</option>
            <option value={268}>Fútbol 8</option>
            <option value={270}>Fútbol 11</option>
            <option value={265}>Infantil</option>
            <option value={265}>Juvenil</option>
            <option value={271}>Femenino</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <h3 className="text-xl font-bold mb-2">Agregar Jugador</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              className="input input-bordered"
              placeholder="Apellido"
              value={jugador.apellido}
              maxLength={100}
              onChange={(e) =>
                setJugador({ ...jugador, apellido: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="Nombres"
              value={jugador.nombres}
              maxLength={100}
              onChange={(e) =>
                setJugador({ ...jugador, nombres: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="DNI (6-9 dígitos)"
              value={jugador.docnro || ""}
              maxLength={9}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                const valorLimpio = soloNumeros(e.target.value);
                setJugador({ ...jugador, docnro: valorLimpio ? Number(valorLimpio) : undefined });
              }}
            />
            <input
              type="date"
              className="input input-bordered"
              value={jugador.fhnacimiento}
              onChange={(e) =>
                setJugador({ ...jugador, fhnacimiento: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="Teléfono"
              value={jugador.telefono}
              maxLength={20}
              onChange={(e) =>
                setJugador({ ...jugador, telefono: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="Email (opcional)"
              value={jugador.email || ""}
              maxLength={100}
              onChange={(e) =>
                setJugador({ ...jugador, email: e.target.value })
              }
            />
            <select
              className="select select-bordered"
              value={jugador.posicion || ""}
              onChange={(e) =>
                setJugador({ ...jugador, posicion: e.target.value })
              }
            >
              <option value="">Camiseta (opcional)</option>
              {Array.from({ length: 100 }, (_, i) => (
                <option key={i} value={String(i)}>
                  {i}
                </option>
              ))}
            </select>
            <input
              className="input input-bordered"
              placeholder="Facebook (opcional)"
              value={jugador.facebook || ""}
              maxLength={100}
              onChange={(e) =>
                setJugador({ ...jugador, facebook: e.target.value })
              }
            />
          </div>

          <div className="flex items-center gap-6 mt-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={jugador.capitan === 1}
                onChange={(e) =>
                  setJugador({ ...jugador, capitan: e.target.checked ? 1 : 0 })
                }
              />
              Capitán
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                className="checkbox"
                checked={jugador.subcapitan === 1}
                onChange={(e) =>
                  setJugador({
                    ...jugador,
                    subcapitan: e.target.checked ? 1 : 0,
                  })
                }
              />
              Subcapitán
            </label>
            <button
              className="btn btn-primary ml-auto"
              onClick={handleAddJugador}
            >
              Agregar jugador
            </button>
          </div>
        </div>

        {jugadores.length > 0 && (
          <div className="overflow-x-auto mt-6">
            <h4 className="font-bold mb-2 text-lg">Lista de Buena Fe</h4>
            <table className="min-w-full bg-white border rounded-md">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Apellido</th>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">DNI</th>
                  <th className="px-4 py-2">Teléfono</th>
                  <th className="px-4 py-2">Camiseta</th>
                  <th className="px-4 py-2 text-center">C</th>
                  <th className="px-4 py-2 text-center">SC</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((j, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{i + 1}</td>
                    <td className="px-4 py-2">{j.apellido}</td>
                    <td className="px-4 py-2">{j.nombres}</td>
                    <td className="px-4 py-2">{j.docnro}</td>
                    <td className="px-4 py-2">{j.telefono}</td>
                    <td className="px-4 py-2">{j.posicion || "-"}</td>
                    <td className="px-4 py-2 text-center">
                      {j.capitan ? "✔️" : ""}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {j.subcapitan ? "✔️" : ""}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="text-red-600 hover:underline"
                        onClick={() => eliminarJugador(i)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center">
          <button
            className="btn btn-success px-8 py-2 text-lg"
            onClick={handleSubmit}
          >
            Enviar Inscripción
          </button>
        </div>
      </div>
    </>
  );
};
