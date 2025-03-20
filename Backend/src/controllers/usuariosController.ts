import { Request, Response } from "express";
import {
  getAllUsuarios,
  getUsuarioById,
  getUsuarioByEmail,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  comparePassword,
} from "../models/usuariosModel";
import { generateToken } from "../utils/jwt";
import bcrypt from "bcryptjs";

// 🔑 **Login de usuario**
// 🔑 Login de usuario
export const loginUsuario = async (req: Request, res: Response) => {
  try {
    console.log("📥 Datos recibidos en login:", req.body);

    const { email, contrasenia } = req.body;

    if (!email || !contrasenia) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios." });
    }

    const usuario = await getUsuarioByEmail(email);

    console.log("🔍 Usuario encontrado en BD:", usuario); // Muestra si se encontró el usuario

    if (!usuario || !usuario.contrasenia) {
      return res.status(400).json({ message: "Credenciales incorrectas." });
    }

    console.log("🔐 Contraseña ingresada:", contrasenia);
    console.log("🔐 Contraseña en BD (hash):", usuario.contrasenia);

    const isMatch = await comparePassword(contrasenia, usuario.contrasenia);

    console.log("🔐 ¿Contraseña correcta?:", isMatch);

    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales incorrectas." });
    }

    const token = generateToken(
      usuario.idusuario?.toString() ?? "0",
      usuario.email,
      usuario.perfil ?? 1
    );

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        idusuario: usuario.idusuario,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        email: usuario.email,
        perfil: usuario.perfil,
        habilitado: usuario.habilitado,
      },
    });
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error al iniciar sesión.", error });
  }
};

// 🆕 **Crear usuario**
export const createUsuarioController = async (req: Request, res: Response) => {
  try {
    const { nombre, apellido, email, contrasenia, perfil, habilitado } =
      req.body;

    if (!nombre || !apellido || !email || !contrasenia) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }

    // ❌ **Verificar si el email ya está en uso**
    const usuarioExistente = await getUsuarioByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    const newUser = await createUsuario({
      nombre,
      apellido,
      email,
      contrasenia,
      perfil: perfil ?? 1,
      habilitado: habilitado ?? 1,
    });

    return res.status(201).json({
      message: "Usuario creado exitosamente.",
      user: newUser,
    });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    return res.status(500).json({ message: "Error al crear usuario.", error });
  }
};

// 🔍 **Obtener todos los usuarios**
export const getUsuarios = async (req: Request, res: Response) => {
  try {
    const usuarios = await getAllUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("❌ Error al obtener los usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios.", error });
  }
};

// 🔍 **Obtener usuario por ID**
export const getUsuario = async (req: Request, res: Response) => {
  try {
    const usuario = await getUsuarioById(Number(req.params.id));

    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json(usuario);
  } catch (error) {
    console.error("❌ Error al obtener usuario:", error);
    res.status(500).json({ message: "Error al obtener el usuario.", error });
  }
};

// 🔄 **Actualizar usuario**
export const updateUsuarioController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const { contrasenia, perfil, habilitado, ...restoDatos } = req.body;
    const usuarioActualizado: any = { ...restoDatos };

    // ✅ **Convertimos `perfil` y `habilitado` a números si están presentes**
    if (perfil !== undefined) usuarioActualizado.perfil = Number(perfil);
    if (habilitado !== undefined)
      usuarioActualizado.habilitado = habilitado ? 1 : 0;

    // ✅ **Hashear contraseña solo si se envió una nueva**
    if (typeof contrasenia === "string" && contrasenia.trim()) {
      usuarioActualizado.contrasenia = await bcrypt.hash(contrasenia, 10);
    }

    const updatedUser = await updateUsuario(id, usuarioActualizado);
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json({
      message: "Usuario actualizado exitosamente.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el usuario.", error });
  }
};

// ❌ **Soft delete (marcar usuario como inactivo)**
export const deleteUsuarioController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    // ❌ **Evitar eliminar un usuario que ya está dado de baja**
    const usuario = await getUsuarioById(id);
    if (!usuario) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }
    if (usuario.fhbaja) {
      return res
        .status(400)
        .json({ message: "El usuario ya está desactivado." });
    }

    const deleted = await deleteUsuario(id);
    if (!deleted) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json({
      message: "Usuario eliminado exitosamente.",
    });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    return res
      .status(500)
      .json({ message: "Error al eliminar el usuario.", error });
  }
};
