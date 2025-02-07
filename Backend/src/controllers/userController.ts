import { Request, Response } from "express";
import User from "../models/UserModel";

// Crear usuario
export const createUser = async (req: Request, res: Response) => {
  try {
    const users = Array.isArray(req.body) ? req.body : [req.body];

    for (const user of users) {
      const { firstName, lastName, email, password, role } = user;
      if (!firstName || !lastName || !email || !password || !role) {
        return res.status(400).json({
          message: "Todos los campos obligatorios deben ser llenados.",
          user,
        });
      }
    }

    const newUsers = await User.insertMany(users);
    return res.status(201).json({
      message: "Usuarios creados exitosamente.",
      users: newUsers,
    });
  } catch (error: any) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Uno o más emails ya están registrados.",
        error,
      });
    }
    return res.status(500).json({ message: "Error al crear usuarios.", error });
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

    return res.status(200).json({
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
