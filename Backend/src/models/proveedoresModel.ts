import { pool } from "../config/db";

export interface IProveedor {
  id?: number;
  codtipo: number;
  nombre: string;
  domicilio?: string;
  cpostal?: string;
  localidad?: string;
  provincia?: string;
  telefono?: string;
  email?: string;
  celular?: string;
  valor_fijo?: number;
  fhcarga?: string;
  fhbaja?: string;
  valor_hora?: number;
  contrasenia?: string;
  sedes?: string;
  documento?: string;
  fhnac?: string;
  estcivil?: string;
  hijos?: string;
  estudios?: string;
  facebook?: string;
  nombrefiscal?: string;
  codcateg?: number;
  cuit: string; 
  pais?: string;
  fax?: string;
  contacto?: string;
  producto?: string;
  codtipogasto?: number;
  sumarhs?: number;
  created_at?: string;
  updated_at?: string;
}

export const getProveedorById = async (
  id: number
): Promise<IProveedor | null> => {
  const { rows } = await pool.query(
    `SELECT * FROM proveedores WHERE id = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getAllProveedores = async (
  page: number,
  limit: number,
  searchTerm: string
): Promise<{ proveedores: IProveedor[]; total: number }> => {
  const offset = (page - 1) * limit;

  let totalQuery: string;
  let proveedoresQuery: string;
  let params: any[];

  if (searchTerm) {
    totalQuery = `SELECT COUNT(*) FROM proveedores WHERE fhbaja IS NULL AND LOWER(nombre) LIKE LOWER($1);`;
    proveedoresQuery = `
      SELECT * FROM proveedores
      WHERE fhbaja IS NULL AND LOWER(nombre) LIKE LOWER($1)
      ORDER BY fhcarga DESC
      LIMIT $2 OFFSET $3;`;
    params = [`%${searchTerm}%`, limit, offset];
  } else {
    totalQuery = `SELECT COUNT(*) FROM proveedores WHERE fhbaja IS NULL;`;
    proveedoresQuery = `
      SELECT * FROM proveedores
      WHERE fhbaja IS NULL
      ORDER BY fhcarga DESC
      LIMIT $1 OFFSET $2;`;
    params = [limit, offset];
  }

  const totalResult = await pool.query(
    totalQuery,
    searchTerm ? [`%${searchTerm}%`] : []
  );
  const { rows } = await pool.query(proveedoresQuery, params);

  return {
    proveedores: rows,
    total: parseInt(totalResult.rows[0].count, 10),
  };
};

export const createProveedor = async (
  proveedor: IProveedor
): Promise<IProveedor> => {
  for (const key in proveedor) {
    if (proveedor[key as keyof IProveedor] === "" && key !== "cuit") {
      (proveedor as any)[key] = null;
    }
  }

  // ✅ CUIT obligatorio solo si codtipo === 4
  if (proveedor.codtipo === 4) {
    if (!proveedor.cuit || proveedor.cuit.trim() === "") {
      throw new Error(
        "El campo CUIT es obligatorio para proveedores tipo OTROS."
      );
    }
  } else {
    // Para ARBITRO, PROFESOR, SERV. MEDICO => cuit = "-"
    proveedor.cuit = "-";
  }

  const { rows } = await pool.query(
    `INSERT INTO proveedores (
      codtipo, nombre, domicilio, cpostal, localidad, provincia, telefono, email,
      celular, valor_fijo, valor_hora, contrasenia, sedes, documento, fhnac,
      estcivil, hijos, estudios, facebook, nombrefiscal, codcateg, cuit, pais,
      fax, contacto, producto, codtipogasto, sumarhs, fhcarga
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8,
      $9, $10, $11, $12, $13, $14, $15,
      $16, $17, $18, $19, $20, $21, $22, $23,
      $24, $25, $26, $27, $28, NOW()
    ) RETURNING *;`,
    [
      proveedor.codtipo,
      proveedor.nombre,
      proveedor.domicilio ?? null,
      proveedor.cpostal ?? null,
      proveedor.localidad ?? null,
      proveedor.provincia ?? null,
      proveedor.telefono ?? null,
      proveedor.email ?? null,
      proveedor.celular ?? null,
      proveedor.valor_fijo ?? 0,
      proveedor.valor_hora ?? 0,
      proveedor.contrasenia ?? null,
      proveedor.sedes ?? null,
      proveedor.documento ?? null,
      proveedor.fhnac ?? null,
      proveedor.estcivil ?? null,
      proveedor.hijos ?? null,
      proveedor.estudios ?? null,
      proveedor.facebook ?? null,
      proveedor.nombrefiscal ?? null,
      proveedor.codcateg ?? null,
      proveedor.cuit, 
      proveedor.pais ?? null,
      proveedor.fax ?? null,
      proveedor.contacto ?? null,
      proveedor.producto ?? null,
      proveedor.codtipogasto ?? 2,
      proveedor.sumarhs ?? 0,
    ]
  );
  return rows[0];
};

export const updateProveedor = async (
  id: number,
  proveedor: Partial<IProveedor>
): Promise<IProveedor | null> => {
  for (const key in proveedor) {
    if (proveedor[key as keyof IProveedor] === "" && key !== "cuit") {
      (proveedor as any)[key] = null;
    }
  }

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  for (const key in proveedor) {
    if (proveedor[key as keyof IProveedor] !== undefined && key !== "updated_at") {
      updates.push(`${key} = $${index}`);
      values.push(proveedor[key as keyof IProveedor]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  updates.push(`updated_at = NOW()`);

  values.push(id);
  const query = `UPDATE proveedores SET ${updates.join(", ")} WHERE id = $${index} RETURNING *;`;

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};


export const deleteProveedor = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE proveedores SET fhbaja = NOW() WHERE id = $1 AND fhbaja IS NULL;",
      [id]
    );
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar proveedor:", error);
    throw new Error("Error al eliminar el proveedor.");
  }
};
