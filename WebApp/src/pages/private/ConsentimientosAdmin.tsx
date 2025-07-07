import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchConsentimientos,
  removeConsentimiento,
} from "../../store/slices/consentimientoSlice";
import { Consentimiento } from "../../types/consentimientos";
import DataTable from "../../components/tables/DataTable";
import {
  PageHeader,
  StatusMessage,
  SearchField,
} from "../../components/common";
import jsPDF from "jspdf";
import { consentimientoColumns } from "../../components/tables/columns";

const ConsentimientosAdmin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const {
    consentimientos = [],
    loading,
    error,
    page,
    limit,
    total,
  } = useSelector((state: RootState) => state.consentimientos);

  const [pendingSearchTerm, setPendingSearchTerm] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchConsentimientos({ page, limit, searchTerm }));
  }, [dispatch, page, limit, searchTerm]);

  const handleSearch = () => {
    dispatch(
      fetchConsentimientos({ page: 1, limit, searchTerm: pendingSearchTerm })
    );
    setSearchTerm(pendingSearchTerm);
  };

  const handleDelete = async (consentimiento: Consentimiento) => {
    if (confirm("¿Estás seguro de eliminar este consentimiento?")) {
      await dispatch(removeConsentimiento(consentimiento.id!)).unwrap();
      dispatch(fetchConsentimientos({ page, limit, searchTerm }));
    }
  };

  const handlePrint = (consentimiento: Consentimiento) => {
    const doc = new jsPDF();
    doc.setFontSize(16).text("CONSENTIMIENTO INFORMADO", 70, 20);
    doc.setFontSize(12);

    const fields = [
      `Apellido y Nombre: ${consentimiento.apellido ?? ""} ${
        consentimiento.nombres ?? ""
      }`,
      `DNI: ${consentimiento.docnro}`,
      `Fecha de Nacimiento: ${consentimiento.fechanac ?? ""}`,
      `Domicilio: ${consentimiento.domicilio ?? ""}`,
      `Teléfono: ${consentimiento.telefono ?? ""}`,
      `Obra Social: ${consentimiento.obrasocial ?? ""}`,
      `Facebook: ${consentimiento.facebook ?? ""}`,
      `Contacto: ${consentimiento.nombrecto ?? ""} - ${
        consentimiento.relacioncto ?? ""
      } - ${consentimiento.telefonocto ?? ""}`,
      `Fecha de carga: ${consentimiento.fhcarga?.substring(0, 10) ?? ""}`,
    ];

    fields.forEach((line, idx) => {
      doc.text(line, 20, 40 + idx * 8);
    });

    doc.save(`Consentimiento_${consentimiento.docnro}.pdf`);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <PageHeader title="Consentimientos" />

        <SearchField
          placeholder="Buscar por apellido o nombre"
          value={pendingSearchTerm}
          onChange={(e) => setPendingSearchTerm(e.target.value)}
          onSearch={handleSearch}
        />

        <StatusMessage loading={loading} error={error} />
        <DataTable<Consentimiento>
          columns={[
            ...consentimientoColumns,
            {
              header: "Acciones",
              render: (consentimiento: Consentimiento) => (
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePrint(consentimiento)}
                    className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600"
                  >
                    Imprimir
                  </button>
                </div>
              ),
            },
          ]}
          data={consentimientos ?? []}
          onDelete={(row) => handleDelete(row as Consentimiento)}

        />

        <div className="flex justify-between items-center mt-4">
          <button
            disabled={page === 1}
            onClick={() =>
              dispatch(
                fetchConsentimientos({ page: page - 1, limit, searchTerm })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.max(1, Math.ceil(total / limit))}
          </span>
          <button
            disabled={!consentimientos || consentimientos.length < limit}
            onClick={() =>
              dispatch(
                fetchConsentimientos({ page: page + 1, limit, searchTerm })
              )
            }
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConsentimientosAdmin;
