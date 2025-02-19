import { Request, Response } from "express";
import mongoose from "mongoose";
import { Venue } from "../models/venueModel";

// 📌 Crear una nueva sede
export const createVenue = async (req: Request, res: Response) => {
  try {
    const {
      name,
      address,
      postalCode,
      locality,
      province,
      phone,
      email,
      contactName,
      contactEmail,
      contactPhone,
      contactCellphone,
      enabled,
      ...optionalFields
    } = req.body;

    if (
      !name ||
      !address ||
      !postalCode ||
      !locality ||
      !province ||
      !phone ||
      !email ||
      !contactName ||
      !contactEmail ||
      !contactPhone ||
      !contactCellphone
    ) {
      return res.status(400).json({
        message: "Todos los campos obligatorios deben completarse.",
      });
    }

    const newVenue = new Venue({
      name,
      address,
      postalCode,
      locality,
      province,
      phone,
      email,
      contactName,
      contactEmail,
      contactPhone,
      contactCellphone,
      enabled,
      ...optionalFields,
    });

    await newVenue.save();

    return res
      .status(201)
      .json({ message: "Sede creada exitosamente.", venue: newVenue });
  } catch (error) {
    return res.status(500).json({ message: "Error al crear la sede.", error });
  }
};

// 📌 Obtener todas las sedes (con paginación y búsqueda)
export const getVenues = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10", search = "" } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const query: any = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const venues = await Venue.find(query)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    const total = await Venue.countDocuments(query);

    res.status(200).json({ venues, total });
  } catch (error) {
    res.status(500).json({ message: "Error al obtener sedes.", error });
  }
};

// 📌 Obtener una sede por ID
export const getVenueById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const venue = await Venue.findById(id);
    if (!venue) {
      return res.status(404).json({ message: "Sede no encontrada." });
    }

    return res.status(200).json(venue);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener la sede.", error });
  }
};

// 📌 Actualizar sede
export const updateVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      postalCode,
      locality,
      province,
      phone,
      email,
      contactName,
      contactEmail,
      contactPhone,
      contactCellphone,
      enabled,
      ...optionalFields
    } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const updatedVenue = await Venue.findByIdAndUpdate(
      id,
      {
        name,
        address,
        postalCode,
        locality,
        province,
        phone,
        email,
        contactName,
        contactEmail,
        contactPhone,
        contactCellphone,
        enabled,
        ...optionalFields,
      },
      { new: true }
    );

    if (!updatedVenue) {
      return res.status(404).json({ message: "Sede no encontrada." });
    }

    return res
      .status(200)
      .json({ message: "Sede actualizada exitosamente.", venue: updatedVenue });
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar la sede.", error });
  }
};

// 📌 Eliminar sede
export const deleteVenue = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID inválido." });
    }

    const deletedVenue = await Venue.findByIdAndDelete(id);

    if (!deletedVenue) {
      return res.status(404).json({ message: "Sede no encontrada." });
    }

    return res.status(200).json({ message: "Sede eliminada exitosamente." });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar la sede.", error });
  }
};
