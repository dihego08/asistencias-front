import api from "./api";

const ENDPOINT = "/relojes";

export async function getRelojes() {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createReloj(data) {
  const res = await api.post(ENDPOINT, data);
  return res.data;
}

export async function updateReloj(id, data) {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
}

export async function deleteReloj(id) {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}

export async function actualizarEstadoReloj(id, estado) {
  const res = await api.put(`${ENDPOINT}/${id}/estado`, { estado });
  return res.data;
}