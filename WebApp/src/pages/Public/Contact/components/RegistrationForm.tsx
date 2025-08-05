/* import React, { useState } from "react";
import {
  JugadorInput,
  NuevaInscripcionInput,
  TorneoResumen,
} from ".././../../../types/inscripcionesPublic";
import { enviarInscripcion } from "../../../../api/inscripcionesPublicService"; // Adjust the import path as necessary

const TORNEOS: TorneoResumen[] = [
  { id: 5, nombre: "FUTBOL 5", cantmin: 5 },
  { id: 8, nombre: "FUTBOL 8", cantmin: 8 },
  { id: 11, nombre: "FUTBOL 11", cantmin: 11 },
  { id: 12, nombre: "INFANTO JUVENIL", cantmin: 7 },
  { id: 99, nombre: "Femenino", cantmin: 5 },
];

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<
    Omit<NuevaInscripcionInput, "jugadores"> & { emailConfirm: string }
  >({
    email: "",
    emailConfirm: "",
    equipo: "",
    idtorneo: 0,
    foto: "",
  });

  const [jugadores, setJugadores] = useState<JugadorInput[]>([]);
  const [nuevoJugador, setNuevoJugador] = useState<JugadorInput>({
    orden: 0,
    apellido: "",
    nombres: "",
    docnro: "",
    fhnacimiento: "",
    telefono: "",
    email: "",
    posicion: "",
    facebook: "",
    capitan: false,
    subcapitan: false,
  });

  const handleFormChange = (
    field: keyof typeof formData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleJugadorChange = (
    field: keyof JugadorInput,
    value: string | boolean | number
  ) => {
    setNuevoJugador((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, foto: reader.result as string }));
      };
      reader.readAsDataURL(event.target.files[0]);
    }
  };

  const agregarJugador = () => {
    if (nuevoJugador.capitan && jugadores.some((j) => j.capitan)) {
      alert("Ya hay un capitán asignado.");
      return;
    }
    if (nuevoJugador.subcapitan && jugadores.some((j) => j.subcapitan)) {
      alert("Ya hay un subcapitán asignado.");
      return;
    }

    setJugadores((prev) => [
      ...prev,
      {
        ...nuevoJugador,
        orden: prev.length + 1,
      },
    ]);

    setNuevoJugador({
      orden: 0,
      apellido: "",
      nombres: "",
      docnro: "",
      fhnacimiento: "",
      telefono: "",
      email: "",
      posicion: "",
      facebook: "",
      capitan: false,
      subcapitan: false,
    });
  };

  const eliminarJugador = (index: number) => {
    const nuevaLista = [...jugadores];
    nuevaLista.splice(index, 1);
    setJugadores(nuevaLista);
  };

  const enviarFormulario = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.email !== formData.emailConfirm) {
      alert("Los correos electrónicos no coinciden.");
      return;
    }

    if (!formData.idtorneo || formData.idtorneo === 0) {
      alert("Debe seleccionar un torneo.");
      return;
    }

    if (jugadores.length === 0) {
      alert("Debe agregar al menos un jugador.");
      return;
    }

    const payload: NuevaInscripcionInput = {
      email: formData.email,
      equipo: formData.equipo,
      idtorneo: formData.idtorneo,
      foto: formData.foto,
      jugadores,
    };

    try {
      await enviarInscripcion(payload);
      alert("¡Inscripción enviada correctamente!");

      // Reset
      setFormData({
        email: "",
        emailConfirm: "",
        equipo: "",
        idtorneo: 0,
        foto: "",
      });
      setJugadores([]);
    } catch {
      alert("Error al enviar la inscripción.");
    }
  };

  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg max-w-4xl mx-auto">
      <form className="space-y-6" onSubmit={enviarFormulario}>
        <h3 className="text-xl font-bold mb-4">Datos Generales</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
              className="w-full border p-2"
              required
            />
            <input
              type="email"
              placeholder="Confirmar Email"
              value={formData.emailConfirm}
              onChange={(e) => handleFormChange("emailConfirm", e.target.value)}
              className="w-full border p-2"
              required
            />
            <input
              type="text"
              placeholder="Nombre del equipo"
              value={formData.equipo}
              onChange={(e) => handleFormChange("equipo", e.target.value)}
              className="w-full border p-2"
              required
            />
            <select
              value={formData.idtorneo}
              onChange={(e) =>
                handleFormChange("idtorneo", parseInt(e.target.value))
              }
              className="w-full border p-2"
              required
            >
              <option value={0}>Seleccionar Torneo</option>
              {TORNEOS.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nombre}
                </option>
              ))}
            </select>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block"
            />
            {formData.foto && (
              <img
                src={formData.foto}
                alt="Preview"
                className="mt-4 max-w-xs rounded-md border"
              />
            )}
          </div>

          <div className="space-y-3">
            <h4 className="text-xl font-bold">Agregar Jugador</h4>
            <input
              placeholder="Apellido *"
              className="border p-2 w-full"
              value={nuevoJugador.apellido}
              onChange={(e) => handleJugadorChange("apellido", e.target.value)}
              required
            />
            <input
              placeholder="Nombre *"
              className="border p-2 w-full"
              value={nuevoJugador.nombres}
              onChange={(e) => handleJugadorChange("nombres", e.target.value)}
              required
            />
            <input
              placeholder="DNI *"
              className="border p-2 w-full"
              value={nuevoJugador.docnro}
              onChange={(e) => handleJugadorChange("docnro", e.target.value)}
              required
            />
            <input
              type="date"
              placeholder="Fecha de nacimiento *"
              className="border p-2 w-full"
              value={nuevoJugador.fhnacimiento}
              onChange={(e) =>
                handleJugadorChange("fhnacimiento", e.target.value)
              }
              required
            />
            <input
              placeholder="Teléfono *"
              className="border p-2 w-full"
              value={nuevoJugador.telefono}
              onChange={(e) => handleJugadorChange("telefono", e.target.value)}
              required
            />

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={nuevoJugador.capitan}
                  onChange={(e) =>
                    handleJugadorChange("capitan", e.target.checked)
                  }
                />
                Capitán
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={nuevoJugador.subcapitan}
                  onChange={(e) =>
                    handleJugadorChange("subcapitan", e.target.checked)
                  }
                />
                Subcapitán
              </label>
            </div>
            <button
              type="button"
              className="bg-blue-600 text-white px-4 py-2 rounded"
              onClick={agregarJugador}
            >
              Agregar jugador
            </button>
          </div>
        </div>

        {jugadores.length > 0 && (
          <div className="overflow-x-auto mt-6">
            <h4 className="font-bold mb-2">Jugadores Agregados</h4>
            <table className="min-w-full bg-white border">
              <thead className="bg-gray-100 text-left">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Apellido</th>
                  <th className="px-4 py-2">Nombre</th>
                  <th className="px-4 py-2">DNI</th>
                  <th className="px-4 py-2">Teléfono</th>
                  <th className="px-4 py-2">Camiseta</th>
                  <th className="px-4 py-2">C</th>
                  <th className="px-4 py-2">SC</th>
                  <th className="px-4 py-2">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {jugadores.map((j, i) => (
                  <tr key={i} className="border-t">
                    <td className="px-4 py-2">{j.orden}</td>
                    <td className="px-4 py-2">{j.apellido}</td>
                    <td className="px-4 py-2">{j.nombres}</td>
                    <td className="px-4 py-2">{j.docnro}</td>
                    <td className="px-4 py-2">{j.telefono}</td>
                    <td className="px-4 py-2 text-center">
                      {j.capitan ? "✔️" : ""}
                    </td>
                    <td className="px-4 py-2 text-center">
                      {j.subcapitan ? "✔️" : ""}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        type="button"
                        className="text-red-600"
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

        <button
          type="submit"
          className="w-full text-white rounded-md p-3 mt-6 bg-green-600"
        >
          Confirmar Inscripción
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
 */