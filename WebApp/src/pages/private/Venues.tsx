import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../store";
import { Venue } from "../../types/venue";
import DataTable from "../../components/tables/DataTable";
import DynamicForm from "../../components/forms/DynamicForm";
import { PlusCircleIcon } from "@heroicons/react/20/solid";
import {
  fetchVenues,
  saveVenueThunk,
  removeVenue,
} from "../../store/slices/venueSlice";
import {
  Modal,
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import { venueColumns } from "../../components/tables";
import { useCrudForm } from "../../hooks/useCrudForm";

const Venues: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    venues = [],
    loading,
    error,
  } = useSelector((state: RootState) => state.venues);

  const {
    formData,
    isModalOpen,
    handleInputChange,
    handleOpenModal,
    handleCloseModal,
  } = useCrudForm<Venue>({
    name: "",
    address: "",
    postalCode: "",
    locality: "",
    province: "",
    phone: "",
    email: "",
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactCellphone: "",
    enabled: true,
    showMap: false,
    latitude: "",
    longitude: "",
    description: "",
    _id: "",
  });

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchVenues({ page: 1, limit: 10 })); // 🔥 Paginación
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { _id, ...venueData } = formData;
      await dispatch(saveVenueThunk(_id ? formData : venueData)).unwrap();
      dispatch(fetchVenues({ page: 1, limit: 10 })); // 🔥 Asegura actualización inmediata
      handleCloseModal();
    } catch (err) {
      console.error("Error al guardar sede:", err);
    }
  };

  const handleDelete = async (venue: Venue) => {
    await dispatch(removeVenue(venue._id)).unwrap();
    dispatch(fetchVenues({ page: 1, limit: 10 })); // 🔥 Asegura actualización inmediata
  };

  const handleSearch = () => {
    setSearchTerm(pendingSearchTerm);
  };

  // ✅ Asegura que filteredVenues siempre sea un array
  const filteredVenues = Array.isArray(venues)
    ? venues.filter((venue) =>
        venue.name?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-5xl">
        <PageHeader
          title="Sedes"
          actions={[
            {
              label: "Agregar Sede",
              onClick: () => handleOpenModal(),
              icon: <PlusCircleIcon className="h-5 w-5" />,
            },
          ]}
        />

        <SearchField
          placeholder="Buscar por nombre"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />

        <DataTable<Venue>
          columns={venueColumns}
          data={Array.isArray(filteredVenues) ? filteredVenues : []} // ✅ Evita pasar undefined
          onEdit={(row) => handleOpenModal(row as Venue)}
          onDelete={(row) => handleDelete(row as Venue)}
        />

        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={formData._id ? "Editar Sede" : "Crear Sede"}
        >
          <DynamicForm
            fields={[
              {
                name: "name",
                type: "text",
                placeholder: "Nombre",
                value: formData.name ?? "",
              },
              {
                name: "address",
                type: "text",
                placeholder: "Domicilio",
                value: formData.address ?? "",
              },
              {
                name: "postalCode",
                type: "text",
                placeholder: "Código Postal",
                value: formData.postalCode ?? "",
              },
              {
                name: "locality",
                type: "text",
                placeholder: "Localidad",
                value: formData.locality ?? "",
              },
              {
                name: "province",
                type: "text",
                placeholder: "Provincia",
                value: formData.province ?? "",
              },
              {
                name: "phone",
                type: "text",
                placeholder: "Teléfono",
                value: formData.phone ?? "",
              },
              {
                name: "email",
                type: "email",
                placeholder: "Email",
                value: formData.email ?? "",
              },
              {
                name: "contactName",
                type: "text",
                placeholder: "Nombre del Contacto",
                value: formData.contactName ?? "",
              },
              {
                name: "contactEmail",
                type: "email",
                placeholder: "Email del Contacto",
                value: formData.contactEmail ?? "",
              },
              {
                name: "contactPhone",
                type: "text",
                placeholder: "Teléfono del Contacto",
                value: formData.contactPhone ?? "",
              },
              {
                name: "contactCellphone",
                type: "text",
                placeholder: "Celular del Contacto",
                value: formData.contactCellphone ?? "",
              },
              {
                name: "showMap",
                type: "checkbox",
                label: "Mostrar en Mapa",
                value: formData.showMap ?? false,
              },
              {
                name: "latitude",
                type: "text",
                placeholder: "Latitud",
                value: formData.latitude ?? "",
              },
              {
                name: "longitude",
                type: "text",
                placeholder: "Longitud",
                value: formData.longitude ?? "",
              },
              {
                name: "description",
                type: "text",
                placeholder: "Descripción",
                value: formData.description ?? "",
              },
              {
                name: "enabled",
                type: "checkbox",
                label: "Habilitado",
                value: formData.enabled ?? false,
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

export default Venues;
