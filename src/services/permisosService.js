import api from "./api";

const ENDPOINT = "/permisos";

export async function getPermisos() {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createPermiso(data) {
  const res = await api.post(ENDPOINT, data);
  return res.data;
}

export async function updatePermiso(id, data) {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
}

export async function deletePermiso(id) {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}

export async function actualizarEstadoPermiso(id, estado) {
  const res = await api.put(`${ENDPOINT}/${id}/estado`, { estado });
  return res.data;
}