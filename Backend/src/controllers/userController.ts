import { Request, Response } from "express";
import User from "../models/UserModel";

// Crear usuario
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, enabled } = req.body;

    // Validar campos obligatorios
    if (!firstName || !lastName || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Todos los campos obligatorios deben ser llenados." });
    }

    // Crear nuevo usuario
    const newUser = await User.create({
      firstName,
      lastName,
      email,
      password,
      role,
      enabled: enabled !== undefined ? enabled : true, // Habilitado por defecto
    });

    return res
      .status(201)
      .json({ message: "Usuario creado exitosamente.", user: newUser });
  } catch (error: any) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ message: "El email ya está registrado.", error });
    }
    return res
      .status(500)
      .json({ message: "Error al crear el usuario.", error });
  }
};

// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // Excluye la contraseña
    return res.status(200).json(users);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener los usuarios.", error });
  }
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, role, enabled } = req.body;

    // Validar campos obligatorios
    if (!firstName || !lastName || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Todos los campos obligatorios deben ser llenados." });
    }

    // Actualizar usuario
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { firstName, lastName, email, password, role, enabled },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res
      .status(200)
      .json({
        message: "Usuario actualizado exitosamente.",
        user: updatedUser,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al actualizar el usuario.", error });
  }
};

// Eliminar usuario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    return res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al eliminar el usuario.", error });
  }
};
