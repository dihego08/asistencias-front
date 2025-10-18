import axios from "axios";

const api = axios.create({
  baseURL: "http://apiasistencias.dbusinessaqp.com/", // ajusta a tu backend
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
