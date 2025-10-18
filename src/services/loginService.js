import api from "./api";

const ENDPOINT = "/login";

export async function loginUser(credentials) {
  const res = await api.post(ENDPOINT, credentials);
  return res.data;
}

export async function getPerfil() {
  const res = await api.get("/perfil");
  return res.data;
}
