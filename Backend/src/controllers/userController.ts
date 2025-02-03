import { Request, Response } from "express";
import User, { IUser } from "../models/UserModel";

// Crear uno o varios usuarios
export const createUser = async (req: Request, res: Response) => {
  try {
    const users = req.body;

    // Verificar si es un array o un único usuario
    if (!Array.isArray(users)) {
      const { name, email, password } = users;

      if (!name || !email || !password) {
        return res
          .status(400)
          .json({ message: "Todos los campos son obligatorios." });
      }

      // Intentar crear el usuario y manejar errores por duplicado
      try {
        const newUser = await User.create({ name, email, password });
        return res
          .status(201)
          .json({ message: "Usuario creado exitosamente.", user: newUser });
      } catch (err: any) {
        if (err.code === 11000) {
          return res.status(400).json({
            message: `El email ${email} ya está registrado.`,
            error: err,
          });
        }
        throw err;
      }
    }

    // Filtrar duplicados y usuarios inválidos en un array
    const invalidUsers: IUser[] = [];
    const validUsers = users.filter((user: IUser) => {
      const { name, email, password } = user;

      if (!name || !email || !password) {
        invalidUsers.push(user);
        return false;
      }

      return true;
    });

    // Intentar insertar múltiples usuarios
    const insertedUsers: IUser[] = [];
    const duplicateUsers: IUser[] = [];

    for (const user of validUsers) {
      try {
        const newUser = await User.create(user);
        insertedUsers.push(newUser);
      } catch (err: any) {
        if (err.code === 11000) {
          duplicateUsers.push(user);
        } else {
          throw err;
        }
      }
    }

    // Responder con los resultados
    return res.status(201).json({
      message: "Operación completada.",
      insertedUsers,
      duplicateUsers,
      invalidUsers,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al crear el usuario(s).", error });
  }
};


// Obtener todos los usuarios
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios.", error });
  }
};

// Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, password },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "Usuario no encontrado." });
    }

    res.status(200).json({
      message: "Usuario actualizado exitosamente.",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar el usuario.", error });
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

    res.status(200).json({ message: "Usuario eliminado exitosamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar el usuario.", error });
  }
};
