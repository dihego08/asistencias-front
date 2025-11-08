import React, { useState, useEffect } from "react";
import { Modal, Button, Form, DropdownButton, Dropdown } from "react-bootstrap";
import { createColaboradorHorario, updateColaboradorHorario, getColaboradorHorario, actualizarEstadoColaboradorHorario, deleteColaboradorHorario } from "../services/colaboradorHorariosService";
import SelectColaborador from "../components/SelectColaborador";
import SelectHorario from "../components/SelectHorario";
import FechaPicker from "../components/FechaPicker"; // el componente anterior
import alertify from 'alertifyjs';
import Switch from "react-switch";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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
	const [filterText, setFilterText] = useState("");

	useEffect(() => {
		listar();
	}, []);
	const exportToPDF = () => {
		const doc = new jsPDF({
			orientation: "landscape",
			unit: "mm",
			format: "a4",
		});
		doc.text(`Horarios Asignados`, 14, 15);
		const tableColumn = [
			"ID",
			"Colaborador",
			"Horario",
			"Fecha Inicio",
			"Fecha Fin",
			"Estado",
		];
		const tableRows = filteredData.map((row) => [
			row.id,
			row.colaborador.nombres + " " + row.colaborador.apellido_paterno + " " + row.colaborador.apellido_materno,
			row.horario.nombre,
			row.fecha_inicio,
			row.fecha_fin,
			row.estado === 1 ? "Activo" : "Inactivo",
		]);
		autoTable(doc, {
			head: [tableColumn],
			body: tableRows,
			startY: 25,
		});
		doc.save(`horarios_asignados.pdf`);
	};
	// Filtrado simple por fecha o estado
	const filteredData = colaboradorHorario.filter(
		(item) =>
			item.colaborador.nombres?.toLowerCase().includes(filterText.toLowerCase()) ||
			item.estado_asistencia?.toLowerCase().includes(filterText.toLowerCase())
	);
	const subHeaderComponent = (
		<div className="d-flex align-items-center justify-content-between w-100">
			<input
				type="text"
				className="form-control w-100"
				placeholder="🔍 Buscar por fecha o estado..."
				value={filterText}
				onChange={(e) => setFilterText(e.target.value)}
			/>
		</div>
	);
	const exportToExcel = () => {
		// Crear hoja Excel
		const ws = XLSX.utils.json_to_sheet(filteredData);
		const wb = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(wb, ws, "Reporte");

		// Generar archivo Excel y descargarlo
		const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
		const blob = new Blob([wbout], { type: "application/octet-stream" });
		saveAs(blob, `horarios_asignados.xlsx`);
	};
	const columns = [
		{
			name: "ID",
			selector: (row) => row.id,
			sortable: true,
		},
		{
			name: "Colaborador",
			selector: (row) => row.colaborador.nombres + " " + row.colaborador.apellido_paterno + " " + row.colaborador.apellido_materno,
			sortable: true,
		},
		{
			name: "Horario",
			selector: (row) => row.horario.nombre,
			sortable: true,
		},
		{
			name: "Fecha Inicio",
			selector: (row) => row.fecha_inicio,
			sortable: true,
		},
		{
			name: "Fecha Fin",
			selector: (row) => row.fecha_fin,
			sortable: true,
		},
		{
			name: "Estado",
			cell: (row) => (
				<Switch
					checked={row.estado === 1}
					onChange={(checked) => handleEstadoChange(row.id, checked)}
					onColor="#28a745"
					offColor="#ccc"
					uncheckedIcon={false}
					checkedIcon={false}
					disabled={loadingId === row.id}
				/>
			),
			ignoreRowClick: true,
			allowOverflow: true,
			className: "text-center",
		},
		{
			name: "",
			cell: (row) => (
				<div>
					<span className="btn btn-outline-warning btn-sm mr-1" onClick={() => editar(row)}><i className="fa fa-edit"></i></span>
					<span className="btn btn-outline-danger btn-sm" onClick={() => eliminar(row)}><i className="fa fa-trash"></i></span>
				</div>
			),
			ignoreRowClick: true,
			allowOverflow: true,
			width: "100px",
			className: "text-center",
		},
	];
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
			const fechaInicioFormateada = fecha_inicio instanceof Date
				? fecha_inicio.toISOString().split("T")[0] // → '2025-11-22'
				: fecha_inicio.split("T")[0]; // por si viene como string ISO
			const fechaFinFormateada = fecha_fin instanceof Date
				? fecha_fin.toISOString().split("T")[0] // → '2025-11-22'
				: fecha_fin.split("T")[0]; // por si viene como string ISO
			const payload = {
				id_colaborador: id_colaborador.id,
				id_horario: id_horario,
				fecha_inicio: fechaInicioFormateada || null,
				fecha_fin: fechaFinFormateada || null,
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
		setIdColaborador({ id: horario.id_colaborador });
		setIdHorario(horario.id_horario);
		setEstado(horario.estado);
		setShow(true); // control del modal
	};
	const cerrarModal = () => {
		setIdEdit(null);
		setFechaInicio("");
		setFechaFin("");
		setIdColaborador({ id: "" });
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
					<button
						className="btn btn-outline-primary btn-rounded me-2 d-inline-block"
						onClick={() => setShow(true)}
					>
						<i className="fa fa-plus"></i> Nueva Asignación de Horario
					</button>

					<DropdownButton
						id="dropdown-export"
						title="Exportar"
						variant="primary"
						className="d-inline-block"
					>
						<Dropdown.Item onClick={exportToExcel}>
							<i className="fas fa-file-excel text-success me-2"></i>
							Exportar a Excel
						</Dropdown.Item>
						<Dropdown.Item onClick={exportToPDF}>
							<i className="fas fa-file-pdf text-danger me-2"></i>
							Exportar a PDF
						</Dropdown.Item>
					</DropdownButton>
				</div>
				<div className="table-response w-100">
					<DataTable
						title={``}
						columns={columns}
						data={filteredData} // usa los datos filtrados
						pagination
						highlightOnHover
						striped
						subHeader
						subHeaderComponent={subHeaderComponent}
					/>
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
							<SelectColaborador value={id_colaborador.id} onChange={setIdColaborador} />
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
