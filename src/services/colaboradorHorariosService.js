import api from "./api";

const ENDPOINT = "/colaborador_horario";
export async function createColaboradorHorario(data) {
  const res = await api.post(ENDPOINT, data);
  return res.data;
}
export async function getColaboradorHorario() {
  const res = await api.get(ENDPOINT);
  return res.data;
}
export async function actualizarEstadoColaboradorHorario(id, estado) {
  const res = await api.put(`${ENDPOINT}/${id}/estado`, { estado });
  return res.data;
}
export async function updateColaboradorHorario(id, data) {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
}

export async function deleteColaboradorHorario(id) {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}
