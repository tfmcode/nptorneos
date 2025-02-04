import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5001", // Cambia esta URL según tu entorno
  headers: {
    "Content-Type": "application/json",
  },
});

export default API;
