import { pool } from "../config/db";
import bcrypt from "bcryptjs";

export interface IUsuario {
  idusuario?: number;
  nombre: string;
  apellido: string;
  email: string;
  contrasenia?: string;
  habilitado?: number;
  fhcarga?: Date;
  perfil?: number;
  fhbaja?: Date | null;
}

// 🔍 Obtener todos los usuarios (excluyendo los eliminados)
export const getAllUsuarios = async (): Promise<IUsuario[]> => {
  const { rows } = await pool.query(
    `SELECT idusuario, nombre, apellido, email, habilitado, perfil, fhcarga, fhbaja 
     FROM usuarios 
     WHERE fhbaja IS NULL 
     ORDER BY idusuario DESC;`
  );
  return rows;
};

// 🔍 Obtener un usuario por ID
export const getUsuarioById = async (id: number): Promise<IUsuario | null> => {
  if (isNaN(id)) {
    console.error("❌ Error: ID de usuario inválido.");
    return null;
  }

  const { rows } = await pool.query(
    `SELECT idusuario, nombre, apellido, email, habilitado, perfil, fhcarga, fhbaja 
     FROM usuarios 
     WHERE idusuario = $1 AND fhbaja IS NULL;`,
    [id]
  );
  return rows.length > 0 ? rows[0] : null;
};

// 🔍 Obtener un usuario por email
export const getUsuarioByEmail = async (
  email: string
): Promise<IUsuario | null> => {
  if (!email) {
    console.error("❌ Error: Email inválido.");
    return null;
  }

  const { rows } = await pool.query(
    `SELECT idusuario, nombre, apellido, email, contrasenia, habilitado, perfil, fhcarga, fhbaja 
     FROM usuarios 
     WHERE email = $1 AND fhbaja IS NULL;`,
    [email]
  );
  return rows.length > 0 ? rows[0] : null;
};

// 🔐 Hashear la contraseña antes de guardar un usuario
const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// 🆕 Crear un usuario
export const createUsuario = async (usuario: IUsuario): Promise<IUsuario> => {
  if (!usuario.contrasenia) {
    throw new Error("La contraseña es obligatoria.");
  }

  const hashedPassword = await hashPassword(usuario.contrasenia);

  const { rows } = await pool.query(
    `INSERT INTO usuarios (nombre, apellido, email, contrasenia, habilitado, perfil) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING idusuario, nombre, apellido, email, habilitado, perfil, fhcarga;`,
    [
      usuario.nombre,
      usuario.apellido,
      usuario.email,
      hashedPassword,
      usuario.habilitado ?? 1,
      usuario.perfil ?? 1,
    ]
  );

  return rows[0];
};

// 🔄 **Actualizar un usuario (Hashea la contraseña solo si es actualizada)**
export const updateUsuario = async (
  id: number,
  usuario: Partial<IUsuario>
): Promise<IUsuario | null> => {
  if (isNaN(id)) {
    throw new Error("ID de usuario inválido.");
  }

  const updates: string[] = [];
  const values: any[] = [];
  let index = 1;

  // ✅ **Verificamos que `contrasenia` sea una cadena antes de hashearla**
  if (typeof usuario.contrasenia === "string" && usuario.contrasenia.trim()) {
    usuario.contrasenia = await hashPassword(usuario.contrasenia);
  }

  for (const key in usuario) {
    if (usuario[key as keyof IUsuario] !== undefined) {
      updates.push(`${key} = $${index}`);
      values.push(usuario[key as keyof IUsuario]);
      index++;
    }
  }

  if (updates.length === 0) {
    throw new Error("No hay datos para actualizar.");
  }

  const query = `UPDATE usuarios SET ${updates.join(
    ", "
  )} WHERE idusuario = $${index} RETURNING *;`;
  values.push(id);

  const { rows } = await pool.query(query, values);
  return rows.length > 0 ? rows[0] : null;
};

// ❌ **Soft Delete (Marcar usuario como inactivo)**
export const deleteUsuario = async (id: number): Promise<boolean> => {
  try {
    const result = await pool.query(
      "UPDATE usuarios SET fhbaja = NOW() WHERE idusuario = $1 AND fhbaja IS NULL;",
      [id]
    );

    // ✅ Convertimos `rowCount` a número con `?? 0` para evitar valores nulos
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    throw new Error("Error al eliminar usuario.");
  }
};

// 🔑 **Comparar contraseña en login**
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};
