import { transporter, ADMIN_EMAIL } from "../config/mailConfig";

interface JugadorMail {
  apellido: string;
  nombres: string;
  docnro: number;
  posicion?: string;
  capitan?: number;
  subcapitan?: number;
}

interface EnviarMailInscripcionParams {
  emailEquipo: string;
  nombreEquipo: string;
  tipoTorneo: string;
  jugadores: JugadorMail[];
}

const generarListaBuenaFe = (jugadores: JugadorMail[]): string => {
  let tabla = `
    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f3f4f6;">
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">#</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Apellido</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">Nombres</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: left;">DNI</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">N°</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">C</th>
          <th style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">SC</th>
        </tr>
      </thead>
      <tbody>
  `;

  jugadores.forEach((jugador, index) => {
    tabla += `
      <tr>
        <td style="border: 1px solid #d1d5db; padding: 8px;">${index + 1}</td>
        <td style="border: 1px solid #d1d5db; padding: 8px;">${
          jugador.apellido
        }</td>
        <td style="border: 1px solid #d1d5db; padding: 8px;">${
          jugador.nombres
        }</td>
        <td style="border: 1px solid #d1d5db; padding: 8px;">${
          jugador.docnro
        }</td>
        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${
          jugador.posicion || "-"
        }</td>
        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${
          jugador.capitan === 1 ? "✔️" : ""
        }</td>
        <td style="border: 1px solid #d1d5db; padding: 8px; text-align: center;">${
          jugador.subcapitan === 1 ? "✔️" : ""
        }</td>
      </tr>
    `;
  });

  tabla += `
      </tbody>
    </table>
  `;

  return tabla;
};

export const enviarMailInscripcion = async ({
  emailEquipo,
  nombreEquipo,
  tipoTorneo,
  jugadores,
}: EnviarMailInscripcionParams): Promise<void> => {
  const listaBuenaFe = generarListaBuenaFe(jugadores);

  const mailEquipo = {
    from: process.env.ZOHO_MAIL_USER,
    to: emailEquipo,
    subject: "Confirmación de Inscripción - LIGA NP",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">¡Muchas gracias por enviarnos la lista de buena fe!</h2>
        <p>Tu equipo <strong>"${nombreEquipo}"</strong> ya quedó oficialmente registrado y están inscriptos para participar en el torneo de <strong>${tipoTorneo}</strong>.</p>
        <p>Les deseamos el mejor de los éxitos en su participación en LIGA NP.</p>
        <p>Seguimos la comunicación vía whatsapp con la línea de coordinación!</p>
        <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px;">Saludos,<br><strong>El equipo de LIGA NP</strong></p>
      </div>
    `,
  };

  const mailAdmin = {
    from: process.env.ZOHO_MAIL_USER,
    to: ADMIN_EMAIL,
    subject: `Nueva Inscripción - ${nombreEquipo}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
        <h2 style="color: #dc2626;">Nueva Inscripción Registrada</h2>
        <p>El equipo <strong>"${nombreEquipo}"</strong> se ha inscripto para participar en el torneo de <strong>${tipoTorneo}</strong>.</p>
        <p><strong>Email de contacto:</strong> ${emailEquipo}</p>
        <h3 style="margin-top: 30px;">Lista de Buena Fe:</h3>
        ${listaBuenaFe}
      </div>
    `,
  };

  await transporter.sendMail(mailEquipo);

  try {
    if (ADMIN_EMAIL) {
      await transporter.sendMail(mailAdmin);
    }
  } catch (adminMailError) {
    console.error("⚠️ No se pudo enviar mail al admin:", adminMailError);
  }
};
