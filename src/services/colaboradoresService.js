import api from "./api";

const ENDPOINT = "/colaboradores";

export async function getColaboradores() {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createColaborador(data) {
  const res = await api.post(ENDPOINT, data);
  return res.data;
}

export async function updateColaborador(id, data) {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
}

export async function deleteColaborador(id) {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}
export async function actualizarEstadoColaborador(id, estado) {
  const res = await api.put(`${ENDPOINT}/${id}/estado`, { estado });
  return res.data;
}
export async function actualizarMarcacionColaborador(id, marcacion) {
  const res = await api.put(`${ENDPOINT}/${id}/marcacion`, { marcacion });
  return res.data;
}
