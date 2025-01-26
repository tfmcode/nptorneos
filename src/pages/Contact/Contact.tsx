import { ContactInfo, RegistrationForm } from "./components";

const InscripcionSection: React.FC = () => {
  return (
    <section id="inscripcion" className="container mx-auto my-8 px-4">
      <h2 className="text-center text-3xl font-bold mb-6 pt-8">Inscribite</h2>
      <RegistrationForm />
      <ContactInfo />
    </section>
  );
};

export default InscripcionSection;