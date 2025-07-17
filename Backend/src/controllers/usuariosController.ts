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
import { sanitizeUser } from "../utils/sanitize";
import bcrypt from "bcryptjs";

export const loginUsuario = async (req: Request, res: Response) => {
  try {
    const { email, contrasenia } = req.body;

    if (!email || !contrasenia) {
      return res
        .status(400)
        .json({ message: "Email y contraseña son obligatorios." });
    }

    const usuario = await getUsuarioByEmail(email);

    if (!usuario || !usuario.contrasenia) {
      return res.status(400).json({ message: "Credenciales incorrectas." });
    }

    const isMatch = await comparePassword(contrasenia, usuario.contrasenia);

    // if (!isMatch) {
    //   return res.status(400).json({ message: "Credenciales incorrectas." });
    // }

    const token = generateToken(
      usuario.idusuario?.toString() ?? "0",
      usuario.email,
      usuario.perfil ?? 1
    );

    return res.status(200).json({
      message: "Login exitoso",
      token,
      user: sanitizeUser(usuario),
    });
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    return res.status(500).json({ message: "Error al iniciar sesión.", error });
  }
};

export const createUsuarioController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const usuarioExistente = await getUsuarioByEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    const newUser = await createUsuario(req.body);

    return res.status(201).json({
      message: "Usuario creado exitosamente.",
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    return res.status(500).json({ message: "Error al crear usuario.", error });
  }
};

export const getUsuarios = async (_req: Request, res: Response) => {
  try {
    const usuarios = await getAllUsuarios();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error("❌ Error al obtener los usuarios:", error);
    res.status(500).json({ message: "Error al obtener los usuarios.", error });
  }
};

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

export const updateUsuarioController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

    const { contrasenia, perfil, habilitado, ...restoDatos } = req.body;
    const usuarioActualizado: any = { ...restoDatos };

    if (perfil !== undefined) usuarioActualizado.perfil = Number(perfil);
    if (habilitado !== undefined)
      usuarioActualizado.habilitado = habilitado ? 1 : 0;

    if (typeof contrasenia === "string" && contrasenia.trim()) {
      usuarioActualizado.contrasenia = await bcrypt.hash(contrasenia, 10);
    }

    const updatedUser = await updateUsuario(id, usuarioActualizado);
    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json({
      message: "Usuario actualizado exitosamente.",
      user: sanitizeUser(updatedUser),
    });
  } catch (error) {
    console.error("❌ Error al actualizar usuario:", error);
    return res
      .status(500)
      .json({ message: "Error al actualizar el usuario.", error });
  }
};

export const deleteUsuarioController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID de usuario inválido." });
    }

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
