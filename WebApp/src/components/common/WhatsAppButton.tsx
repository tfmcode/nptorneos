import React from "react";
import "./WhatsAppButton.css";

const WhatsAppButton: React.FC = () => {
  const phoneNumber = "5491131065166";
  const message =
    "Hola, me comunico desde la web de NpTorneos para solicitar más información.";
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
    message
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-button"
      aria-label="Contactar por WhatsApp"
    >
      <img src="/btn_whatsapp.png" alt="WhatsApp" />
    </a>
  );
};

export default WhatsAppButton;
