import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import { EPublicRoutes } from "../models";
// import { useAuthProvider } from "../context";

const RecPassword: React.FC = () => {
  const navigate = useNavigate();

  const [isEmailValid, setIsEmailValid] = useState<{ msg: string } | null>(
    null
  );
  const [email, setEmail] = useState("");

  // const { actions, state } = useAuthProvider();

  const handleEmailChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(evt.target.value);
    setIsEmailValid(null); // Resetea el mensaje de error al cambiar el valor
  };

  const handlePasswordSubmit = (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (!email.includes("@")) {
      setIsEmailValid({ msg: "Por favor, introduce un correo válido." });
      return;
    }
    // actions.recPassword(email);
    console.log("Recuperar contraseña para:", email);
  };

  useEffect(() => {
    // Simula la redirección al recibir respuesta exitosa
    // if (state.status === 200) {
    //   navigate("/");
    // }
  }, [/* state.status */ navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Cambio de contraseña
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Email"
              className={`w-full pl-10 p-2 border rounded-md ${
                isEmailValid ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            {isEmailValid && (
              <p className="text-sm text-red-500 mt-1">{isEmailValid.msg}</p>
            )}
          </div>
          <div className="flex justify-between space-x-4">
            <button
              type="button"
              className="w-full bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600 transition"
            >
              <RouterLink to={EPublicRoutes.HOME}>Volver</RouterLink>
            </button>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            >
              <RouterLink to={EPublicRoutes.LOGIN}>Solicitar</RouterLink>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecPassword;
