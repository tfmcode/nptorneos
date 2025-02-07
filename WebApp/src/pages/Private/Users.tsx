import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { User } from "../../types/user";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchUsers,
  createOrUpdateUser,
  removeUser,
} from "../../store/slices/userSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { userColumns } from "../../components/tables";
import { useCrudForm } from "../../components/hooks/useCrudForm";

const Users: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<User>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "admin",
    enabled: true,
    _id: "",
  });

  const [searchTerm, setSearchTerm] = React.useState("");

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { ...userData } = formData; // Quita `_id` en caso de ser una creación
    await dispatch(createOrUpdateUser(userData)).unwrap();

    handleCloseModal();
  };

  const filteredUsers = users.filter(
    (user) =>
      `${user.firstName} ${user.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-4xl">
        <PageHeader
          title="Usuarios"
          actions={[
            {
              label: "Agregar Usuario",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por nombre o email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<User>
          columns={userColumns}
          data={filteredUsers}
          onEdit={(row) => handleOpenModal(row as User)}
          onDelete={(row) => dispatch(removeUser((row as User)._id))}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData._id ? "Editar Usuario" : "Crear Usuario"}
        >
          <DynamicForm
            fields={[
              {
                name: "firstName",
                type: "text",
                placeholder: "Nombre",
                value: formData.firstName,
              },
              {
                name: "lastName",
                type: "text",
                placeholder: "Apellido",
                value: formData.lastName,
              },
              {
                name: "email",
                type: "email",
                placeholder: "Email",
                value: formData.email,
              },
              {
                name: "password",
                type: "password",
                placeholder: "Contraseña",
                value: formData.password,
              },
              {
                name: "role",
                type: "select",
                options: [
                  { label: "Admin", value: "admin" },
                  { label: "Staff", value: "staff" },
                  { label: "User", value: "user" },
                ],
                value: formData.role,
              },
              {
                name: "enabled",
                type: "checkbox",
                label: "Habilitado",
                value: formData.enabled,
              },
            ]}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            submitLabel="Guardar"
          />
        </Modal>
      </div>
    </div>
  );
};

export default Users;
