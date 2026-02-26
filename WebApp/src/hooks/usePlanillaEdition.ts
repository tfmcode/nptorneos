import { useState, useEffect, useCallback, useRef } from "react";
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
  hasChanges: boolean;
  handleAdd: (newItem?: Partial<T>) => void;
  handleUpdate: (index: number, field: keyof T, value: unknown) => void;
  handleDelete: (index: number) => void;
  handleSave: () => Promise<void>;
  resetChanges: () => void;
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
  const [hasChanges, setHasChanges] = useState(false);
  const isSavingRef = useRef(false);

  useEffect(() => {
    setData(initialData);
    setDeletedItems([]);
    setHasChanges(false);
  }, [initialData]);

  const getNextOrden = useCallback((): number => {
    if (data.length === 0) return 1;
    const maxOrden = Math.max(...data.map((item) => item.orden));
    return maxOrden + 1;
  }, [data]);

  const createEmptyEntity = useCallback((): T => {
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
  }, [entityType, idfecha, getNextOrden]);

  const handleAdd = useCallback(
    (newItem?: Partial<T>) => {
      const baseEntity = createEmptyEntity();
      const newEntity = newItem ? { ...baseEntity, ...newItem } : baseEntity;
      setData((prev) => [...prev, newEntity as T]);
      setHasChanges(true);
    },
    [createEmptyEntity]
  );

  const handleUpdate = useCallback(
    (index: number, field: keyof T, value: unknown) => {
      setData((prev) => {
        const newData = [...prev];
        newData[index] = {
          ...newData[index],
          [field]: value,
        };
        return newData;
      });
      setHasChanges(true);
    },
    []
  );

  const handleDelete = useCallback((index: number) => {
    setData((prev) => {
      const itemToDelete = prev[index];

      if (itemToDelete.id !== undefined || itemToDelete.fhcarga !== undefined) {
        setDeletedItems((deleted) => [...deleted, itemToDelete]);
      }

      return prev.filter((_, i) => i !== index);
    });
    setHasChanges(true);
  }, []);

  const resetChanges = useCallback(() => {
    setData(initialData);
    setDeletedItems([]);
    setHasChanges(false);
  }, [initialData]);

  const handleSave = async () => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setIsEditing(true);

    try {
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

      for (const item of deletedItems) {
        await deleteFn(item.idfecha, item.orden);
      }

      for (const item of data) {
        if (item.id !== undefined || item.fhcarga !== undefined) {
          await updateFn(item.idfecha, item.orden, item);
        } else {
          await addFn(item);
        }
      }

      setDeletedItems([]);
      setHasChanges(false);

      await onSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Error al guardar cambios";
      onError?.(errorMessage);
    } finally {
      isSavingRef.current = false;
      setIsEditing(false);
    }
  };

  return {
    data,
    isEditing,
    hasChanges,
    handleAdd,
    handleUpdate,
    handleDelete,
    handleSave,
    resetChanges,
  };
}
