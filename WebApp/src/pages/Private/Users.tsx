import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchUsers,
  createOrUpdateUser,
  removeUser,
} from "../../store/slices/userSlice";
import { RootState, AppDispatch } from "../../store";
import { User } from "../../types/user";
import DataTable from "../../components/tables/DataTable";
import Modal from "../../components/modals/Modal";
import InputField from "../../components/forms/InputField";

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
    await dispatch(createOrUpdateUser(formData)).unwrap();
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: "", email: "", password: "", _id: "" });
  };

  const handleCreateUser = () => {
    setFormData({ name: "", email: "", password: "", _id: "" });
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setFormData(user);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { header: "Nombre", accessor: "name" as keyof User },
    { header: "Email", accessor: "email" as keyof User },
  ];

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-700">Usuarios</h2>
          <button
            onClick={handleCreateUser}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            + Crear Usuario
          </button>
        </div>

        <input
          type="text"
          placeholder="Buscar por nombre o email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="mb-4 p-2 border rounded w-full"
        />

        {loading && (
          <p className="text-gray-500 text-center mb-4">Cargando...</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <DataTable<User>
          columns={columns}
          data={filteredUsers}
          onEdit={(row) => handleEditUser(row as User)}
          onDelete={(row) => dispatch(removeUser((row as User)._id))}
        />
      </div>

      {/* Modal para Crear/Editar Usuario */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={formData._id ? "Editar Usuario" : "Crear Usuario"}
      >
        <form onSubmit={handleSubmit}>
          <InputField
            name="name"
            type="text"
            placeholder="Nombre"
            value={formData.name}
            onChange={handleInputChange}
          />
          <InputField
            name="email"
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
          />
          <InputField
            name="password"
            type="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleInputChange}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white mt-4 p-2 rounded hover:bg-blue-700 w-full"
          >
            Guardar
          </button>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
