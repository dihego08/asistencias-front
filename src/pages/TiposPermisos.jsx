import { useEffect, useState } from "react";
import Switch from "react-switch";
import {
    getTiposPermisos,
    createTipoPermiso,
    updateTipoPermiso,
    deleteTipoPermiso
} from "../services/tiposPermisosService";
import { Modal, Button, Form } from "react-bootstrap";
import alertify from 'alertifyjs';

export default function TiposPermisos() {
    const [tipos_permisos, setTiposPermisos] = useState([]);
    const [tipo, setTipo] = useState("");
    const [show, setShow] = useState(false);
    const [idEdit, setIdEdit] = useState(null);

    useEffect(() => {
        listar();
    }, []);

    const listar = async () => {
        const data = await getTiposPermisos();
        setTiposPermisos(data);
    };

    const guardar = async () => {
        try {
            let res = null;
            if (idEdit) {
                res = await updateTipoPermiso(idEdit, { tipo });
            } else {
                res = await createTipoPermiso({ tipo });
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
        setTipo("");
        setShow(false);
    };
    const editar = (marca) => {
        setIdEdit(marca.id);
        setTipo(marca.tipo);
        setShow(true); // control del modal
    };
    const eliminar = async (tipo_permiso) => {
        alertify.confirm(
            "Confirmar eliminación",
            "¿Seguro que deseas eliminar este tipo de permiso <b>(" + tipo_permiso.tipo + ")</b>?",
            async function () {
                try {
                    const res = await deleteTipoPermiso(tipo_permiso.id);

                    if (res.status === "success") {
                        alertify.success(res.message);
                        listar(); // refresca la lista
                    } else {
                        alertify.error(res.message);
                    }
                } catch (err) {
                    alertify.error("Error al intentar eliminar el tipo de permiso");
                }
            },
            function () {
                alertify.message("Acción cancelada");
            }
        );
    };

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Tipos de Permiso</h1>
            <div className="row">
                <div className="col-md-12 text-right mb-3">
                    <span className="btn btn-outline-primary btn-rounded" data-toggle="modal"
                        data-target="#formulario" onClick={() => setShow(true)}><i className="fa fa-plus"></i> Nuevo Tipo de Permiso</span>
                </div>
                <div className="table-response w-100">
                    <table className="table table-bordered table-striped" id="tabla-marcas">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Tipo de Permiso</th>
                                <th width="5%"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {tipos_permisos.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.tipo}</td>
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
                    <Modal.Title>{idEdit ? "Editar Tipo de Permiso" : "Nuevo Tipo de Permiso"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Tipo</Form.Label>
                            <Form.Control
                                type="text"
                                value={tipo}
                                onChange={(e) => setTipo(e.target.value)}
                            />
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