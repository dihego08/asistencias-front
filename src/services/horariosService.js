import api from "./api";

const ENDPOINT = "/horarios";

export async function getHorarios() {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createHorario(data) {
  const res = await api.post(ENDPOINT, data);
  return res.data;
}

export async function updateHorario(id, data) {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
}

export async function deleteHorario(id) {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}
export async function actualizarEstadoHorario(id, estado) {
  const res = await api.put(`${ENDPOINT}/${id}/estado`, { estado });
  return res.data;
}

