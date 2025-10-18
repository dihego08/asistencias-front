import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { createColaboradorHorario, updateColaboradorHorario, getColaboradorHorario, actualizarEstadoColaboradorHorario,deleteColaboradorHorario } from "../services/colaboradorHorariosService";
import SelectColaborador from "../components/SelectColaborador";
import SelectHorario from "../components/SelectHorario";
import FechaPicker from "../components/FechaPicker"; // el componente anterior
import alertify from 'alertifyjs';
import Switch from "react-switch";

export default function AsignarHorarioModal() {
	const [colaboradorHorario, setColaboradorHorarios] = useState([]);
	const [fecha_inicio, setFechaInicio] = useState("");
	const [fecha_fin, setFechaFin] = useState("");
	const [show, setShow] = useState(false);
	const [id_colaborador, setIdColaborador] = useState("");
	const [id_horario, setIdHorario] = useState("");
	const [loadingId, setLoadingId] = useState(null);
	const [estado, setEstado] = useState("");
	const [idEdit, setIdEdit] = useState(null);

	useEffect(() => {
		listar();
	}, []);

	const listar = async () => {
		const data = await getColaboradorHorario();
		setColaboradorHorarios(data);
	};


	const handleEstadoChange = async (id, nuevoEstado) => {
		setLoadingId(id);
		try {
			const res = await actualizarEstadoColaboradorHorario(id, nuevoEstado ? 1 : 0);
			if (res.status === "success") {
				// ✅ Actualizamos visualmente el estado del horario en el frontend
				setColaboradorHorarios((prevFeriados) =>
					prevFeriados.map((h) =>
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
	const guardarAsignacion = async () => {
		try {
			if (!id_colaborador || !id_colaborador) {
				alertify.error("Debe seleccionar colaborador y horario");
				return;
			}

			const payload = {
				id_colaborador: id_colaborador,
				id_horario: id_horario,
				fecha_inicio: fecha_inicio || null,
				fecha_fin: fecha_fin || null,
				estado: estado
			};
			let res = null;
			if (idEdit) {
				res = await updateColaboradorHorario(idEdit, payload);
			} else {
				res = await createColaboradorHorario(payload);
			}
			console.log(res);
			if (res.status === "success") {
				alertify.success(res.message);
				listar();
				cerrarModal();
			} else {
				alertify.error(res.message);
			}
		} catch (err) {
			alertify.error("Error al intentar guardar el feriado " + err);
		}

	};

	const editar = (horario) => {
		setIdEdit(horario.id);
		setFechaInicio(horario.fecha_inicio ? new Date(`${horario.fecha_inicio}T00:00:00`) : null);
		setFechaFin(horario.fecha_fin ? new Date(`${horario.fecha_fin}T00:00:00`) : null);
		setIdColaborador(horario.id_colaborador);
		setIdHorario(horario.id_horario);
		setEstado(horario.estado);
		setShow(true); // control del modal
	};
	const cerrarModal = () => {
		setIdEdit(null);
		setFechaInicio("");
		setFechaFin("");
		setIdColaborador("");
		setEstado("");
		setIdHorario("");
		setShow(false);
	};
    const eliminar = async (horario) => {
        alertify.confirm(
            "Confirmar eliminación",
            "¿Seguro que deseas eliminar este horario?",
            async function () {
                try {
                    const res = await deleteColaboradorHorario(horario.id);

                    if (res.status === "success") {
                        alertify.success(res.message);
                        listar(); // refresca la lista
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
	return (
		<div>
			<h1 className="h3 mb-4 text-gray-800">Asignación de Horarios</h1>
			<div className="row">
				<div className="col-md-12 text-right mb-3">
					<span className="btn btn-outline-primary btn-rounded" data-toggle="modal"
						data-target="#formulario" onClick={() => setShow(true)}><i className="fa fa-plus"></i> Nueva Asignación de Horario</span>
				</div>
				<div className="table-response w-100">
					<table className="table table-bordered table-striped" id="tabla-marcas">
						<thead>
							<tr>
								<th>Id</th>
								<th>Colaborador</th>
								<th>Horario</th>
								<th>Fecha Inicio</th>
								<th>Fecha Fin</th>
								<th>Estado</th>
								<th width="5%"></th>
							</tr>
						</thead>
						<tbody>
							{colaboradorHorario.map((c) => (
								<tr key={c.id}>
									<td>{c.id}</td>
									<td>{c.colaborador !== null ? c.colaborador.apellido_paterno + " " + c.colaborador.apellido_materno + " " + c.colaborador.nombres : ""}</td>
									<td>{c.horario !== null ? c.horario.nombre : ""}</td>
									<td>{c.fecha_inicio}</td>
									<td>{c.fecha_fin}</td>
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
										<span className="btn btn-outline-warning btn-sm d-block mb-1" onClick={() => editar(c)}><i className="fa fa-edit"></i></span>
										<span className="btn btn-outline-danger btn-sm d-block" onClick={() => eliminar(c)}><i className="fa fa-trash"></i></span>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
			<Modal show={show} onHide={() => cerrarModal()} centered>
				<Modal.Header closeButton>
					<Modal.Title>Asignar horario al colaborador</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					<Form>
						<Form.Group className="mb-3">
							<Form.Label>Colaborador</Form.Label>
							<SelectColaborador value={id_colaborador} onChange={setIdColaborador} />
						</Form.Group>

						<Form.Group className="mb-3">
							<Form.Label>Horario</Form.Label>
							<SelectHorario value={id_horario} onChange={setIdHorario} />
						</Form.Group>
						<Form.Group className="row">
							<Form.Group className="mb-3 col-md-6">
								<Form.Label className="d-block">Fecha de inicio</Form.Label>
								<FechaPicker
									initialDate={fecha_inicio}
									onChange={({ ymd }) => setFechaInicio(ymd)} // guardamos 'YYYY-MM-DD'
								/>
							</Form.Group>

							<Form.Group className="mb-3 col-md-6">
								<Form.Label>Fecha de fin</Form.Label>
								<FechaPicker
									initialDate={fecha_fin}
									onChange={({ ymd }) => setFechaFin(ymd)} // guardamos 'YYYY-MM-DD'
								/>
							</Form.Group>
						</Form.Group>
						<Form.Group className="mb-3 col-md-12">
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
					</Form>
				</Modal.Body>
				<Modal.Footer>
					<Button variant="outline-danger" onClick={() => cerrarModal()}>
						Cancelar
					</Button>
					<Button variant="outline-success" onClick={guardarAsignacion}>
						Guardar
					</Button>
				</Modal.Footer>
			</Modal>
		</div>
	);
}
