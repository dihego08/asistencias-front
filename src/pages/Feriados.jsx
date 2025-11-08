import { useEffect, useState } from "react";
import Switch from "react-switch";
import {
    createFeriado, deleteFeriado, getFeriados, updateFeriado, actualizarEstadoFeriado
} from "../services/feriadosService";
import { Modal, Button, Form } from "react-bootstrap";
import alertify from 'alertifyjs';
import FechaPicker from "../components/FechaPicker"; // el componente anterior

export default function Feriados() {
    const [feriados, setFeriados] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [fecha, setFecha] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [estado, setEstado] = useState("");
    const [show, setShow] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

    useEffect(() => {
        listar();
    }, []);

    const listar = async () => {
        const data = await getFeriados();
        setFeriados(data);
    };

    const guardar = async () => {
        const fechaFormateada = fecha instanceof Date
            ? fecha.toISOString().split("T")[0] // → '2025-11-22'
            : fecha.split("T")[0]; // por si viene como string ISO
        try {
            let res = null;
            if (idEdit) {
                res = await updateFeriado(idEdit, { fecha: fechaFormateada, descripcion, estado });
            } else {
                res = await createFeriado({ fecha: fechaFormateada, descripcion, estado });
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
    const cerrarModal = () => {
        setIdEdit(null);
        setFecha("");
        setDescripcion("");
        setEstado("");
        setShow(false);
    };
    const editar = (marca) => {
        setIdEdit(marca.id);
        setFecha(marca.fecha ? new Date(`${marca.fecha}T00:00:00`) : null);
        setDescripcion(marca.descripcion);
        setEstado(marca.estado);
        setShow(true); // control del modal
    };

    const handleEstadoChange = async (id, nuevoEstado) => {
        setLoadingId(id);
        try {
            const res = await actualizarEstadoFeriado(id, nuevoEstado ? 1 : 0);
            if (res.status === "success") {
                // ✅ Actualizamos visualmente el estado del horario en el frontend
                setFeriados((prevFeriados) =>
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
    const eliminar = async (feriado) => {
        alertify.confirm(
            "Confirmar eliminación",
            "¿Seguro que deseas eliminar este feriado <b>(" + feriado.descripcion + ")</b>?",
            async function () {
                try {
                    const res = await deleteFeriado(feriado.id);

                    if (res.status === "success") {
                        alertify.success(res.message);
                        listar(); // refresca la lista
                    } else {
                        alertify.error(res.message);
                    }
                } catch (err) {
                    alertify.error("Error al intentar eliminar el feriado");
                }
            },
            function () {
                alertify.message("Acción cancelada");
            }
        );
    };

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Feriados</h1>
            <div className="row">
                <div className="col-md-12 text-right mb-3">
                    <span className="btn btn-outline-primary btn-rounded" data-toggle="modal"
                        data-target="#formulario" onClick={() => setShow(true)}><i className="fa fa-plus"></i> Nuevo Feriado</span>
                </div>
                <div className="table-response w-100">
                    <table className="table table-bordered table-striped" id="tabla-marcas">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Fecha</th>
                                <th>Descripción</th>
                                <th>Estado</th>
                                <th width="5%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {feriados.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.fecha}</td>
                                    <td>{c.descripcion}</td>
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
            <Modal show={show} onHide={() => cerrarModal()}>
                <Modal.Header closeButton>
                    <Modal.Title>{idEdit ? "Editar Feriado" : "Nuevo Feriado"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>

                        <Form.Group className="row">
                            <Form.Group className="mb-3 col-md-12">
                                <Form.Label>Descripción</Form.Label>
                                <Form.Control
                                    type="text"
                                    value={descripcion}
                                    onChange={(e) => setDescripcion(e.target.value)}
                                />
                            </Form.Group>
                        </Form.Group>
                        <Form.Group className="row">
                            <Form.Group className="mb-3 col-md-6">
                                <Form.Label className="d-block">Fecha</Form.Label>
                                <FechaPicker
                                    initialDate={fecha}
                                    onChange={({ ymd }) => setFecha(ymd)} // guardamos 'YYYY-MM-DD'
                                />
                            </Form.Group>
                            <Form.Group className="mb-3 col-md-6">
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