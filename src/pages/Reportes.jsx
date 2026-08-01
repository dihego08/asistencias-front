import { useEffect, useState } from "react";
import {
    reportByColaborador
} from "../services/reportesService";
import alertify from 'alertifyjs';
import FechaPicker from "../components/FechaPicker"; // el componente anterior
import SelectColaborador from "../components/SelectColaborador";
import { Button, Dropdown, DropdownButton, Form, Modal } from "react-bootstrap";
import { insertarMarcacion } from "../services/marcacionesService";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import DataTable from "react-data-table-component";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Reportes() {
    const [reportes, setReportes] = useState([]);
    const [id_colaborador, setIdColaborador] = useState("");
    const [colaborador, setColaborador] = useState("");
    const [fecha_inicio, setFechaInicio] = useState("");
    const [fecha_fin, setFechaFin] = useState("");
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(false);

    // Modal state
    const [showModal, setShowModal] = useState(false);
    const [savingMarcacion, setSavingMarcacion] = useState(false);
    const [modalColaboradorId, setModalColaboradorId] = useState("");
    const [marcacionData, setMarcacionData] = useState({ dni: "", fecha_hora: "" });

    const handleCloseModal = () => {
        setShowModal(false);
        setModalColaboradorId("");
        setMarcacionData({ dni: "", fecha_hora: "" });
    };

    const handleSaveMarcacion = async () => {
        if (!marcacionData.dni || !marcacionData.fecha_hora) {
            alertify.error("Por favor, seleccione un colaborador y la fecha/hora.");
            return;
        }
        
        // El input datetime-local devuelve YYYY-MM-DDTHH:mm, lo formateamos para la BD (YYYY-MM-DD HH:mm:00)
        const formattedFechaHora = marcacionData.fecha_hora.replace('T', ' ') + ':00';

        setSavingMarcacion(true);
        try {
            await insertarMarcacion({
                dni: marcacionData.dni,
                fecha_hora: formattedFechaHora,
                estado: 1,
                reloj_ip: 'MANUAL'
            });
            alertify.success("Marcación registrada correctamente");
            handleCloseModal();
            // Actualizar tabla si ya se había generado el reporte
            if (id_colaborador && fecha_inicio && fecha_fin) {
                listar();
            }
        } catch (error) {
            console.error(error);
            alertify.error("Error al registrar la marcación manual");
        } finally {
            setSavingMarcacion(false);
        }
    };


    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });
        doc.text(`Reporte de Asistencias de ${colaborador}`, 14, 15);
        const tableColumn = [
            "Fecha",
            "Hora Entrada",
            "Hora Salida",
            "Hora Inicio Refrigerio",
            "Hora Fin Refrigerio",
            "Hora Entrada Real",
            "Hora Salida Real",
            "Hora Inicio Refrigerio Real",
            "Hora Fin Refrigerio Real",
            "Hora Entrada Extra",
            "Hora Salida Extra",
            "Estado Badge",
            "Minutos Tardanza",
            "Minutos Salida Anticipada",
            "Horas Efectivas",
            "Horas Extras",
            "Num. Marcaciones",
        ];
        const tableRows = filteredData.map((row) => [
            row.fecha,
            row.hora_entrada_esperada,
            row.hora_salida_esperada,
            row.hora_inicio_refrigerio,
            row.hora_fin_refrigerio,
            row.hora_entrada,
            row.hora_salida,
            row.hora_inicio_refrigerio_real,
            row.hora_fin_refrigerio_real,
            row.hora_entrada_extra,
            row.hora_salida_extra,
            row.estado_asistencia,
            row.minutos_tardanza,
            row.minutos_salida_anticipada,
            row.horas_efectivas,
            row.horas_extras,
            row.num_marcaciones,
        ]);
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });
        doc.save(`reporte_asistencias_${colaborador}.pdf`);
    };
    // Filtrado simple por fecha o estado
    const filteredData = reportes.filter(
        (item) =>
            item.fecha?.toLowerCase().includes(filterText.toLowerCase()) ||
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
    const listar = async () => {
        setLoading(true); // 🔹 activa el loading
        /*const data = await reportByColaborador({
            id_colaborador,
            fecha_inicio,
            fecha_fin
        });
        setReportes(data);*/
        try {
            const data = await reportByColaborador({
                id_colaborador,
                fecha_inicio,
                fecha_fin
            });
            setReportes(data);
        } catch (error) {
            alertify.error("Error al generar el reporte");
            console.error(error);
        } finally {
            setLoading(false); // 🔹 desactiva el loading siempre
        }
    };
    const exportToExcel = () => {
        // Crear hoja Excel
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");

        // Generar archivo Excel y descargarlo
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, `reporte_asistencias_${colaborador}.xlsx`);
    };
    // Determinar el color del badge según el estado
    const getBadgeClass = (estado) => {
        switch (estado) {
            case "OK":
                return "badge bg-success"; // verde
            case "TARDANZA":
                return "badge bg-warning text-dark"; // amarillo
            case "FALTA":
                return "badge bg-danger"; // rojo
            default:
                return "badge bg-secondary"; // gris por defecto
        }
    };
    const columns = [
        {
            name: "Fecha",
            selector: (row) => row.fecha,
            sortable: true,
        },
        {
            name: "Hora Entrada",
            selector: (row) => row.hora_entrada,
            sortable: true,
        },
        {
            name: "Hora Salida",
            selector: (row) => row.hora_salida,
            sortable: true,
        },
        {
            name: "Hora Inicio Refrigerio",
            selector: (row) => row.hora_inicio_refrigerio_real,
            sortable: true,
        },
        {
            name: "Hora Fin Refrigerio",
            selector: (row) => row.hora_fin_refrigerio_real,
            sortable: true,
        },
        {
            name: "Hora Entrada Ext.",
            selector: (row) => row.hora_entrada_extra,
            sortable: true,
        },
        {
            name: "Hora Salida Ext.",
            selector: (row) => row.hora_salida_extra,
            sortable: true,
        },
        {
            name: "Estado Badge",
            cell: (row) => (
                <span className={getBadgeClass(row.estado_base)}>
                    {row.estado_base}
                </span>
            ),
            ignoreRowClick: true,
            allowOverflow: true,
            width: "100px",
            className: "text-center",
        },
        {
            name: "Minutos Tardanza",
            selector: (row) => row.minutos_tardanza,
            sortable: true,
        },
        {
            name: "Minutos Salida Anticipada",
            selector: (row) => row.minutos_salida_anticipada,
            sortable: true,
        },
        {
            name: "Horas Efectivas",
            selector: (row) => row.horas_efectivas,
            sortable: true,
        },
        {
            name: "Horas Extras",
            selector: (row) => row.horas_extras,
            sortable: true,
        },
        {
            name: "Num. Marcaciones",
            selector: (row) => row.num_marcaciones,
            sortable: true,
        },
    ];
    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Reportes</h1>
            <div className="row">
                <div className="col-md-12 mb-3 text-end">
                    <Button variant="success" onClick={() => setShowModal(true)}>
                        <i className="fas fa-plus"></i> Registrar Marcación Manual
                    </Button>
                </div>
                <div className="col-md-12 mb-3 row">
                    <div className="col-md-4">
                        <Form.Label className="d-block">Colaborador</Form.Label>
                        <SelectColaborador label="Colaborador" value={id_colaborador} onChange={({ id, nombre }) => {
                            setIdColaborador(id);
                            setColaborador(nombre);
                        }} />
                    </div>
                    <div className="col-md-2">
                        <Form.Label className="d-block">Fecha Inicio</Form.Label>
                        <FechaPicker
                            label="Fecha Inicio"
                            value={fecha_inicio}
                            onChange={({ ymd }) => setFechaInicio(ymd)} // guardamos 'YYYY-MM-DD'
                        />
                    </div>
                    <div className="col-md-2">
                        <Form.Label className="d-block">Fecha Fin</Form.Label>
                        <FechaPicker
                            label="Fecha Fin"
                            value={fecha_fin}
                            onChange={({ ymd }) => setFechaFin(ymd)} // guardamos 'YYYY-MM-DD'
                        />
                    </div>
                    <div className="col-md-2">
                        <Form.Label className="d-block">&nbsp;</Form.Label>
                        <Button
                            className="btn btn-primary w-100"
                            onClick={listar}
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Generando...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-search"></i> Generar Reporte
                                </>
                            )}
                        </Button>
                    </div>
                    <div className="col-md-2">
                        <Form.Label className="d-block">&nbsp;</Form.Label>
                        <DropdownButton
                            id="dropdown-export"
                            title="Exportar"
                            variant="primary"
                            className="w-100"
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
                </div>

                <div className="table-response w-100">
                    <DataTable
                        title={`Reporte de Asistencias de ${colaborador}`}
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

            <Modal show={showModal} onHide={handleCloseModal}>
                <Modal.Header closeButton>
                    <Modal.Title>Registrar Marcación Manual</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Group className="mb-3">
                        <Form.Label>Colaborador</Form.Label>
                        <SelectColaborador 
                            value={modalColaboradorId} 
                            onChange={({ id, dni }) => {
                                setModalColaboradorId(id);
                                setMarcacionData({ ...marcacionData, dni: dni });
                            }} 
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Fecha y Hora</Form.Label>
                        <Form.Control 
                            type="datetime-local" 
                            value={marcacionData.fecha_hora} 
                            onChange={(e) => setMarcacionData({ ...marcacionData, fecha_hora: e.target.value })} 
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseModal}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSaveMarcacion} disabled={savingMarcacion}>
                        {savingMarcacion ? "Guardando..." : "Guardar Marcación"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}