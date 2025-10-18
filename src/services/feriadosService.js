import api from "./api";

const ENDPOINT = "/feriados";

export async function getFeriados() {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createFeriado(data) {
  const res = await api.post(ENDPOINT, data);
  return res.data;
}

export async function updateFeriado(id, data) {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
}

export async function deleteFeriado(id) {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}

export async function actualizarEstadoFeriado(id, estado) {
  const res = await api.put(`${ENDPOINT}/${id}/estado`, { estado });
  return res.data;
}