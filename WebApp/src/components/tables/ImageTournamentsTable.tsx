import { TrashIcon } from "@heroicons/react/24/outline";
import { TorneosImagen } from "../../types";
import {
  fetchTorneoImagenesByTorneo,
  removeTorneoImagen,
  saveTorneoImagenThunk,
} from "../../store/slices/torneosImagenSlice";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";

interface ImageTournamentsTableProps {
  data: TorneosImagen[];
  setData: (data: TorneosImagen[]) => void;
  disabled?: boolean;
}

const ImageTournamentsTable = ({
  data,
  setData,
  disabled,
}: ImageTournamentsTableProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const baseURL = import.meta.env.VITE_API_URL;

  const handleDescriptionChange = (row: TorneosImagen, value: string) => {
    const newData = data.map((r) => {
      if (r.id === row.id) {
        return { ...r, descripcion: value };
      }
      return r;
    });
    setData(newData);
  };

  const handleDescriptionBlur = async (row: TorneosImagen) => {
    try {
      await dispatch(
        saveTorneoImagenThunk({
          id: row.id!,
          descripcion: row.descripcion,
        })
      ).unwrap();
      dispatch(fetchTorneoImagenesByTorneo(row.idtorneo ?? 0));
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  const handleHomeChange = async (row: TorneosImagen) => {
    const newHome = row.home === 1 ? 0 : 1;

    try {
      await dispatch(
        saveTorneoImagenThunk({
          id: row.id!,
          home: newHome,
        })
      ).unwrap();
      setData(data.map((r) => (r.id === row.id ? { ...r, home: newHome } : r)));
    } catch (error) {
      console.error("Error saving home value:", error);
    }
  };

  const handleDelete = async (torneosImagen: TorneosImagen) => {
    await dispatch(removeTorneoImagen(torneosImagen.id!)).unwrap();
    dispatch(fetchTorneoImagenesByTorneo(torneosImagen.idtorneo ?? 0));
  };

  return (
    <div className="w-full mx-auto bg-white shadow-md rounded-lg p-4 min-h-40">
      <div className="overflow-x-auto max-h-80 border border-gray-300 rounded-lg relative">
        <table className="w-full text-center">
          <thead className="bg-gray-200 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 border text-sm">Nombre Archivo</th>
              <th className="px-4 py-2 border text-sm">Descripción</th>
              <th className="px-4 py-2 border text-sm">Imagen</th>
              <th className="px-4 py-2 border text-sm">Home</th>
              <th className="w-[50px] border text-sm"></th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => {
              return (
                <tr key={rowIndex} className={"hover:bg-gray-100 text-sm"}>
                  <td className="px-4 py-2 border">{row.nombre}</td>
                  <td className="px-4 py-2 border">
                    <input
                      type="text"
                      value={row.descripcion as string}
                      onChange={(e) =>
                        handleDescriptionChange(row, e.target.value)
                      }
                      onBlur={() => handleDescriptionBlur(row)}
                      disabled={disabled}
                    />
                  </td>

                  <td className="px-4 py-4 border flex justify-center items-center">
                    <img
                      src={`${baseURL}/assets/${row.ubicacion}${row.nombre}`}
                      alt={row.nombre}
                      className="w-20 h-20 object-cover transition-transform duration-200 hover:scale-125 hover:shadow-lg rounded cursor-pointer"
                    />
                  </td>

                  <td className="px-4 py-2 border">
                    <input
                      type="checkbox"
                      checked={row.home === 1}
                      onChange={() => handleHomeChange(row)}
                      disabled={disabled}
                    />
                  </td>

                  {/* Botón de eliminación */}
                  <td className="px-4 py-2 border">
                    <button
                      onClick={() => handleDelete(row)}
                      className="px-2 py-1 text-red-600 hover:text-red-800"
                      title="Eliminar"
                      disabled={disabled}
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ImageTournamentsTable;
