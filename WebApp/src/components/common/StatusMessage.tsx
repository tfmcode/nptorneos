import React from "react";

interface StatusMessageProps {
  loading?: boolean;
  error?: string | null;
}

const StatusMessage: React.FC<StatusMessageProps> = ({ loading, error }) => {
  if (loading)
    return <p className="text-gray-500 text-center mb-4">Cargando...</p>;
  if (error) return <p className="text-red-500 text-center mb-4">{error}</p>;
  return null;
};

export default StatusMessage;
