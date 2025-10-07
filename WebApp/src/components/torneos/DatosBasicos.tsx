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
import { PopupNotificacion } from "../common/PopupNotificacion";

interface DatosBasicosProps {
  formData: Torneo;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onTorneoCreated?: (torneo: Torneo) => void;
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

  // ✅ Estado para el popup de notificaciones
  const [popup, setPopup] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning",
    message: "",
  });

  const showPopup = (
    type: "success" | "error" | "warning",
    message: string
  ) => {
    setPopup({ open: true, type, message });
    setTimeout(() => setPopup({ ...popup, open: false }), 4000);
  };

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

    // ✅ Validaciones
    const errores: string[] = [];

    // Validar nombre del torneo
    if (!formData.nombre?.trim()) {
      errores.push("• Ingresar el nombre del torneo");
    }

    // Validar abreviatura del torneo (min 2, max 16 caracteres)
    if (!formData.abrev?.trim()) {
      errores.push("• Ingresar la abreviatura del torneo");
    } else if (formData.abrev.trim().length < 2) {
      errores.push("• La abreviatura debe tener al menos 2 caracteres");
    } else if (formData.abrev.trim().length > 16) {
      errores.push("• La abreviatura no puede exceder los 16 caracteres");
    }

    // Validar campeonato
    if (!formData.idcampeonato || formData.idcampeonato === 0) {
      errores.push("• Seleccionar un campeonato");
    }

    // Validar sede
    if (!formData.idsede || formData.idsede === 0) {
      errores.push("• Seleccionar una sede");
    }

    // Validar año
    if (!formData.anio) {
      errores.push("• Ingresar el año del torneo");
    }

    // ✅ Si hay errores, mostrar popup y no enviar
    if (errores.length > 0) {
      showPopup("warning", errores.join("<br />"));
      return;
    }

    try {
      const { id, ...torneoData } = formData;
      const resultado = await dispatch(
        saveTorneoThunk(id ? formData : torneoData)
      ).unwrap();

      // Mostrar mensaje de éxito
      showPopup("success", "Torneo guardado correctamente");

      // Si es un torneo nuevo y se creó exitosamente, notificar al padre
      if (!id && resultado && resultado.id && onTorneoCreated) {
        console.log("🎯 Torneo creado con ID:", resultado.id);
        onTorneoCreated(resultado);
      }
    } catch (err) {
      console.error("Error al guardar torneo:", err);
      showPopup("error", "Error al guardar el torneo");
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
            value: formData.anio ?? new Date().getFullYear(),
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

      {/* ✅ Popup de notificaciones */}
      <PopupNotificacion
        open={popup.open}
        type={popup.type}
        message={popup.message}
        onClose={() => setPopup({ ...popup, open: false })}
      />
    </div>
  );
}

export default DatosBasicos;