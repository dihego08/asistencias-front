import { useEffect, useState } from "react";
//import { Modal, Button, Form } from "react-bootstrap";
import {
    createPermiso, deletePermiso, getPermisos, updatePermiso, actualizarEstadoPermiso
} from "../services/permisosService";
import { Modal, Button, Form, DropdownButton, Dropdown } from "react-bootstrap";
import alertify from 'alertifyjs';
import FechaPicker from "../components/FechaPicker"; // el componente anterior
import SelectColaborador from "../components/SelectColaborador";
import SelectTipoPermiso from "../components/SelectTipoPermiso";
import Switch from "react-switch";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";

export default function Permisos() {
    const [permisos, setPermisos] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [id_colaborador, setIdColaborador] = useState("");
    const [fecha_inicio, setFechaInicio] = useState("");
    const [fecha_fin, setFechaFin] = useState("");
    const [motivo, setMotivo] = useState("");
    const [id_tipo, setIdTipo] = useState("");
    const [estado, setEstado] = useState("");
    const [filterText, setFilterText] = useState("");
    const [show, setShow] = useState(false);
    const [hora_inicio, setHoraInicio] = useState("");
    const [hora_fin, setHoraFin] = useState("");
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
    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });
        doc.text(`Permisos`, 14, 15);
        const tableColumn = [
            "ID",
            "Colaborador",
            "Fecha Inicio",
            "Fecha Fin",
            "Hora Inicio",
            "Hora Fin",
            "Motivo",
            "Tipo",
            "Estado",
        ];
        const tableRows = filteredData.map((row) => [
            row.id,
            row.colaborador.nombres + " " + row.colaborador.apellido_paterno + " " + row.colaborador.apellido_materno,
            row.fecha_inicio,
            row.fecha_fin,
            row.hora_inicio,
            row.hora_fin,
            row.motivo,
            row.tipo.tipo,
            row.estado === 1 ? "Activo" : "Inactivo",
        ]);
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });
        doc.save(`permisos.pdf`);
    };
    // Filtrado simple por fecha o estado
    const filteredData = permisos.filter(
        (item) =>
            item.colaborador.nombres?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.tipo.tipo?.toLowerCase().includes(filterText.toLowerCase())
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
        saveAs(blob, `permisos.xlsx`);
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
            name: "Hora Inicio",
            selector: (row) => row.hora_inicio,
            sortable: true,
        },
        {
            name: "Hora Fin",
            selector: (row) => row.hora_fin,
            sortable: true,
        },
        {
            name: "Motivo",
            selector: (row) => row.motivo,
            sortable: true,
        },
        {
            name: "Tipo",
            selector: (row) => row.tipo.tipo,
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
        const data = await getPermisos();
        setPermisos(data);
    };

    const guardar = async () => {
        
        const fechaInicioFormateada = fecha_inicio instanceof Date
            ? fecha_inicio.toISOString().split("T")[0] // → '2025-11-22'
            : fecha_inicio.split("T")[0]; // por si viene como string ISO
        const fechaFinFormateada = fecha_fin instanceof Date
            ? fecha_fin.toISOString().split("T")[0] // → '2025-11-22'
            : fecha_fin.split("T")[0]; // por si viene como string ISO
        try {
            const payload = {
                id_colaborador: id_colaborador.id,
                fecha_inicio: fechaInicioFormateada || null,
                fecha_fin: fechaFinFormateada || null,
                motivo: motivo,
                id_tipo: id_tipo,
                hora_inicio: hora_inicio || null,
                hora_fin: hora_fin || null,
                estado: estado
            };
            let res = null;
            if (idEdit) {
                res = await updatePermiso(idEdit, payload);
            } else {
                res = await createPermiso(payload);
            }
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
        setIdColaborador({ id: "" });
        setFechaInicio("");
        setFechaFin("");
        setMotivo("");
        setIdTipo("");
        setHoraInicio("");
        setHoraFin("");
        setEstado("");
        setShow(false);
    };
    const editar = (permiso) => {
        setIdEdit(permiso.id);
        setIdColaborador({ id: permiso.id_colaborador });
        setFechaInicio(permiso.fecha_inicio ? new Date(`${permiso.fecha_inicio}T00:00:00`) : null);
        setFechaFin(permiso.fecha_fin ? new Date(`${permiso.fecha_fin}T00:00:00`) : null);
        setMotivo(permiso.motivo);
        setHoraInicio(permiso.hora_inicio || "");
        setHoraFin(permiso.hora_fin || "");
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
                    <span className="btn btn-outline-primary btn-rounded me-2 d-inline-block" data-toggle="modal"
                        data-target="#formulario" onClick={() => setShow(true)}><i className="fa fa-plus"></i> Nuevo Permiso</span>
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

            {/* Modal React-Bootstrap */}
            <Modal show={show} onHide={() => cerrarModal()} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>{idEdit ? "Editar Permiso" : "Nuevo Permiso"}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form className="row">
                        <Form.Group className="mb-3 col-md-12">
                            <Form.Label className="d-block">Colaborador</Form.Label>
                            <SelectColaborador value={id_colaborador.id} onChange={setIdColaborador} />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label className="d-block">Fecha Inicio</Form.Label>
                            <FechaPicker
                                initialDate={fecha_inicio}
                                onChange={({ ymd }) => setFechaInicio(ymd)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label className="d-block">Fecha Fin</Form.Label>
                            <FechaPicker
                                initialDate={fecha_fin}
                                onChange={({ ymd }) => setFechaFin(ymd)} // guardamos 'YYYY-MM-DD'
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label className="d-block">Hora Inicio</Form.Label>
                            <Form.Control
                                type="time"
                                value={hora_inicio}
                                onChange={(e) => setHoraInicio(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3 col-md-6">
                            <Form.Label className="d-block">Hora Fin</Form.Label>
                            <Form.Control
                                type="time"
                                value={hora_fin}
                                onChange={(e) => setHoraFin(e.target.value)}
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