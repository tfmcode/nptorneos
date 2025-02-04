import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUsers,
  createOrUpdateUser,
  removeUser,
} from "../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../store";
import { User } from "../../api/userService";

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    _id: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    await dispatch(createOrUpdateUser(formData)).unwrap();
    await dispatch(fetchUsers()); // ✅ Recarga la lista de usuarios inmediatamente
    setIsModalOpen(false);
  };

  const handleEditUser = (user: User) => {
    setFormData({
      name: user.name || "",
      email: user.email || "",
      password: user.password || "", // No mostramos la contraseña por seguridad
      _id: user._id || "",
    });
    setIsModalOpen(true);
  };

  const filteredUsers = searchTerm
    ? users.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  return (
    <div className="p-6 bg-gray-100 h-screen flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-700">Usuarios</h2>
          <button
            onClick={() => {
              setFormData({ name: "", email: "", password: "", _id: "" });
              setIsModalOpen(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            +
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg p-2 w-full mb-6"
        />

        {loading && <p className="text-gray-500 mb-4">Cargando...</p>}
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {/* Tabla con scroll y tamaño reducido */}
        <div className="overflow-auto max-h-80">
          <table className="min-w-full bg-white border rounded text-sm">
            <thead className="bg-gray-200 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left">Nombre</th>
                <th className="px-4 py-2 text-left">Email</th>
                <th className="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user, index) => (
                <tr key={user._id || index} className="border-t">
                  <td className="px-4 py-2">{user.name || "Sin nombre"}</td>
                  <td className="px-4 py-2">{user.email || "Sin email"}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => dispatch(removeUser(user._id))}
                      className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              X
            </button>
            <h3 className="text-lg font-bold mb-4">
              {formData._id ? "Editar Usuario" : "Agregar Usuario"}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="border p-2 rounded"
                />
              </div>
              <button
                type="submit"
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
              >
                {formData._id ? "Actualizar Usuario" : "Crear Usuario"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
