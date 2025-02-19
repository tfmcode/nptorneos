export interface Venue {
  _id: string;
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
  [key: string]: unknown;
}

export interface VenueInput {
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
}
