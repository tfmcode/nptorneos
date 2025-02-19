import mongoose, { Schema, Document } from "mongoose";

interface IVenue extends Document {
  name: string;
  address: string;
  postalCode: string;
  locality: string;
  province: string;
  phone: string;
  email: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  contactCellphone: string;
  enabled: boolean;
  showMap?: boolean;
  latitude?: string;
  longitude?: string;
  description?: string;
}

const venueSchema = new Schema<IVenue>(
  {
    name: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    locality: { type: String, required: true },
    province: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    contactName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    contactCellphone: { type: String, required: true },
    enabled: { type: Boolean, default: true },
    showMap: { type: Boolean, default: false },
    latitude: { type: String, default: "" },
    longitude: { type: String, default: "" },
    description: { type: String, default: "" },
  },
  { timestamps: true }
);

const Venue = mongoose.model<IVenue>("Venue", venueSchema);

export { Venue, IVenue };
