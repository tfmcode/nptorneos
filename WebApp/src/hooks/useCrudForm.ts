import React from "react";

export const useCrudForm = <T extends Record<string, unknown>>(
  initialState: T
) => {
  const [formData, setFormData] = React.useState<T>(initialState);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    let fieldValue: unknown = value;

    // ✅ Manejo de valores numéricos en selects
    if (type === "select-one") {
      fieldValue = isNaN(Number(value)) ? value : Number(value);
    }

    // ✅ Manejo de checkboxes para devolver `0 | 1` en lugar de `true | false`
    if (type === "checkbox" && e.target instanceof HTMLInputElement) {
      fieldValue = e.target.checked ? 1 : 0;
    }

    setFormData((prevData) => ({ ...prevData, [name]: fieldValue }));
  };

  const handleOpenModal = (data?: T) => {
    setFormData(
      data
        ? Object.keys(data).reduce((acc, key) => {
            let value = data[key];

            // ✅ Si el campo es una fecha, convertir a YYYY-MM-DD
            if (
              key.toLowerCase().includes("fecha") ||
              key.toLowerCase().includes("fhnacimiento")
            ) {
              if (typeof value === "string" || value instanceof Date) {
                const parsedDate = new Date(value);
                value = !isNaN(parsedDate.getTime())
                  ? parsedDate.toISOString().split("T")[0]
                  : "";
              }
            }

            return { ...acc, [key]: value };
          }, {} as T)
        : initialState
    );
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setFormData(initialState);
    setIsModalOpen(false);
  };

  return {
    formData,
    isModalOpen,
    setFormData,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  };
};
