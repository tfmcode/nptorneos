import React, { useState } from "react";
import { InscripcionJugadorInput } from "../../types/inscripcionesJugadores";
import { sendInscripcionPublic } from "../../api/inscripcionesPublicService";
import { PopupNotificacion } from "../common/PopupNotificacion";

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
    if (!jugador.docnro) errores.push("• Ingresar el DNI");
    if (!jugador.fhnacimiento)
      errores.push("• Ingresar la fecha de nacimiento");
    if (!jugador.telefono) errores.push("• Ingresar el teléfono");

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    setJugadores([...jugadores, jugador]);
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
    if (jugadores.length === 0) errores.push("• Agregar al menos un jugador");

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
      await sendInscripcionPublic({
        email: form.email,
        equipo: form.equipo,
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
              onChange={(e) =>
                setJugador({ ...jugador, apellido: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="Nombres"
              value={jugador.nombres}
              onChange={(e) =>
                setJugador({ ...jugador, nombres: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="DNI"
              value={jugador.docnro || ""}
              onChange={(e) =>
                setJugador({ ...jugador, docnro: Number(e.target.value) })
              }
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
              onChange={(e) =>
                setJugador({ ...jugador, telefono: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="Email (opcional)"
              value={jugador.email || ""}
              onChange={(e) =>
                setJugador({ ...jugador, email: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="Posición (opcional)"
              value={jugador.posicion || ""}
              onChange={(e) =>
                setJugador({ ...jugador, posicion: e.target.value })
              }
            />
            <input
              className="input input-bordered"
              placeholder="Facebook (opcional)"
              value={jugador.facebook || ""}
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
