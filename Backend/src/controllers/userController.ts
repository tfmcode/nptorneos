import { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User, IUser } from "../models/userModel";
import { generateToken } from "../utils/jwt";

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 🔹 Buscar usuario por email con el tipo correcto
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Credenciales incorrectas." });
    }

    // 🔹 Usar `comparePassword()` del modelo en lugar de `bcrypt.compare()`
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales incorrectas." });
    }

    // ✅ Convertir `_id` a string antes de generar el token
    const userId = user._id.toString();

    // Generar token JWT
    const token = generateToken(userId, user.email, user.role);

    res.status(200).json({
      message: "Login exitoso",
      token,
      user: {
        _id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        enabled: user.enabled,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al iniciar sesión.", error });
  }
};

// 🔹 Crear usuario
export const createUser = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, password, role, enabled } = req.body;

    if (!firstName || !lastName || !email || !password || !role) {
      return res
        .status(400)
        .json({ message: "Todos los campos obligatorios deben ser llenados." });
    }

    // Verificar si el email ya está registrado
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "El email ya está registrado." });
    }

    // Hashear la contraseña antes de guardarla
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword, // ✅ Guardamos la contraseña encriptada
      role,
      enabled,
    });

    await newUser.save();

    return res.status(201).json({
      message: "Usuario creado exitosamente.",
      user: {
        _id: newUser._id,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        role: newUser.role,
        enabled: newUser.enabled,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear usuario.", error });
  }
};

// 🔹 Obtener todos los usuarios (sin contraseña)
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find().select("-password"); // ✅ Excluir la contraseña
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener los usuarios.", error });
  }
};

// 🔹 Actualizar usuario
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, email, password, role, enabled } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    if (!firstName || !lastName || !email || !role) {
      return res
        .status(400)
        .json({ message: "Todos los campos obligatorios deben ser llenados." });
    }

    const updateFields: any = { firstName, lastName, email, role, enabled };

    // ✅ Solo actualizar la contraseña si es diferente a la almacenada
    if (password) {
      const existingUser = await User.findById(id);
      if (!existingUser) {
        return res.status(404).json({ message: "Usuario no encontrado." });
      }

      const isSamePassword = await bcrypt.compare(
        password,
        existingUser.password
      );
      if (!isSamePassword) {
        updateFields.password = await bcrypt.hash(password, 10);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    }).select("-password");

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

// 🔹 Eliminar usuario
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

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
