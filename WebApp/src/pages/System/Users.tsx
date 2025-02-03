import React, { useState, useEffect } from "react";
import {
  createUser,
  getUsers,
  deleteUser,
  updateUser,
  User,
  UserInput,
} from "../../services/userService";

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<UserInput & { _id?: string }>({
    name: "",
    email: "",
    password: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers();
      setUsers(data);
      setError(""); // Limpiar errores previos
    } catch {
      setError("Error al obtener usuarios.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCreateOrUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (formData._id) {
        const updatedUser = await updateUser(formData._id, formData);
        setUsers((prevUsers) =>
          prevUsers.map((user) =>
            user._id === formData._id ? { ...user, ...updatedUser } : user
          )
        );
      } else {
        const newUser = await createUser(formData);
        setUsers((prevUsers) => [...prevUsers, newUser]);
      }
      setFormData({ name: "", email: "", password: "" });
      setIsModalOpen(false);
      setError(""); // Limpiar errores previos
    } catch {
      setError("Error al crear o actualizar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      setLoading(true);
      await deleteUser(id);
      setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
      setError(""); // Limpiar errores previos
    } catch {
      setError("Error al eliminar el usuario.");
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (user: User) => {
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-100 h-screen flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-700">Usuarios</h2>
          </div>
          <button
            onClick={() => {
              setFormData({ name: "", email: "", password: "" });
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
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">{user.email}</td>
                  <td className="px-4 py-2 text-right">
                    <button
                      onClick={() => handleEditUser(user)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded mr-2 hover:bg-yellow-600"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user._id)}
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
            <form onSubmit={handleCreateOrUpdateUser}>
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
