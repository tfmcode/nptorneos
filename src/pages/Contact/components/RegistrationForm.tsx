import React, { useState } from "react";

const RegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    emailConfirm: "",
    teamName: "",
    tournament: "",
    logo: "",
    playerFirstName: "",
    playerLastName: "",
    dni: "",
    birthdate: "",
    phone: "",
    shirtNumber: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const reader = new FileReader();

      reader.readAsDataURL(event.target.files[0]);
    }
  };
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
      <form className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Datos Generales */}
          <div>
            <h3 className="text-xl font-bold mb-4">Datos Generales</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block font-bold mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                  placeholder="Ingresa tu correo electrónico"
                />
              </div>
              <div>
                <label htmlFor="emailConfirm" className="block font-bold mb-1">
                  Confirmar Email
                </label>
                <input
                  type="email"
                  id="emailConfirm"
                  value={formData.emailConfirm}
                  onChange={(e) => handleChange("emailConfirm", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                  placeholder="Confirma tu correo electrónico"
                />
              </div>
              <div>
                <label htmlFor="teamName" className="block font-bold mb-1">
                  Nombre del Equipo
                </label>
                <input
                  type="text"
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) => handleChange("teamName", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                  placeholder="Ingresa el nombre del equipo"
                />
              </div>
              <div>
                <label htmlFor="tournament" className="block font-bold mb-1">
                  Torneo
                </label>
                <select
                  id="tournament"
                  value={formData.tournament}
                  onChange={(e) => handleChange("tournament", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                >
                  <option value="" disabled>
                    Seleccionar Torneo
                  </option>
                  <option value="Futbol5">Fútbol 5</option>
                  <option value="Futbol6">Fútbol 6</option>
                  <option value="Futbol8">Fútbol 8</option>
                  <option value="Futbol11">Fútbol 11</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Sub17">Sub 17</option>
                </select>
              </div>
              <div>
                <label htmlFor="logo" className="block font-bold mb-1">
                  Subir Logo del Equipo
                </label>
                <input
                  type="file"
                  id="logo"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block"
                />
                {formData.logo && (
                  <img
                    src={formData.logo}
                    alt="Preview"
                    className="mt-4 max-w-xs rounded-md border"
                  />
                )}
              </div>
            </div>
          </div>

          {/* Lista de Buena Fe */}
          <div>
            <h4 className="text-xl font-bold mb-4">Lista de Buena Fe</h4>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="playerFirstName"
                  className="block font-bold mb-1"
                >
                  Nombre del Jugador
                </label>
                <input
                  type="text"
                  id="playerFirstName"
                  value={formData.playerFirstName}
                  onChange={(e) =>
                    handleChange("playerFirstName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                  placeholder="Nombre del jugador"
                />
              </div>
              <div>
                <label
                  htmlFor="playerLastName"
                  className="block font-bold mb-1"
                >
                  Apellido del Jugador
                </label>
                <input
                  type="text"
                  id="playerLastName"
                  value={formData.playerLastName}
                  onChange={(e) =>
                    handleChange("playerLastName", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                  placeholder="Apellido del jugador"
                />
              </div>
              <div>
                <label htmlFor="dni" className="block font-bold mb-1">
                  DNI
                </label>
                <input
                  type="text"
                  id="dni"
                  value={formData.dni}
                  onChange={(e) => handleChange("dni", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                  placeholder="DNI"
                />
              </div>
              <div>
                <label htmlFor="birthdate" className="block font-bold mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  id="birthdate"
                  value={formData.birthdate}
                  onChange={(e) => handleChange("birthdate", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block font-bold mb-1">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                  placeholder="Teléfono del jugador"
                />
              </div>
              <div>
                <label htmlFor="shirtNumber" className="block font-bold mb-1">
                  Nro de Camiseta
                </label>
                <select
                  id="shirtNumber"
                  value={formData.shirtNumber}
                  onChange={(e) => handleChange("shirtNumber", e.target.value)}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring focus:ring-indigo-400"
                >
                  <option value="" disabled>
                    Seleccionar Nro
                  </option>
                  {Array.from({ length: 99 }, (_, i) => i + 1).map((num) => (
                    <option key={num} value={num}>
                      {num}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full text-white rounded-md p-3 mt-6"
          style={{ background: "#343a40" }}
        >
          Confirmar Inscripción
        </button>
      </form>
    </div>
  );
};

export default RegistrationForm;
