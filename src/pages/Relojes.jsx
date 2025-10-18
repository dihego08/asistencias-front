import { useEffect, useState } from "react";
import Switch from "react-switch";
import {
    createReloj, deleteReloj, getRelojes, updateReloj,actualizarEstadoReloj
} from "../services/relojesService";
import { Modal, Button, Form } from "react-bootstrap";
import alertify from 'alertifyjs';

export default function Relojes() {
    const [relojes, setRelojes] = useState([]);
    const [nombre, setNombre] = useState("");
    const [loadingId, setLoadingId] = useState(null);
    const [ip, setIp] = useState("");
    const [puerto, setPuerto] = useState("");
    const [ubicacion, setUbicacion] = useState("");
    const [estado, setEstado] = useState("");
    const [show, setShow] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

    useEffect(() => {
        listar();
    }, []);

    const listar = async () => {
        const data = await getRelojes();
        setRelojes(data);
    };

    const guardar = async () => {
        try {
            let res = null;
            if (idEdit) {
                res = await updateReloj(idEdit, { nombre, ip, puerto, ubicacion, estado });
            } else {
                res = await createReloj({ nombre, ip, puerto, ubicacion, estado });
            }
            if (res.status === "success") {
                alertify.success(res.message);
                listar();
                cerrarModal();
            } else {
                alertify.error(res.message);
            }
        } catch (err) {
            alertify.error("Error al intentar guardar el reloj " + err);
        }
    };
    const cerrarModal = () => {
        setIdEdit(null);
        setNombre("");
        setIp("");
        setPuerto("");
        setUbicacion("");
        setEstado("");
        setShow(false);
    };
    const editar = (marca) => {
        setIdEdit(marca.id);
        setNombre(marca.nombre);
        setIp(marca.ip);
        setPuerto(marca.puerto);
        setUbicacion(marca.ubicacion);
        setEstado(marca.estado);
        setShow(true); // control del modal
    };
    const eliminar = async (reloj) => {
        alertify.confirm(
            "Confirmar eliminación",
            "¿Seguro que deseas eliminar este reloj <b>(" + reloj.nombre + ")</b>?",
            async function () {
                try {
                    const res = await deleteReloj(reloj.id);

                    if (res.status === "success") {
                        alertify.success(res.message);
                        listar(); // refresca la lista
                    } else {
                        alertify.error(res.message);
                    }
                } catch (err) {
                    alertify.error("Error al intentar eliminar el reloj");
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
            const res = await actualizarEstadoReloj(id, nuevoEstado ? 1 : 0);
            if (res.status === "success") {
                // ✅ Actualizamos visualmente el estado del horario en el frontend
                setRelojes((prevRelojes) =>
                    prevRelojes.map((h) =>
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
            <h1 className="h3 mb-4 text-gray-800">Relojes</h1>
            <div className="row">
                <div className="col-md-12 text-right mb-3">
                    <span className="btn btn-outline-primary btn-rounded" data-toggle="modal"
                        data-target="#formulario" onClick={() => setShow(true)}><i className="fa fa-plus"></i> Nuevo Reloj</span>
                </div>
                <div className="table-response w-100">
                    <table className="table table-bordered table-striped" id="tabla-marcas">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Nombre</th>
                                <th>IP</th>
                                <th>Puerto</th>
                                <th>Ubicación</th>
                                <th>Estado</th>
                                <th width="5%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {relojes.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.nombre}</td>
                                    <td>{c.ip}</td>
                                    <td>{c.puerto}</td>
                                    <td>{c.ubicacion}</td>
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
                    <Modal.Title>{idEdit ? "Editar Reloj" : "Nuevo Reloj"}</Modal.Title>
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
                            <Form.Label>IP</Form.Label>
                            <Form.Control
                                type="text"
                                value={ip}
                                onChange={(e) => setIp(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Puerto</Form.Label>
                            <Form.Control
                                type="text"
                                value={puerto}
                                onChange={(e) => setPuerto(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Ubicación</Form.Label>
                            <Form.Control
                                type="text"
                                value={ubicacion}
                                onChange={(e) => setUbicacion(e.target.value)}
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