import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import { FaKey, FaUserAlt } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logonew1 from "../assets/logonew1.png";
import login from "../assets/login.jpg";
import { EPublicRoutes } from "../models";
// import { useAuthProvider } from "../context";
// import { getLocalStorage } from "../utils";
// import { ELocalStorage, ESecureRoutes, IRedirect } from "../models";

const Login: React.FC = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordInvalid, setIsPasswordInvalid] = useState(false);
  const [role, setRole] = useState(""); // Nuevo estado para el rol seleccionado
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");

  // const { actions, state } = useAuthProvider();

  const handleShowPasswordClick = () => setShowPassword(!showPassword);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
    setIsPasswordInvalid(false);
  };

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPasswordInvalid(false);
    setUser(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPasswordInvalid(false);
    setPassword(e.target.value);
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) {
      setIsPasswordInvalid(true); // Muestra error si no se selecciona un rol
      return;
    }
    // actions.login({ username: user, password: password });
    console.log({ role, user, password }); // Debug para probar la lógica
  };

  useEffect(() => {
    // Si el usuario ya está autenticado, redirige al dashboard
    // if (state.isauthenticated) {
    //   const savedLocation: IRedirect | null = getLocalStorage(
    //     ELocalStorage.REDIRECT
    //   );
    //   navigate(savedLocation?.path || ESecureRoutes.DASHBOARD);
    // }
  }, [/* state.isauthenticated, */ navigate]);

  useEffect(
    () => {
      // Muestra error si hay algún mensaje de error en el estado global
      // if (state.error?.msg) {
      //   setIsPasswordInvalid(true);
      // }
    },
    [
      /* state.error */
    ]
  );

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${login})` }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-lg shadow-lg w-80 text-center">
        <h1 className="text-lg font-semibold text-gray-700 mb-4">
          Sistema de Gestión
        </h1>
        <img
          src={logonew1}
          alt="Logo NP Torneos"
          className="w-36 h-auto mx-auto mb-6"
        />
        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <select
            className={`w-full p-2 border rounded-md text-gray-700 bg-white ${
              isPasswordInvalid && !role ? "border-red-500" : "border-gray-300"
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            value={role}
            onChange={handleRoleChange}
            required
          >
            <option value="" disabled>
              Seleccionar perfil
            </option>
            <option value="administrador">ADMINISTRADOR</option>
            <option value="admin-web">ADMIN.WEB</option>
            <option value="staff">STAFF</option>
          </select>
          <div className="relative">
            <FaUserAlt className="absolute top-3 left-3 text-gray-400" />
            <input
              type="text"
              name="user"
              value={user}
              onChange={handleUserChange}
              placeholder="Usuario"
              className={`w-full pl-10 p-2 border rounded-md text-gray-700 ${
                isPasswordInvalid ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
          </div>
          <div className="relative">
            <FaKey className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Contraseña"
              className={`w-full pl-10 p-2 border rounded-md text-gray-700 ${
                isPasswordInvalid ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              required
            />
            <button
              type="button"
              onClick={handleShowPasswordClick}
              className="absolute top-3 right-3 text-gray-400"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-lg" />
              ) : (
                <AiOutlineEye className="text-lg" />
              )}
            </button>
          </div>
          {isPasswordInvalid && (
            <p className="text-red-500 text-sm">
              Todos los campos son obligatorios.
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            <RouterLink to={EPublicRoutes.SISTEMA}>Iniciar Sesión</RouterLink>
          </button>

          <div className="flex justify-between text-sm text-gray-500 mt-2">
            <label className="flex items-center">
              <input type="checkbox" className="mr-1" /> Recordar
            </label>

            <a href="#" className="text-blue-500 hover:underline">
              <RouterLink to={EPublicRoutes.REC_PASSWORD}>
                Olvido de clave
              </RouterLink>
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
