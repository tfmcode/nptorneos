import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login } from "../store/slices/authSlice";
import { RootState, AppDispatch } from "../store";
import { useNavigate } from "react-router-dom";
import { FaKey, FaUserAlt } from "react-icons/fa";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import logonew1 from "../assets/logonew1.png";
import loginBg from "../assets/login.jpg";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null); // 🔥 Estado para errores locales

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  // 🔥 Si el usuario ya está autenticado, lo redirigimos a "/sistema"
  useEffect(() => {
    if (user) {
      navigate("/sistema");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null); // 🔥 Reseteamos errores previos

    try {
      const result = await dispatch(login({ email, password })).unwrap();
      if (result) {
        navigate("/sistema");
      }
    } catch (err) {
      setLocalError(err as string); // 🔥 Mostramos el error en pantalla
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: `url(${loginBg})` }}
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaUserAlt className="absolute top-3 left-3 text-gray-400" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Usuario"
              className="w-full pl-10 p-2 border rounded-md text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="relative">
            <FaKey className="absolute top-3 left-3 text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full pl-10 p-2 border rounded-md text-gray-700 border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute top-3 right-3 text-gray-400"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible className="text-lg" />
              ) : (
                <AiOutlineEye className="text-lg" />
              )}
            </button>
          </div>

          {/* 🔥 Mostramos errores tanto del backend como del frontend */}
          {(localError || error) && (
            <p className="text-red-500 text-sm">{localError || error}</p>
          )}

          <button
            type="submit"
            className={`w-full py-2 rounded-md text-white transition ${
              loading || !email || !password
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
            disabled={loading || !email || !password} // 🔥 Deshabilitar si los campos están vacíos
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
