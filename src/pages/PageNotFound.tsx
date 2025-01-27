import { Link as RouterLink } from "react-router-dom";
import { EPublicRoutes } from "../models";

const PageNotFound = () => {
  return (
    <div className="flex flex-col justify-center items-center min-h-[85vh]">
      <p className="text-2xl font-semibold text-gray-600 mb-4">
        Recurso no encontrado.
      </p>
      <RouterLink
        to={EPublicRoutes.HOME}
        className="text-blue-600 hover:underline"
      >
        Volver a la página principal
      </RouterLink>
    </div>
  );
};

export default PageNotFound;
