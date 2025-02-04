import sponsor1 from "../../../../assets/sponsor1.png";
import sponsor2 from "../../../../assets/sponsor2.jpeg";
//import sponsor3 from "../../../../assets/sponsor3.jpeg";
import sponsor4 from "../../../../assets/sponsor4.jpg";
import sponsor5 from "../../../../assets/sponsor5.jpeg";
import sponsor6 from "../../../../assets/sponsor6.png";

const LogosCloud: React.FC = () => {
  const sponsors = [
    { name: "Transistor", src: sponsor1 },
    { name: "Reform", src: sponsor2 },
    // { name: "Tuple", src: sponsor3 },
    { name: "SavvyCal", src: sponsor4 },
    { name: "Statamic", src: sponsor5 },
    { name: "Tailwind UI", src: sponsor6 },
  ];

  return (
    <div className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="text-center text-4xl font-bold text-gray-800 mb-6 relative">
          Marcas que confían en nosotros
        </h2>
        <div className="mx-auto mt-10 grid max-w-lg grid-cols-4 items-center gap-x-8 gap-y-10 sm:max-w-xl sm:grid-cols-6 sm:gap-x-10 lg:mx-0 lg:max-w-none lg:grid-cols-5">
          {sponsors.map((sponsor) => (
            <img
              key={sponsor.name}
              alt={sponsor.name}
              src={sponsor.src}
              className="max-h-16 w-full object-contain"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogosCloud;
