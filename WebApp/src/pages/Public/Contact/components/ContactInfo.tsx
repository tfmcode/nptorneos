import React from "react";

const ContactInfo: React.FC = () => {
  return (
    <div className="bg-gray-100 p-6 rounded-lg shadow-lg mt-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-xl font-bold mb-4 text-center">
            Ubicación y Horario
          </h3>
          <p>
            <strong>Dirección:</strong>
          </p>
          <p>Gral. Manuel Savio 2902, San Martín, Buenos Aires</p>
          <p>
            <strong>Horarios:</strong>
          </p>
          <p>De lunes a domingo de 9:00 AM a 11:00 PM</p>
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3282.850888423892!2d-58.539622884192416!3d-34.62047396554713!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95bccbe3641b016d%3A0x7833d5367955c8a2!2sGral.%20Manuel%20Savio%202902%2C%20San%20Mart%C3%ADn%2C%20Provincia%20de%20Buenos%20Aires!5e0!3m2!1ses!2sar!4v1694891551153!5m2!1ses!2sar"
            width="100%"
            height="250"
            className="border mt-4"
            loading="lazy"
          ></iframe>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 text-center">
            Información de Contacto
          </h3>
          <p>
            <strong>Ventas:</strong>
          </p>
          <ul className="list-none space-y-2">
            <li>
              11-3665-5084 -{" "}
              <a
                href="mailto:info@nptorneos.com.ar"
                className="text-indigo-600 hover:underline"
              >
                info@nptorneos.com.ar
              </a>
            </li>
            <li>
              11-3106-5166 -{" "}
              <a
                href="mailto:info@nptorneos.com.ar"
                className="text-indigo-600 hover:underline"
              >
                info@nptorneos.com.ar
              </a>
            </li>
          </ul>
          <p>
            <strong>Coordinación:</strong>
          </p>
          <ul className="list-none space-y-2">
            <li>
              <strong>Fútbol 11:</strong> 11-6750-7198
            </li>
            <li>
              <strong>Fútbol 5 y Fútbol 8:</strong> 11-3621-0453
            </li>
            <li>
              <strong>Escuela / Entrenamientos:</strong> 11-4971-2657
            </li>
            <li>
              <strong>Empresas:</strong> 11-6750-7198
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;
