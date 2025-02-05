import React from "react";

export const useCrudForm = <T extends Record<string, unknown>>(
  initialState: T
) => {
  const [formData, setFormData] = React.useState<T>(initialState);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    // Verifica si el target es un HTMLInputElement para usar `checked`.
    const fieldValue =
      type === "checkbox" && e.target instanceof HTMLInputElement
        ? e.target.checked
        : value;

    setFormData({ ...formData, [name]: fieldValue });
  };

  const handleOpenModal = (data?: T) => {
    setFormData(data || initialState);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData(initialState);
    setIsModalOpen(false);
  };

  return {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  };
};
