import { useEffect, useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import alertify from "alertifyjs";
import Switch from "react-switch";
import {
	createHorario,
	deleteHorario,
	getHorarios,
	updateHorario,
	actualizarEstadoHorario
} from "../services/horariosService";

export default function Horarios() {
	const [horarios, setHorarios] = useState([]);
	const [nombre, setNombre] = useState("");
	const [descripcion, setDescripcion] = useState("");
	const [tolerancia_min, setToleranciaMin] = useState("");
	const [estado, setEstado] = useState("A");
	const [show, setShow] = useState(false);
	const [idEdit, setIdEdit] = useState(null);
	const [loadingId, setLoadingId] = useState(null);
	const dias_semana = [
		{ dia: 1, nombre: "Lunes", activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" },
		{ dia: 2, nombre: "Martes", activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" },
		{ dia: 3, nombre: "Miércoles", activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" },
		{ dia: 4, nombre: "Jueves", activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" },
		{ dia: 5, nombre: "Viernes", activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" },
		{ dia: 6, nombre: "Sábado", activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" },
		{ dia: 7, nombre: "Domingo", activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" },
	];
	const [dias, setDias] = useState(dias_semana);

	useEffect(() => {
		listar();
	}, []);

	const listar = async () => {
		const data = await getHorarios();
		setHorarios(data);
	};

	const handleHoraChange = (index, campo, valor) => {
		const updated = [...dias];
		updated[index][campo] = valor;
		setDias(updated);
	};

	const guardar = async () => {
		try {
			const payload = {
				nombre,
				descripcion,
				estado,
				tolerancia_min,
				dias: dias
					.filter((d) => d.activo)
					.map((d) => ({
						dia: d.dia,
						activo: d.activo,
						hora_entrada: d.hora_entrada,
						hora_salida: d.hora_salida,
						usa_refrigerio: d.usaRefrigerio,
						hora_inicio_refrigerio: d.usaRefrigerio ? d.hora_inicio_refrigerio : null,
						hora_fin_refrigerio: d.usaRefrigerio ? d.hora_fin_refrigerio : null,
					})),
			};

			let res = null;
			if (idEdit) {
				res = await updateHorario(idEdit, payload);
			} else {
				res = await createHorario(payload);
			}

			if (res.status === "success") {
				alertify.success(res.message);
				listar();
				cerrarModal();
			} else {
				alertify.error(res.message);
			}
		} catch (err) {
			alertify.error("Error al intentar guardar el horario " + err);
		}
	};

	const cerrarModal = () => {
		setIdEdit(null);
		setNombre("");
		setDescripcion("");
		setToleranciaMin("");
		setEstado("A");
		setShow(false);
		setDias(dias.map(d => ({ ...d, activo: false, hora_entrada: "", hora_salida: "", usaRefrigerio: false, hora_inicio_refrigerio: "", hora_fin_refrigerio: "" })));
	};

	const editar = (horario) => {

		setIdEdit(horario.id);
		setNombre(horario.nombre);
		setDescripcion(horario.descripcion);
		setToleranciaMin(horario.tolerancia_min);
		setEstado(horario.estado);
		// Reconstruimos los días asegurando que estén en formato numérico (1 a 7)
		const diasMapeados = [1, 2, 3, 4, 5, 6, 7].map((numeroDia) => {
			const diaEncontrado = horario.dias.find((d) => d.dia_semana === numeroDia);

			return {
				dia: numeroDia,
				nombre: dias_semana[numeroDia - 1].nombre,
				activo: diaEncontrado ? diaEncontrado.activo : 0,
				hora_entrada: diaEncontrado?.hora_entrada || "",
				hora_salida: diaEncontrado?.hora_salida || "",
				usaRefrigerio: diaEncontrado ? diaEncontrado.descanso : 0,
				hora_inicio_refrigerio: diaEncontrado?.hora_inicio_refrigerio || "",
				hora_fin_refrigerio: diaEncontrado?.hora_fin_refrigerio || "",
			};
		});
		setDias(diasMapeados);
		setShow(true);
	};

	const eliminar = async (horario) => {
		alertify.confirm(
			"Confirmar eliminación",
			`¿Seguro que deseas eliminar el horario <b>${horario.descripcion}</b>?`,
			async function () {
				try {
					const res = await deleteHorario(horario.id);
					if (res.status === "success") {
						alertify.success(res.message);
						listar();
					} else {
						alertify.error(res.message);
					}
				} catch (err) {
					alertify.error("Error al intentar eliminar el horario");
				}
			},
			function () {
				alertify.message("Acción cancelada");
			}
		);
	};
	const handleEstadoChange = async (id, nuevoEstado) => {
		setLoadingId(id);
		try {
			const res = await actualizarEstadoHorario(id, nuevoEstado ? 1 : 0);
			if (res.status === "success") {
				// ✅ Actualizamos visualmente el estado del horario en el frontend
				setHorarios((prevHorarios) =>
					prevHorarios.map((h) =>
						h.id === id ? { ...h, estado: nuevoEstado ? 1 : 0 } : h
					)
				);
				alertify.success(res.message);
			} else {
				alertify.error(res.message);
			}
		} catch (err) {
			console.error("Error al actualizar el estado:", err);
			alertify.error("Error al actualizar el estado");
		} finally {
			setLoadingId(null);
		}
	};
	return (
		<div>
			<h1 className="h3 mb-4 text-gray-800">Horarios</h1>
			<div className="row">
				<div className="col-md-12 text-right mb-3">
					<span
						className="btn btn-outline-primary btn-rounded"
						onClick={() => setShow(true)}
					>
						<i className="fa fa-plus"></i> Nuevo Horario
					</span>
				</div>

				<div className="table-responsive w-100">
					<table className="table table-bordered table-striped">
						<thead>
							<tr>
								<th>Id</th>
								<th>Nombre</th>
								<th>Descripción</th>
								<th>Tolerancia (Min)</th>
								<th>Estado</th>
								<th width="10%">Acciones</th>
							</tr>
						</thead>
						<tbody>
							{horarios.map((c) => (
								<tr key={c.id}>
									<td>{c.id}</td>
									<td>{c.nombre}</td>
									<td>{c.descripcion}</td>
									<td>{c.tolerancia_min}</td>
									<td>
										<Switch
											checked={c.estado === 1}
											onChange={(checked) => handleEstadoChange(c.id, checked)}
											onColor="#28a745"
											offColor="#ccc"
											uncheckedIcon={false}
											checkedIcon={false}
											disabled={loadingId === c.id}
										/>
									</td>
									<td>
										<span
											className="btn btn-outline-warning btn-sm d-block mb-1"
											onClick={() => editar(c)}
										>
											<i className="fa fa-edit"></i>
										</span>
										<span
											className="btn btn-outline-danger btn-sm d-block"
											onClick={() => eliminar(c)}
										>
											<i className="fa fa-trash"></i>
										</span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Modal */}
			<Modal show={show} onHide={cerrarModal} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>{idEdit ? "Editar Horario" : "Nuevo Horario"}</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group className="mb-3">
							<Form.Label>Nombre</Form.Label>
							<Form.Control
								type="text"
								value={nombre}
								onChange={(e) => setNombre(e.target.value)}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Descripción</Form.Label>
							<Form.Control
								type="text"
								value={descripcion}
								onChange={(e) => setDescripcion(e.target.value)}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Tolerancia (Min.)</Form.Label>
							<Form.Control
								type="text"
								value={tolerancia_min}
								onChange={(e) => setToleranciaMin(e.target.value)}
							/>
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Estado</Form.Label>
							<div>
								<Switch
									checked={estado === 1}
									onChange={(checked) => setEstado(checked ? 1 : 0)}
									onColor="#4CAF50"
									offColor="#ccc"
									checkedIcon={
										<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
											<i className="fa fa-check text-white"></i>
										</div>
									}
									uncheckedIcon={
										<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
											<i className="fa fa-times text-white"></i>
										</div>
									}
								/>
								<span className="ms-2 align-items-center">
									<i
										className={`fa ${estado === 1 ? "fa-check-circle text-success" : "fa-times-circle text-danger"} me-1`}
									></i>
									{estado === 1 ? "Activo" : "Inactivo"}
								</span>
							</div>
						</Form.Group>

						<h5 className="mt-4 mb-3">Días del horario</h5>
						<div className="table-responsive">
							<table className="table table-sm table-bordered align-middle">
								<thead className="table-light">
									<tr>
										<th>Día</th>
										<th>Activo</th>
										<th>Inicio</th>
										<th>Fin</th>
										<th>Usa Refrigerio</th>
										<th>Inicio Ref.</th>
										<th>Fin Ref.</th>
									</tr>
								</thead>
								<tbody>
									{dias.map((d, i) => (
										<tr key={d.dia}>
											<td>{d.nombre}</td>

											{/* Switch para activar día */}
											<td className="text-center">
												<Switch
													checked={d.activo === 1}
													onChange={() =>
														handleHoraChange(i, "activo", d.activo === 1 ? 0 : 1)
													}
													onColor="#4CAF50"
													offColor="#ccc"
													checkedIcon={false}
													uncheckedIcon={false}
												/>
											</td>

											<td>
												<input
													type="time"
													disabled={d.activo !== 1}
													value={d.hora_entrada}
													onChange={(e) =>
														handleHoraChange(i, "hora_entrada", e.target.value)
													}
												/>
											</td>

											<td>
												<input
													type="time"
													disabled={d.activo !== 1}
													value={d.hora_salida}
													onChange={(e) =>
														handleHoraChange(i, "hora_salida", e.target.value)
													}
												/>
											</td>

											{/* Switch para activar refrigerio */}
											<td className="text-center">
												<Switch
													checked={d.usaRefrigerio === 1}
													onChange={() =>
														handleHoraChange(i, "usaRefrigerio", d.usaRefrigerio === 1 ? 0 : 1)
													}
													onColor="#FF9800"
													offColor="#ccc"
													checkedIcon={false}
													uncheckedIcon={false}
													disabled={d.activo !== 1}
												/>
											</td>

											<td>
												<input
													type="time"
													disabled={d.activo !== 1 || d.usaRefrigerio !== 1}
													value={d.hora_inicio_refrigerio}
													onChange={(e) =>
														handleHoraChange(i, "hora_inicio_refrigerio", e.target.value)
													}
												/>
											</td>

											<td>
												<input
													type="time"
													disabled={d.activo !== 1 || d.usaRefrigerio !== 1}
													value={d.hora_fin_refrigerio}
													onChange={(e) =>
														handleHoraChange(i, "hora_fin_refrigerio", e.target.value)
													}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-danger" onClick={cerrarModal}>
						Cancelar
					</Button>
					<Button variant="outline-success" onClick={guardar}>
						Guardar
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}
