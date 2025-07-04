// src/pages/public/Concents.tsx

import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import { Sede } from "../../../types/sede";
import { Equipo } from "../../../types/equipos";
import { getSedes } from "../../../api/sedesService";
import { getEquipos } from "../../../api/equiposService";
import API from "../../../api/httpClient"; 

const Concents: React.FC = () => {
  const [formData, setFormData] = useState({
    apellido: "",
    nombres: "",
    docnro: "",
    fechanac: "",
    domicilio: "",
    telefono: "",
    obrasocial: "",
    facebook: "",
    idequipo: "",
    codtipo: "",
    idsede: "",
    nombrecto: "",
    relacioncto: "",
    telefonocto: "",
  });

  const [sedes, setSedes] = useState<Sede[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [sedesData, equiposData] = await Promise.all([
          getSedes(),
          getEquipos(1, 1000, ""),
        ]);
        setSedes(sedesData ?? []);
        setEquipos(equiposData.equipos ?? []);
      } catch (error) {
        console.error("❌ Error cargando sedes o equipos:", error);
      }
    };
    loadData();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    const requiredFields = [
      "apellido",
      "nombres",
      "docnro",
      "fechanac",
      "domicilio",
      "telefono",
      "obrasocial",
      "idequipo",
      "codtipo",
      "idsede",
      "nombrecto",
      "relacioncto",
      "telefonocto",
    ];
    for (const field of requiredFields) {
      if (!formData[field as keyof typeof formData]) {
        setMessage(`El campo ${field} es obligatorio.`);
        return false;
      }
    }
    return true;
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16).text("CONSENTIMIENTO INFORMADO", 60, 20);

    const addSectionTitle = (text: string, y: number) => {
      doc.setFillColor(231, 229, 229);
      doc.rect(20, y - 7, 170, 10, "F");
      doc.setFontSize(12).text(text, 25, y);
    };

    addSectionTitle("DATOS PERSONALES", 40);
    const lines = [
      `Apellido y Nombre: ${formData.apellido} ${formData.nombres}`,
      `DNI: ${formData.docnro}`,
      `Fecha de Nacimiento: ${formData.fechanac}`,
      `Domicilio: ${formData.domicilio}`,
      `Teléfono: ${formData.telefono}`,
      `Obra Social: ${formData.obrasocial}`,
      `Facebook: ${formData.facebook || "N/A"}`,
    ];
    lines.forEach((line, idx) => doc.text(line, 20, 50 + idx * 8));

    addSectionTitle("DATOS DEL EQUIPO", 110);
    doc.text(`Equipo: ${formData.idequipo}`, 20, 120);
    doc.text(`Tipo Torneo: ${formData.codtipo}`, 20, 128);
    doc.text(`Sede: ${formData.idsede}`, 20, 136);

    addSectionTitle("CONTACTO DE EMERGENCIA", 150);
    doc.text(`Nombre: ${formData.nombrecto}`, 20, 160);
    doc.text(`Relación: ${formData.relacioncto}`, 20, 168);
    doc.text(`Teléfono: ${formData.telefonocto}`, 20, 176);

    doc.save(`Consentimiento_${formData.apellido}_${formData.nombres}.pdf`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setMessage(null);

    try {
      await API.post("/api/consentimientos", {
        apellido: formData.apellido,
        nombres: formData.nombres,
        docnro: parseInt(formData.docnro),
        fechanac: formData.fechanac,
        domicilio: formData.domicilio,
        telefono: formData.telefono,
        obrasocial: formData.obrasocial,
        facebook: formData.facebook,
        idequipo: parseInt(formData.idequipo),
        codtipo: parseInt(formData.codtipo),
        idsede: parseInt(formData.idsede),
        nombrecto: formData.nombrecto,
        relacioncto: formData.relacioncto,
        telefonocto: formData.telefonocto,
      });

      setMessage("✅ Consentimiento enviado correctamente.");
      generatePDF();
      setFormData({
        apellido: "",
        nombres: "",
        docnro: "",
        fechanac: "",
        domicilio: "",
        telefono: "",
        obrasocial: "",
        facebook: "",
        idequipo: "",
        codtipo: "",
        idsede: "",
        nombrecto: "",
        relacioncto: "",
        telefonocto: "",
      });
    } catch (error) {
      console.error("❌ Error al enviar consentimiento:", error);
      setMessage("❌ Error al enviar consentimiento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center text-3xl font-bold uppercase mb-8">
        Consentimiento Informado
      </h1>

      {message && (
        <div
          className={`text-center mb-4 text-sm px-4 py-2 rounded ${
            message.startsWith("✅")
              ? "bg-green-500 text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* DATOS PERSONALES */}
        <fieldset className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <legend className="text-xl font-semibold mb-4">
            Datos Personales
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: "Apellido*", field: "apellido" },
              { label: "Nombre*", field: "nombres" },
              { label: "DNI*", field: "docnro", type: "number" },
              { label: "Fecha de Nacimiento*", field: "fechanac", type: "date" },
              { label: "Domicilio*", field: "domicilio" },
              { label: "Teléfono*", field: "telefono" },
              { label: "Obra Social*", field: "obrasocial" },
              { label: "Facebook", field: "facebook" },
            ].map((input) => (
              <div key={input.field}>
                <label className="block text-sm mb-1">{input.label}</label>
                <input
                  type={input.type || "text"}
                  value={formData[input.field as keyof typeof formData]}
                  onChange={(e) => handleChange(input.field, e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required={input.label.endsWith("*")}
                />
              </div>
            ))}
          </div>
        </fieldset>

        {/* DATOS EQUIPO */}
        <fieldset className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <legend className="text-xl font-semibold mb-4">
            Datos del Equipo
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Equipo*</label>
              <select
                value={formData.idequipo}
                onChange={(e) => handleChange("idequipo", e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar equipo</option>
                {equipos.map((eq) => (
                  <option key={eq.id} value={eq.nombre}>
                    {eq.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Tipo Torneo*</label>
              <input
                type="number"
                value={formData.codtipo}
                onChange={(e) => handleChange("codtipo", e.target.value)}
                className="w-full border rounded px-3 py-2"
                placeholder="Código tipo torneo"
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Sede*</label>
              <select
                value={formData.idsede}
                onChange={(e) => handleChange("idsede", e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
              >
                <option value="">Seleccionar sede</option>
                {sedes.map((sede) => (
                  <option key={sede.id} value={sede.nombre}>
                    {sede.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        {/* CONTACTO DE EMERGENCIA */}
        <fieldset className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <legend className="text-xl font-semibold mb-4">
            Contacto de Emergencia
          </legend>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Nombre*", field: "nombrecto" },
              { label: "Relación*", field: "relacioncto" },
              { label: "Teléfono*", field: "telefonocto" },
            ].map((input) => (
              <div key={input.field}>
                <label className="block text-sm mb-1">{input.label}</label>
                <input
                  type="text"
                  value={formData[input.field as keyof typeof formData]}
                  onChange={(e) => handleChange(input.field, e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white font-semibold px-8 py-4 rounded hover:bg-blue-700 transition ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Enviando..." : "Confirmar Consentimiento y Descargar PDF"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Concents;
