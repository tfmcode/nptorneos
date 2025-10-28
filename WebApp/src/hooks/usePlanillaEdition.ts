// WebApp/src/hooks/usePlanillaEdition.ts

import { useState, useEffect } from "react";
import {
  addEquipoPlanilla,
  updateEquipoPlanilla,
  deleteEquipoPlanilla,
  addArbitroPlanilla,
  updateArbitroPlanilla,
  deleteArbitroPlanilla,
  addCanchaPlanilla,
  updateCanchaPlanilla,
  deleteCanchaPlanilla,
  addProfesorPlanilla,
  updateProfesorPlanilla,
  deleteProfesorPlanilla,
  addMedicoPlanilla,
  updateMedicoPlanilla,
  deleteMedicoPlanilla,
  addOtroGastoPlanilla,
  updateOtroGastoPlanilla,
  deleteOtroGastoPlanilla,
} from "../api/planillasPagosService";

type EntityType =
  | "equipo"
  | "arbitro"
  | "cancha"
  | "profesor"
  | "medico"
  | "otro_gasto";

interface UsePlanillaEditionProps<T> {
  entityType: EntityType;
  initialData: T[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

// Tipo base que todos los items deben tener
interface BaseItem {
  id?: number;
  idfecha: number;
  orden: number;
}

export function usePlanillaEdition<T extends BaseItem>(
  props: UsePlanillaEditionProps<T>
) {
  const { entityType, initialData, idfecha, onSuccess, onError } = props;

  const [data, setData] = useState<T[]>(initialData);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Actualizar data cuando cambia initialData
  useEffect(() => {
    setData(initialData);
    setHasChanges(false);
  }, [initialData]);

  // Obtener el siguiente orden disponible
  const getNextOrden = (): number => {
    if (data.length === 0) return 1;
    const maxOrden = Math.max(...data.map((item) => item.orden));
    return maxOrden + 1;
  };

  // Crear plantilla según tipo de entidad
  const createTemplate = (orden: number): T => {
    const base = { idfecha, orden };

    switch (entityType) {
      case "equipo":
        return {
          ...base,
          idequipo: 0,
          tipopago: 1,
          importe: 0,
        } as unknown as T;
      case "arbitro":
        return {
          ...base,
          idarbitro: 0,
          partidos: 0,
          valor_partido: 0,
          total: 0,
        } as unknown as T;
      case "cancha":
        return { ...base, horas: 0, valor_hora: 0, total: 0 } as unknown as T;
      case "profesor":
        return {
          ...base,
          idprofesor: 0,
          horas: 0,
          valor_hora: 0,
          total: 0,
        } as unknown as T;
      case "medico":
        return {
          ...base,
          idmedico: 0,
          horas: 0,
          valor_hora: 0,
          total: 0,
        } as unknown as T;
      case "otro_gasto":
        return {
          ...base,
          codgasto: 0,
          cantidad: 0,
          valor_unidad: 0,
          total: 0,
        } as unknown as T;
      default:
        return base as unknown as T;
    }
  };

  // Agregar nuevo registro
  const handleAdd = () => {
    const nuevoOrden = getNextOrden();
    const newItem = createTemplate(nuevoOrden);
    setData([...data, newItem]);
    setHasChanges(true);
  };

  // Actualizar registro
  const handleUpdate = (index: number, field: keyof T, value: unknown) => {
    const updated = [...data];
    updated[index] = { ...updated[index], [field]: value };
    setData(updated);
    setHasChanges(true);
  };

  // Eliminar registro
  const handleDelete = (index: number) => {
    setData(data.filter((_, i) => i !== index));
    setHasChanges(true);
  };

  // Guardar cambios en el backend
  const handleSave = async () => {
    if (!hasChanges) {
      onError?.("No hay cambios para guardar");
      return;
    }

    setIsEditing(true);

    try {
      // Procesar cada registro según su tipo
      for (const item of data) {
        const payload = { ...item };

        switch (entityType) {
          case "equipo":
            if (!item.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await addEquipoPlanilla(payload as any);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await updateEquipoPlanilla(item.id, payload as any);
            }
            break;

          case "arbitro":
            if (!item.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await addArbitroPlanilla(payload as any);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await updateArbitroPlanilla(idfecha, item.orden, payload as any);
            }
            break;

          case "cancha":
            if (!item.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await addCanchaPlanilla(payload as any);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await updateCanchaPlanilla(idfecha, item.orden, payload as any);
            }
            break;

          case "profesor":
            if (!item.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await addProfesorPlanilla(payload as any);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await updateProfesorPlanilla(idfecha, item.orden, payload as any);
            }
            break;

          case "medico":
            if (!item.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await addMedicoPlanilla(payload as any);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await updateMedicoPlanilla(idfecha, item.orden, payload as any);
            }
            break;

          case "otro_gasto":
            if (!item.id) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await addOtroGastoPlanilla(payload as any);
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              await updateOtroGastoPlanilla(
                idfecha,
                item.orden,
                payload as any
              );
            }
            break;
        }
      }

      setHasChanges(false);
      onSuccess?.();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error al guardar cambios";
      onError?.(errorMsg);
    } finally {
      setIsEditing(false);
    }
  };

  // Eliminar registro del backend
  const handleDeleteFromBackend = async (index: number) => {
    const item = data[index];
    if (!item.id) {
      // Si no tiene ID, solo lo eliminamos localmente
      handleDelete(index);
      return;
    }

    setIsEditing(true);

    try {
      switch (entityType) {
        case "equipo":
          await deleteEquipoPlanilla(item.id);
          break;
        case "arbitro":
          await deleteArbitroPlanilla(idfecha, item.orden);
          break;
        case "cancha":
          await deleteCanchaPlanilla(idfecha, item.orden);
          break;
        case "profesor":
          await deleteProfesorPlanilla(idfecha, item.orden);
          break;
        case "medico":
          await deleteMedicoPlanilla(idfecha, item.orden);
          break;
        case "otro_gasto":
          await deleteOtroGastoPlanilla(idfecha, item.orden);
          break;
      }

      handleDelete(index);
      onSuccess?.();
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Error al eliminar registro";
      onError?.(errorMsg);
    } finally {
      setIsEditing(false);
    }
  };

  return {
    data,
    setData,
    isEditing,
    hasChanges,
    handleAdd,
    handleUpdate,
    handleDelete: handleDeleteFromBackend,
    handleSave,
  };
}
