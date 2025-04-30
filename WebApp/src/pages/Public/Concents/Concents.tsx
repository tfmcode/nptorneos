import React, { useState } from "react";
import jsPDF from "jspdf";

const Concents: React.FC = () => {
  const [formData, setFormData] = useState({
    apellido: "",
    nombre: "",
    documento: "",
    fechaNacimiento: "",
    domicilio: "",
    telefono: "",
    obraSocial: "",
    facebook: "",
    equipo: "",
    tipoTorneo: "",
    sede: "",
    urgenciaNombre: "",
    urgenciaRelacion: "",
    urgenciaTelefono: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("CONSENTIMIENTO INFORMADO", 70, 20);

    const addSectionTitle = (text: string, y: number) => {
      doc.setFillColor(231, 229, 229); 
      doc.rect(20, y - 7, 170, 10, "F"); 
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(text, 25, y);
    };

    addSectionTitle("DATOS PERSONALES", 40);
    doc.setFont("helvetica", "normal");
    doc.text(
      `Apellido y Nombre: ${formData.apellido} ${formData.nombre}`,
      20,
      50
    );
    doc.text(`D.N.I: ${formData.documento}`, 20, 60);
    doc.text(`Fecha de Nacimiento: ${formData.fechaNacimiento}`, 20, 70);
    doc.text(`Domicilio: ${formData.domicilio}`, 20, 80);
    doc.text(`Teléfono: ${formData.telefono}`, 20, 90);
    doc.text(`Obra Social: ${formData.obraSocial}`, 20, 100);
    doc.text(`Facebook: ${formData.facebook || "N/A"}`, 20, 110);

    addSectionTitle("DATOS EQUIPO", 130);
    doc.text(`Equipo: ${formData.equipo}`, 20, 140);
    doc.text(`Tipo Torneo: ${formData.tipoTorneo}`, 20, 150);
    doc.text(`Sede: ${formData.sede}`, 20, 160);

    addSectionTitle("EN CASO DE URGENCIA AVISAR A:", 180);
    doc.text(`Apellido y Nombre: ${formData.urgenciaNombre}`, 20, 190);
    doc.text(`Relación / Parentesco: ${formData.urgenciaRelacion}`, 20, 200);
    doc.text(`Teléfono: ${formData.urgenciaTelefono}`, 20, 210);

    // Consentimiento general
    let y = 230; 
    const content = [
      "Por medio de la presente NP TORNEOS informa a todos los participantes sobre los riesgos de la actividad deportiva a la que se exponen y aceptan de conformidad.",
      "",
      "¿Qué es el consentimiento libre e informado?",
      "El consentimiento informado es el asentimiento por parte del participante o sus representantes legales, en caso de ser menor de edad, para realizar una determinada actividad física y/o deportiva, habiendo recibido información clara, precisa y adecuada respecto de los perjuicios que ello significa para su salud; así como respecto de las medidas que se recomiendan para reducir la probabilidad a sufrir lesiones y/o daños por la práctica de las actividades mencionadas, y para las mismas encontrarse en condiciones de poder tomar una decisión libre, racional y voluntaria respecto a su participación, asumiendo su responsabilidad por los daños que pudieran llegar a sufrir.",
      "",
      "1. Riesgos y responsabilidad sobre la salud para realizar actividad",
      "La práctica de actividades físicas y/o deportivas, amateur o de carácter mediano o alto rendimiento, implica la posibilidad de estar expuestos a sufrir lesiones, fracturas y/o daños en la salud, situaciones propias de la actividad, y hasta incluso la muerte producto de muerte súbita, infartos, entre otros.",
      "Por ello, es importante realizar un control médico anual antes de iniciar las actividades físicas o deportivas, con el objetivo de evaluar si el deportista está en condiciones físicas y/o psíquicas de realizar actividades deportivas.",
      "La realización del apto físico corre por cuenta exclusiva de cada participante, siendo el mismo quien asume el riesgo por la falta del mismo. El hecho de participar en el campeonato presume el reconocimiento de encontrarse en perfecto estado de salud para la práctica del deporte.",
      "",
      "A continuación, se recomiendan medidas para reducir la exposición a sufrir lesiones y/o daños:",
      "• Indumentaria. Una adecuada indumentaria constituye un factor de seguridad, evitando posibles lesiones y molestias, potenciando a mejorar el rendimiento.",
      "• Hidratación. Durante el ejercicio la pérdida de agua corporal es importante. Es importante mantener una buena hidratación para reponer los líquidos.",
      "• Progresión. Las personas que no tengan una adecuada preparación física tienen más probabilidades de padecer lesiones.",
      "• Calentamiento. Los ejercicios de calentamiento y estiramiento son imprescindibles antes de la actividad física.",
      "• Enfriamiento. Después de la actividad, se deben realizar ejercicios de enfriamiento para volver a la situación de reposo en forma paulatina.",
      "",
      "YO, " +
        `${formData.nombre} ${formData.apellido}` +
        ", con Documento Nacional de Identidad Nro. " +
        `${formData.documento}` +
        ", entiendo que la actividad física/deportiva a practicar implica la posibilidad de sufrir lesiones y/o riesgos, según fui informado en detalle por parte de NP TORNEOS.",
      "",
      "Por consiguiente, asumo que:",
      "1.- He realizado el apto médico para la realización de tal actividad física/deportiva y que carezco de contraindicación médica alguna.",
      "2.- Conozco y entiendo el reglamento deportivo y estoy plenamente conforme con las reglas del mismo, comprometiéndome a actuar conforme a él.",
      "3.- Asumo voluntariamente los riesgos de la actividad y, en consecuencia, eximo a NP TORNEOS de cualquier daño o perjuicio que pueda sufrir y/o a ocasionar en el desarrollo normal de la actividad. Tal exención no comprende los daños y perjuicios que sean consecuencia de culpa o negligencia de NP TORNEOS.",
    ];

    content.forEach((line) => {
      const lines = doc.splitTextToSize(line, 170);
      doc.text(lines, 20, y);
      y += lines.length * 10;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    });

    // Firma del representante legal
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.text(
      "LUGAR Y FECHA: ................................................",
      20,
      y + 10
    );
    doc.text(
      "FIRMA DEL PARTICIPANTE: .....................................",
      20,
      y + 20
    );
    doc.text(
      "FIRMA DEL REPRESENTANTE LEGAL: ....................................",
      20,
      y + 30
    );
    doc.text(
      "ACARACIÓN: ..................................................",
      20,
      y + 40
    );
    doc.text(
      "D.N.I: ............................................................",
      20,
      y + 50
    );

    doc.save(`Consentimiento_${formData.apellido}.pdf`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-center text-3xl font-bold uppercase mb-8">
        Consentimiento Informado
      </h1>

      <form className="space-y-10">
        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <fieldset className="border border-gray-300 rounded-lg p-6 shadow-md">
            <legend className="text-xl font-semibold bg-gray-300 px-4 py-2 rounded">
              Datos Personales
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
              {[
                { label: "Apellido*", field: "apellido", type: "text" },
                { label: "Nombre*", field: "nombre", type: "text" },
                { label: "Documento*", field: "documento", type: "text" },
                {
                  label: "Fecha de Nacimiento*",
                  field: "fechaNacimiento",
                  type: "date",
                },
                { label: "Domicilio*", field: "domicilio", type: "text" },
                {
                  label: "Teléfono y/o móvil*",
                  field: "telefono",
                  type: "tel",
                },
                {
                  label: "Obra Social / Prepaga*",
                  field: "obraSocial",
                  type: "text",
                },
                { label: "Facebook", field: "facebook", type: "text" },
              ].map((input) => (
                <div key={input.field}>
                  <label
                    className="block text-lg font-medium text-gray-800 mb-1"
                    htmlFor={input.field}
                  >
                    {input.label}
                  </label>
                  <input
                    id={input.field}
                    type={input.type}
                    value={formData[input.field as keyof typeof formData]}
                    onChange={(e) => handleChange(input.field, e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Ingrese ${input.label.toLowerCase()}`}
                    required
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <fieldset className="border border-gray-300 rounded-lg p-6 shadow-md">
            <legend className="text-xl font-semibold bg-gray-300 px-4 py-2 rounded">
              Datos Equipo
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {[
                { label: "Equipo*", field: "equipo" },
                { label: "Tipo Torneo*", field: "tipoTorneo" },
                { label: "Sede*", field: "sede" },
              ].map((select) => (
                <div key={select.field}>
                  <label
                    htmlFor={select.field}
                    className="block text-lg font-medium text-gray-800 mb-1"
                  >
                    {select.label}
                  </label>
                  <select
                    id={select.field}
                    value={formData[select.field as keyof typeof formData]}
                    onChange={(e) => handleChange(select.field, e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="" disabled>
                      Seleccionar
                    </option>
                    <option value="opcion1">Opción 1</option>
                    <option value="opcion2">Opción 2</option>
                  </select>
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="bg-gray-100 p-6 rounded-lg shadow-lg">
          <fieldset className="border border-gray-300 rounded-lg p-6 shadow-md">
            <legend className="text-xl font-semibold bg-gray-300 px-4 py-2 rounded">
              En caso de urgencia avisar a:
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
              {[
                {
                  label: "Apellido y Nombres*",
                  field: "urgenciaNombre",
                  type: "text",
                },
                {
                  label: "Relación / Parentesco*",
                  field: "urgenciaRelacion",
                  type: "text",
                },
                {
                  label: "Teléfono fijo y/o móvil*",
                  field: "urgenciaTelefono",
                  type: "tel",
                },
              ].map((input) => (
                <div key={input.field}>
                  <label
                    htmlFor={input.field}
                    className="block text-lg font-medium text-gray-800 mb-1"
                  >
                    {input.label}
                  </label>
                  <input
                    id={input.field}
                    type={input.type}
                    value={formData[input.field as keyof typeof formData]}
                    onChange={(e) => handleChange(input.field, e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-gray-300 shadow-sm py-3 px-4 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Ingrese ${input.label.toLowerCase()}`}
                    required
                  />
                </div>
              ))}
            </div>
          </fieldset>
        </div>

        <div className="flex justify-center gap-6">
          <button
            type="button"
            onClick={generatePDF}
            className="bg-red-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-red-600 transition"
          >
            Confirmar Consentimiento
            <br />
            Libre e Informado
          </button>
        </div>
      </form>
    </div>
  );
};

export default Concents;
