import { useEffect, useState } from "react";
import {
  fetchCampeonatos,
  fetchCampeonatosGaleria,
} from "../../store/slices/campeonatoSlice";
import { fetchCodificadores } from "../../store/slices/codificadorSlice";
import { fetchSedes } from "../../store/slices/sedeSlice";
import { Torneo } from "../../types/torneos";
import DynamicForm from "../forms/DynamicForm";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { saveTorneoThunk } from "../../store/slices/torneoSlice";
import { getTorneosCampeonato } from "../../api/torneosService";

interface DatosBasicosProps {
  formData: Torneo;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => void;
  onTorneoCreated?: (torneo: Torneo) => void; // ✅ Nueva prop para notificar creación
}

function DatosBasicos({
  formData,
  onChange,
  onTorneoCreated,
}: DatosBasicosProps) {
  const dispatch = useDispatch<AppDispatch>();

  const { campeonatos, campeonatosGaleria } = useSelector(
    (state: RootState) => state.campeonatos
  );
  const { sedes } = useSelector((state: RootState) => state.sedes);
  const { codificadores } = useSelector(
    (state: RootState) => state.codificadores
  );

  const [torneosPadre, setTorneosPadre] = useState<Torneo[]>([]);

  useEffect(() => {
    let isMounted = true;

    const fetchTorneos = async () => {
      if (formData.idcampeonato) {
        try {
          const torneos = await getTorneosCampeonato(formData.idcampeonato);
          if (isMounted) setTorneosPadre(torneos);
        } catch (error) {
          if (isMounted) setTorneosPadre([]);
          console.error("Error al obtener torneos:", error);
        }
      } else {
        setTorneosPadre([]);
      }
    };

    fetchTorneos();

    return () => {
      isMounted = false;
    };
  }, [formData.idcampeonato]);

  useEffect(() => {
    dispatch(fetchCampeonatos());
    dispatch(fetchCampeonatosGaleria());
    dispatch(fetchSedes());
    dispatch(fetchCodificadores());
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { id, ...torneoData } = formData;
      const resultado = await dispatch(
        saveTorneoThunk(id ? formData : torneoData)
      ).unwrap();

      // ✅ Si es un torneo nuevo y se creó exitosamente, notificar al padre
      if (!id && resultado && resultado.id && onTorneoCreated) {
        console.log("🎯 Torneo creado con ID:", resultado.id); // Para debug
        onTorneoCreated(resultado);
      }
    } catch (err) {
      console.error("Error al guardar torneo:", err);
    }
  };

  return (
    <div>
      <DynamicForm
        fields={[
          {
            name: "nombre",
            type: "text",
            placeholder: "Nombre del Torneo",
            value: formData.nombre ?? "",
            colSpan: 2,
          },
          {
            name: "abrev",
            type: "text",
            placeholder: "Abreviatura del Torneo",
            value: formData.abrev ?? "",
          },
          {
            name: "sas",
            type: "checkbox",
            value: formData.sas ?? 0,
            label: "Torneo Sas",
          },
          {
            name: "idcampeonato",
            type: "select",
            options: campeonatos
              .filter((campeonato) => campeonato.codestado === 1)
              .map((campeonato) => ({
                label: campeonato.nombre,
                value: campeonato.id ?? 0,
              })),
            value: formData.idcampeonato ?? 0,
            label: "Campeonato",
          },
          {
            name: "idsede",
            type: "select",
            options: sedes.map((sede) => ({
              label: sede.nombre,
              value: sede.id ?? 1,
            })),
            value: formData.idsede ?? 0,
            label: "Sede",
          },
          {
            name: "codmodelo",
            type: "select",
            options: [
              { label: "Regular", value: 1 },
              { label: "Playoff", value: 2 },
            ],
            value: formData.codmodelo ?? 1,
            label: "Modelo de Torneo",
          },
          {
            name: "idpadre",
            type: "select",
            options: (Array.isArray(torneosPadre) ? torneosPadre : []).map(
              (torneo) => ({
                label: torneo.nombre,
                value: torneo.id ?? 1,
              })
            ),
            value: formData.idpadre ?? 0,
            label: "Torneo Padre",
          },
          {
            name: "anio",
            type: "number",
            value: formData.anio ?? 1,
            label: "Año",
          },
          {
            name: "codestado",
            type: "select",
            options: [
              { label: "Activo", value: 1 },
              { label: "Inactivo", value: 0 },
            ],
            value: formData.codestado ?? 1,
            label: "Estado",
          },
          {
            name: "codtipo",
            type: "select",
            options: codificadores
              .filter(
                (codificador) =>
                  codificador.habilitado === "1" &&
                  codificador.idcodificador === 3
              )
              .map((codificador) => ({
                label: codificador.descripcion ?? "",
                value: codificador.id ?? 1,
              })),
            value: formData.codtipo ?? 0,
            label: "Tipo de Torneo",
          },
          {
            name: "cantmin",
            type: "number",
            value: formData.cantmin ?? 1,
            label: "Cant. Mínima",
          },
          {
            name: "cposicion",
            type: "checkbox",
            value: formData.cposicion ?? 1,
            label: "Calc. Posiciones",
          },
          {
            name: "cpromedio",
            type: "checkbox",
            value: formData.cpromedio ?? 1,
            label: "Calc. Promedio",
          },
          {
            name: "torneodefault",
            type: "checkbox",
            value: formData.torneodefault ?? 0,
            label: "Torneo Default",
          },
          {
            name: "fotojugador",
            type: "checkbox",
            value: formData.fotojugador ?? 0,
            label: "Foto Jugador",
          },
          {
            name: "excluir_res",
            type: "checkbox",
            value: formData.excluir_res ?? 0,
            label: "Excluir Resultados",
          },
          {
            name: "individual",
            type: "checkbox",
            value: formData.individual ?? 0,
            label: "Individual",
          },
          {
            name: "idgaleria",
            type: "select",
            options: (Array.isArray(campeonatosGaleria)
              ? campeonatosGaleria
              : []
            ).map((campeonato) => ({
              label: campeonato.nombre,
              value: campeonato.id ?? 1,
            })),
            value: formData.idgaleria ?? 0,
            label: "Galeria",
          },
          {
            name: "valor_insc",
            type: "money",
            value: formData.valor_insc ?? 0,
            label: "Inscripción",
          },
          {
            name: "valor_arbitro",
            type: "money",
            value: formData.valor_arbitro ?? 1,
            label: "Valor Árbitro",
          },
          {
            name: "valor_cancha",
            type: "money",
            value: formData.valor_cancha ?? 1,
            label: "Valor Cancha",
          },
          {
            name: "valor_fecha",
            type: "money",
            value: formData.valor_fecha ?? 1,
            label: "Valor Fecha",
          },
          {
            name: "valor_medico",
            type: "money",
            value: formData.valor_medico ?? 1,
            label: "Valor Médico",
          },
        ]}
        onChange={onChange}
        onSubmit={handleSubmit}
        submitLabel="Guardar"
      />
    </div>
  );
}

export default DatosBasicos;
