
import api from "./api";

const ENDPOINT = "/reportes";


export async function reportByColaborador(data) {
  const res = await api.post(`${ENDPOINT}/colaborador`, data);
  return res.data;
}
export async function reportByDia(data) {
  const res = await api.post(`${ENDPOINT}/dia`, data);
  return res.data;
}
export async function reportByDias(data) {
  const res = await api.post(`${ENDPOINT}/dias`, data);
  return res.data;
}