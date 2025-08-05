import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Usuario } from "../../types/usuario";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchUsuarios,
  saveUsuarioThunk,
  removeUsuario,
} from "../../store/slices/usuarioSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
  PopupNotificacion,
} from "../../components/common";
import { useCrudForm } from "../../hooks/useCrudForm";
import { usuarioColumns } from "../../components/tables";

const Usuarios: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { usuarios, loading, error } = useSelector(
    (state: RootState) => state.usuarios
  );

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Usuario>({
    nombre: "",
    apellido: "",
    email: "",
    contrasenia: "",
    perfil: 1,
    habilitado: 1,
    idusuario: undefined,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [pendingSearchTerm, setPendingSearchTerm] = useState("");

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

  useEffect(() => {
    if (!usuarios.length) {
      dispatch(fetchUsuarios());
    }
  }, [dispatch, usuarios.length]);

  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errores: string[] = [];

    if (!formData.nombre?.trim()) errores.push("• Ingresar el nombre");
    if (!formData.apellido?.trim()) errores.push("• Ingresar el apellido");
    if (!formData.email?.trim()) errores.push("• Ingresar el email");

    if (!formData.idusuario && !formData.contrasenia?.trim()) {
      errores.push("• Ingresar una contraseña");
    }

    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const { idusuario, contrasenia = "", ...usuarioData } = formData;

      const perfilNumero: 1 | 2 | 3 = [1, 2, 3].includes(
        Number(usuarioData.perfil)
      )
        ? (Number(usuarioData.perfil) as 1 | 2 | 3)
        : 1;

      const habilitadoNumero: 0 | 1 = usuarioData.habilitado ? 1 : 0;

      await dispatch(
        saveUsuarioThunk({
          ...usuarioData,
          contrasenia: contrasenia.trim() || undefined,
          perfil: perfilNumero,
          habilitado: habilitadoNumero,
          idusuario,
        })
      ).unwrap();

      dispatch(fetchUsuarios());
      handleCloseModal();
      showPopup("success", "Usuario guardado correctamente");
    } catch (err) {
      console.error("❌ Error al guardar usuario:", err);
      showPopup("error", "Error al guardar el usuario");
    }
  };

  const handleDelete = async (usuario: Usuario) => {
    try {
      await dispatch(removeUsuario(usuario.idusuario!)).unwrap();
      dispatch(fetchUsuarios());
    } catch (error) {
      console.error("❌ Error al eliminar usuario:", error);
      showPopup("error", "Error al eliminar usuario");
    }
  };

  const filteredUsuarios = searchTerm
    ? usuarios.filter(
        (usuario) =>
          `${usuario.nombre} ${usuario.apellido}`
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : usuarios;

  return (
    <div className="flex justify-center items-center">
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
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Usuario>
          columns={usuarioColumns}
          data={filteredUsuarios}
          onEdit={(row) => row && handleOpenModal(row as Usuario)}
          onDelete={(row) => row && handleDelete(row as Usuario)}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData.idusuario ? "Editar Usuario" : "Crear Usuario"}
        >
          <DynamicForm
            fields={[
              {
                name: "nombre",
                type: "text",
                placeholder: "Nombre",
                value: formData.nombre,
              },
              {
                name: "apellido",
                type: "text",
                placeholder: "Apellido",
                value: formData.apellido,
              },
              {
                name: "email",
                type: "email",
                placeholder: "Email",
                value: formData.email,
              },
              {
                name: "contrasenia",
                type: "password",
                placeholder: "Contraseña",
                value: formData.contrasenia ?? "",
              },
              {
                name: "perfil",
                type: "select",
                options: [
                  { label: "Admin", value: 1 },
                  { label: "Staff", value: 2 },
                  { label: "User", value: 3 },
                ],
                value: formData.perfil ?? 1,
              },
              {
                name: "habilitado",
                type: "checkbox",
                label: "Habilitado",
                value: Boolean(formData.habilitado),
              },
            ]}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            submitLabel="Guardar"
          />

          <PopupNotificacion
            open={popup.open}
            type={popup.type}
            message={popup.message}
            onClose={() => setPopup({ ...popup, open: false })}
          />
        </Modal>
      </div>
    </div>
  );
};

export default Usuarios;
