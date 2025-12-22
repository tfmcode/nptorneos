// WebApp/src/hooks/usePlanillaEdition.ts

import { useState, useEffect } from "react";
import {
  PlanillaEquipo,
  PlanillaArbitro,
  PlanillaCancha,
  PlanillaProfesor,
  PlanillaMedico,
  PlanillaOtroGasto,
} from "../types/planillasPago";

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

// Tipo genérico que acepta todas las entidades de planilla
type PlanillaEntity =
  | PlanillaEquipo
  | PlanillaArbitro
  | PlanillaCancha
  | PlanillaProfesor
  | PlanillaMedico
  | PlanillaOtroGasto;

type EntityType =
  | "equipo"
  | "arbitro"
  | "cancha"
  | "profesor"
  | "medico"
  | "otro_gasto";

interface UsePlanillaEditionProps<T extends PlanillaEntity> {
  entityType: EntityType;
  initialData: T[];
  idfecha: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UsePlanillaEditionReturn<T extends PlanillaEntity> {
  data: T[];
  isEditing: boolean;
  handleAdd: (newItem?: Partial<T>) => void;
  handleUpdate: (index: number, field: keyof T, value: unknown) => void;
  handleDelete: (index: number) => void;
  handleSave: () => Promise<void>;
}

export function usePlanillaEdition<T extends PlanillaEntity>({
  entityType,
  initialData,
  idfecha,
  onSuccess,
  onError,
}: UsePlanillaEditionProps<T>): UsePlanillaEditionReturn<T> {
  const [data, setData] = useState<T[]>(initialData);
  const [deletedItems, setDeletedItems] = useState<T[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Actualizar data cuando cambia initialData
  useEffect(() => {
    setData(initialData);
    setDeletedItems([]); // Limpiar items eliminados cuando se recarga
  }, [initialData]);

  // Obtener el siguiente orden disponible
  const getNextOrden = (): number => {
    if (data.length === 0) return 1;
    const maxOrden = Math.max(...data.map((item) => item.orden));
    return maxOrden + 1;
  };

  // Crear una nueva entidad vacía según el tipo
  const createEmptyEntity = (): T => {
    const baseEntity = {
      idfecha,
      orden: getNextOrden(),
    };

    switch (entityType) {
      case "equipo":
        return {
          ...baseEntity,
          idequipo: 0,
          tipopago: 1,
          importe: 0,
        } as T;

      case "arbitro":
        return {
          ...baseEntity,
          idarbitro: 0,
          partidos: 0,
          valor_partido: 0,
          total: 0,
        } as T;

      case "cancha":
        return {
          ...baseEntity,
          horas: 0,
          valor_hora: 0,
          total: 0,
        } as T;

      case "profesor":
        return {
          ...baseEntity,
          idprofesor: 0,
          horas: 0,
          valor_hora: 0,
          total: 0,
        } as T;

      case "medico":
        return {
          ...baseEntity,
          idmedico: 0,
          horas: 0,
          valor_hora: 0,
          total: 0,
        } as T;

      case "otro_gasto":
        return {
          ...baseEntity,
          codgasto: 0,
          cantidad: 0,
          valor_unidad: 0,
          total: 0,
        } as T;

      default:
        return baseEntity as T;
    }
  };

  // Agregar nueva entidad
  const handleAdd = (newItem?: Partial<T>) => {
    const baseEntity = createEmptyEntity();
    const newEntity = newItem ? { ...baseEntity, ...newItem } : baseEntity;
    setData([...data, newEntity as T]);
  };

  // Actualizar campo de una entidad
  const handleUpdate = (index: number, field: keyof T, value: unknown) => {
    const newData = [...data];
    newData[index] = {
      ...newData[index],
      [field]: value,
    };
    setData(newData);
  };

  // Eliminar entidad
  const handleDelete = (index: number) => {
    const itemToDelete = data[index];

    // Si el item ya existe en la BD (tiene id o fhcarga), guardarlo para eliminarlo después
    if (itemToDelete.id !== undefined || itemToDelete.fhcarga !== undefined) {
      setDeletedItems([...deletedItems, itemToDelete]);
    }

    // Remover del array local
    const newData = data.filter((_, i) => i !== index);
    setData(newData);
  };

  // Guardar todos los cambios
  const handleSave = async () => {
    setIsEditing(true);

    try {
      // Determinar qué funciones usar según el tipo de entidad
      const {
        addFn,
        updateFn,
        deleteFn,
      }: {
        addFn: (data: T) => Promise<T | null>;
        updateFn: (
          idfecha: number,
          orden: number,
          data: Partial<T>
        ) => Promise<T | null>;
        deleteFn: (idfecha: number, orden: number) => Promise<void>;
      } = (() => {
        switch (entityType) {
          case "equipo":
            return {
              addFn: addEquipoPlanilla as (data: T) => Promise<T | null>,
              updateFn: updateEquipoPlanilla as (
                idfecha: number,
                orden: number,
                data: Partial<T>
              ) => Promise<T | null>,
              deleteFn: deleteEquipoPlanilla as (
                idfecha: number,
                orden: number
              ) => Promise<void>,
            };
          case "arbitro":
            return {
              addFn: addArbitroPlanilla as (data: T) => Promise<T | null>,
              updateFn: updateArbitroPlanilla as (
                idfecha: number,
                orden: number,
                data: Partial<T>
              ) => Promise<T | null>,
              deleteFn: deleteArbitroPlanilla as (
                idfecha: number,
                orden: number
              ) => Promise<void>,
            };
          case "cancha":
            return {
              addFn: addCanchaPlanilla as (data: T) => Promise<T | null>,
              updateFn: updateCanchaPlanilla as (
                idfecha: number,
                orden: number,
                data: Partial<T>
              ) => Promise<T | null>,
              deleteFn: deleteCanchaPlanilla as (
                idfecha: number,
                orden: number
              ) => Promise<void>,
            };
          case "profesor":
            return {
              addFn: addProfesorPlanilla as (data: T) => Promise<T | null>,
              updateFn: updateProfesorPlanilla as (
                idfecha: number,
                orden: number,
                data: Partial<T>
              ) => Promise<T | null>,
              deleteFn: deleteProfesorPlanilla as (
                idfecha: number,
                orden: number
              ) => Promise<void>,
            };
          case "medico":
            return {
              addFn: addMedicoPlanilla as (data: T) => Promise<T | null>,
              updateFn: updateMedicoPlanilla as (
                idfecha: number,
                orden: number,
                data: Partial<T>
              ) => Promise<T | null>,
              deleteFn: deleteMedicoPlanilla as (
                idfecha: number,
                orden: number
              ) => Promise<void>,
            };
          case "otro_gasto":
            return {
              addFn: addOtroGastoPlanilla as (data: T) => Promise<T | null>,
              updateFn: updateOtroGastoPlanilla as (
                idfecha: number,
                orden: number,
                data: Partial<T>
              ) => Promise<T | null>,
              deleteFn: deleteOtroGastoPlanilla as (
                idfecha: number,
                orden: number
              ) => Promise<void>,
            };
          default:
            throw new Error("Tipo de entidad no soportado");
        }
      })();

      // 1. Primero procesar eliminaciones
      for (const item of deletedItems) {
        await deleteFn(item.idfecha, item.orden);
      }

      // 2. Luego procesar adiciones y actualizaciones
      for (const item of data) {
        // Si el item tiene ID o fhcarga, es una actualización
        if (item.id !== undefined || item.fhcarga !== undefined) {
          await updateFn(item.idfecha, item.orden, item);
        } else {
          // Si no tiene ID ni fhcarga, es una nueva entidad
          await addFn(item);
        }
      }

      // Limpiar el array de items eliminados después de guardar
      setDeletedItems([]);

      // Notificar éxito
      onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar cambios";
      onError?.(errorMessage);
    } finally {
      setIsEditing(false);
    }
  };

  return {
    data,
    isEditing,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleSave,
  };
}
