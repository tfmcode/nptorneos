import { ContactInfo } from "./components";
import { InscripcionForm } from "../../../components/forms//InscripcionForm";

const InscripcionSection: React.FC = () => {
  return (
    <section id="inscripcion" className="container mx-auto my-8 px-4">
      <h2 className="text-center text-3xl font-bold mb-6 pt-8">Inscribite</h2>
      <InscripcionForm />
      <ContactInfo />
    </section>
  );
};

export default InscripcionSection;
