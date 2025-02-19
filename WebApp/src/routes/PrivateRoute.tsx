import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../store";
import { useEffect, useState } from "react";

const PrivateRoute = () => {
  const { token, user } = useSelector((state: RootState) => state.auth);
  const [isLoading, setIsLoading] = useState(!token || !user);

  useEffect(() => {
    if (token && user) {
      setIsLoading(false);
    } else {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [token, user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-blue-500"></div>
        <p className="ml-2 text-gray-500">Cargando...</p>
      </div>
    );
  }

  return token && user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
