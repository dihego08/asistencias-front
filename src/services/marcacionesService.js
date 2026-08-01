import api from "./api";

const ENDPOINT = "/marcaciones";

export async function insertarMarcacion(data) {
  // data será un objeto: { dni, fecha_hora, estado, reloj_ip }
  // Lo enviamos como array porque el backend espera un batch (POST /marcaciones/batch)
  const res = await api.post(`${ENDPOINT}/batch`, [data]);
  return res.data;
}
