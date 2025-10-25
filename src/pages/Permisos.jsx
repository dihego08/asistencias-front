import { useEffect, useState } from "react";
//import { Modal, Button, Form } from "react-bootstrap";
import {
    createPermiso, deletePermiso, getPermisos, updatePermiso,actualizarEstadoPermiso
} from "../services/permisosService";
import { Modal, Button, Form } from "react-bootstrap";
import alertify from 'alertifyjs';
import FechaPicker from "../components/FechaPicker"; // el componente anterior
import SelectColaborador from "../components/SelectColaborador";
import SelectTipoPermiso from "../components/SelectTipoPermiso";
import Switch from "react-switch";

export default function Permisos() {
    const [permisos, setPermisos] = useState([]);
	const [loadingId, setLoadingId] = useState(null);

    const [id_colaborador, setIdColaborador] = useState("");
    const [fecha_inicio, setFechaInicio] = useState("");
    const [fecha_fin, setFechaFin] = useState("");
    const [motivo, setMotivo] = useState("");
    const [id_tipo, setIdTipo] = useState("");
    const [estado, setEstado] = useState("");

    const [show, setShow] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

	const handleEstadoChange = async (id, nuevoEstado) => {
		setLoadingId(id);
		try {
			const res = await actualizarEstadoPermiso(id, nuevoEstado ? 1 : 0);
			if (res.status === "success") {
				// ✅ Actualizamos visualmente el estado del horario en el frontend
				setPermisos((prevPermisos) =>
					prevPermisos.map((h) =>
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
    useEffect(() => {
        listar();
    }, []);

    const listar = async () => {
        const data = await getPermisos();
        setPermisos(data);
    };

    const guardar = async () => {
        try {
            let res = null;
            if (idEdit) {
                res = await updatePermiso(idEdit, { id_colaborador, fecha_inicio, fecha_fin, motivo, id_tipo, estado });
            } else {
                res = await createPermiso({ id_colaborador, fecha_inicio, fecha_fin, motivo, id_tipo, estado });
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
            alertify.error("Error al intentar guardar el permiso " + err);
        }
    };
    const cerrarModal = () => {
        setIdEdit(null);
        setIdColaborador("");
        setFechaInicio("");
        setFechaFin("");
        setMotivo("");
        setIdTipo("");
        setEstado("");
        setShow(false);
    };
    const editar = (permiso) => {
        setIdEdit(permiso.id);

        setIdColaborador(permiso.id_colaborador);
        /*setFechaInicio(permiso.fecha_inicio);
        setFechaFin(permiso.fecha_fin);*/
        
		setFechaInicio(permiso.fecha_inicio ? new Date(`${permiso.fecha_inicio}T00:00:00`) : null);
        setFechaFin(permiso.fecha_fin ? new Date(`${permiso.fecha_fin}T00:00:00`) : null);
        setMotivo(permiso.motivo);
        setIdTipo(permiso.id_tipo);
        setEstado(permiso.estado);

        setShow(true); // control del modal
    };
    const eliminar = async (permiso) => {
        alertify.confirm(
            "Confirmar eliminación",
            "¿Seguro que deseas eliminar este permiso <b>(" + permiso.motivo + ")</b>?",
            async function () {
                try {
                    const res = await deletePermiso(permiso.id);

                    if (res.status === "success") {
                        alertify.success(res.message);
                        listar(); // refresca la lista
                    } else {
                        alertify.error(res.message);
                    }
                } catch (err) {
                    alertify.error("Error al intentar eliminar el permiso");
                }
            },
            function () {
                alertify.message("Acción cancelada");
            }
        );
    };

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Permisos</h1>
            <div className="row">
                <div className="col-md-12 text-right mb-3">
                    <span className="btn btn-outline-primary btn-rounded" data-toggle="modal"
                        data-target="#formulario" onClick={() => setShow(true)}><i className="fa fa-plus"></i> Nuevo Permiso</span>
                </div>
                <div className="table-response w-100">
                    <table className="table table-bordered table-striped" id="tabla-marcas">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Colaborador</th>
                                <th>Fecha Inicio</th>
                                <th>Fecha Fin</th>
                                <th>Motivo</th>
                                <th>Tipo</th>
                                <th>Estado</th>
                                <th width="5%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {permisos.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.colaborador !== null ? c.colaborador.apellido_paterno + " " + c.colaborador.apellido_materno + " " + c.colaborador.nombres : ""}</td>
                                    <td>{c.fecha_inicio}</td>
                                    <td>{c.fecha_fin}</td>
                                    <td>{c.motivo}</td>
                                    <td>{c.tipo !== null ? c.tipo.tipo : ""}</td>
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

            {/* Modal React-Bootstrap */}
            <Modal show={show} onHide={() => cerrarModal()} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{idEdit ? "Editar Permiso" : "Nuevo Permiso"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="row">
                        <Form.Group className="mb-3 col-md-12">
                            <Form.Label className="d-block">Colaborador</Form.Label>
                            <SelectColaborador value={id_colaborador} onChange={setIdColaborador} />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label className="d-block">Fecha Inicio</Form.Label>
                            <FechaPicker
                                initialDate={fecha_inicio}
                                onChange={({ ymd }) => setFechaInicio(ymd)} // guardamos 'YYYY-MM-DD'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label className="d-block">Fecha Fin</Form.Label>
                            <FechaPicker
                                initialDate={fecha_fin}
                                onChange={({ ymd }) => setFechaFin(ymd)} // guardamos 'YYYY-MM-DD'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-12">
                            <Form.Label className="d-block">Tipo Permiso</Form.Label>
                            <SelectTipoPermiso value={id_tipo} onChange={setIdTipo} />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-12">
                            <Form.Label>Motivo</Form.Label>
                            <Form.Control
                                type="text"
                                value={motivo}
                                onChange={(e) => setMotivo(e.target.value)}
                            />
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
                    <Button variant="outline-success" onClick={guardar}>
                        Guardar
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}