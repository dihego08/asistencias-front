import api from "./api";

const ENDPOINT = "/tipos_permisos";

export async function getTiposPermisos() {
  const res = await api.get(ENDPOINT);
  return res.data;
}

export async function createTipoPermiso(data) {
  const res = await api.post(ENDPOINT, data);
  return res.data;
}

export async function updateTipoPermiso(id, data) {
  const res = await api.put(`${ENDPOINT}/${id}`, data);
  return res.data;
}

export async function deleteTipoPermiso(id) {
  const res = await api.delete(`${ENDPOINT}/${id}`);
  return res.data;
}
