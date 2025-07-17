import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { fetchTorneos } from "../../store/slices/torneoSlice";
import { fetchZonasByTorneo } from "../../store/slices/zonaSlice";
import { fetchPartidosByZona } from "../../store/slices/partidoSlice";

type Props = {
  onSeleccionar: (idzona: number, nrofecha: number) => void;
};

const SelectorTorneoZonaFecha = ({ onSeleccionar }: Props) => {
  const dispatch = useDispatch<AppDispatch>();
  const { torneos } = useSelector((state: RootState) => state.torneos);
  const { zonas } = useSelector((state: RootState) => state.zonas);
  const { partidos } = useSelector((state: RootState) => state.partidos);

  const [idTorneo, setIdTorneo] = useState(0);
  const [idZona, setIdZona] = useState(0);
  const [nroFecha, setNroFecha] = useState<number | "">("");

  useEffect(() => {
    dispatch(fetchTorneos({ page: 1, limit: 1000, searchTerm: "" }));
  }, [dispatch]);

  useEffect(() => {
    if (idTorneo) {
      dispatch(fetchZonasByTorneo(idTorneo));
      setIdZona(0);
      setNroFecha("");
    }
  }, [idTorneo, dispatch]);

  useEffect(() => {
    if (idZona) {
      dispatch(fetchPartidosByZona(idZona));
      setNroFecha("");
    }
  }, [idZona, dispatch]);

  const handleFiltrar = () => {
    if (idZona && nroFecha !== "") {
      onSeleccionar(idZona, Number(nroFecha));
    }
  };

  // Obtener fechas únicas de los partidos
  const fechasUnicas = Array.from(
    new Set(partidos.map((p) => p.nrofecha).filter((n) => n != null))
  ).sort((a, b) => Number(a) - Number(b));

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
      <div>
        <label className="block text-sm font-medium">Torneo</label>
        <select
          className="w-full border rounded p-2"
          value={idTorneo}
          onChange={(e) => setIdTorneo(Number(e.target.value))}
        >
          <option value={0}>Seleccionar Torneo</option>
          {torneos.map((t) => (
            <option key={t.id} value={t.id}>
              {t.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Zona</label>
        <select
          className="w-full border rounded p-2"
          value={idZona}
          onChange={(e) => setIdZona(Number(e.target.value))}
          disabled={!idTorneo}
        >
          <option value={0}>Seleccionar Zona</option>
          {zonas.map((z) => (
            <option key={z.id} value={z.id}>
              {z.nombre}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Fecha</label>
        <select
          className="w-full border rounded p-2"
          value={nroFecha}
          onChange={(e) => setNroFecha(Number(e.target.value))}
          disabled={!idZona}
        >
          <option value="">Seleccionar Fecha</option>
          {fechasUnicas.map((f) => (
            <option key={f} value={f}>
              Fecha {f}
            </option>
          ))}
        </select>
      </div>

      <button
        className="bg-blue-600 text-white rounded p-2"
        onClick={handleFiltrar}
        disabled={!idZona || nroFecha === ""}
      >
        Filtrar
      </button>
    </div>
  );
};

export default SelectorTorneoZonaFecha;
