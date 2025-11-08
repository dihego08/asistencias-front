import { useEffect, useState } from "react";
import Switch from "react-switch";
import {
    getColaboradores, createColaborador, deleteColaborador, updateColaborador, actualizarEstadoColaborador, actualizarMarcacionColaborador
} from "../services/colaboradoresService";
import { Modal, Button, Form, DropdownButton, Dropdown } from "react-bootstrap";
import alertify from 'alertifyjs';
import DataTable from "react-data-table-component";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function Colaboradores() {
    const [colaboradores, setColaboradores] = useState([]);
    const [loadingId, setLoadingId] = useState(null);
    const [filterText, setFilterText] = useState("");

    // Filtrado simple por fecha o estado
    const filteredData = colaboradores.filter(
        (item) =>
            item.nombres?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.apellido_paterno?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.apellido_materno?.toLowerCase().includes(filterText.toLowerCase())
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
    const columns = [
        {
            name: "Id",
            selector: (row) => row.id,
            sortable: true,
        },
        {
            name: "Nombres",
            selector: (row) => row.nombres,
            sortable: true,
        },
        {
            name: "Apellidos Paterno",
            selector: (row) => row.apellido_paterno,
            sortable: true,
        },
        {
            name: "Apellidos Materno",
            selector: (row) => row.apellido_materno,
            sortable: true,
        },
        {
            name: "DNI",
            selector: (row) => row.dni,
            sortable: true,
        },
        {
            name: "Fecha Nacimiento",
            selector: (row) => row.fecha_nacimiento,
            sortable: true,
        },
        {
            name: "Estado",
            selector: (row) => row.estado,
            sortable: true,
            cell: (row) => (
                <Switch
                    checked={row.estado === 1}
                    onChange={(checked) => handleEstadoChange(row.id, checked)}
                    onColor="#28a745"
                    offColor="#e74a3b"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    disabled={loadingId === row.id}
                />
            ),
        },
        {
            name: "¿Controlar Marcación?",
            selector: (row) => row.marcacion,
            sortable: true,
            cell: (row) => (
                <Switch
                    checked={row.marcacion === 1}
                    onChange={(checked) => handleMarcacionChange(row.id, checked)}
                    onColor="#28a745"
                    offColor="#ccc"
                    uncheckedIcon={false}
                    checkedIcon={false}
                    disabled={loadingId === row.id}
                />
            ),
        },
    ];
    const exportToPDF = () => {
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a4",
        });
        doc.text(`Lista Colaboradores`, 14, 15);
        const tableColumn = [
            "Id",
            "Nombres",
            "Apellidos Paterno",
            "Apellidos Materno",
            "DNI",
            "Fecha Nacimiento",
            "Estado",
        ];
        const tableRows = filteredData.map((row) => [
            row.id,
            row.nombres,
            row.apellido_paterno,
            row.apellido_materno,
            row.dni,
            row.fecha_nacimiento,
            row.estado === 1 ? "Activo" : "Inactivo",
        ]);
        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
        });
        doc.save(`lista_colaboradores.pdf`);
    };
    const exportToExcel = () => {
        // Crear hoja Excel
        const ws = XLSX.utils.json_to_sheet(filteredData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");

        // Generar archivo Excel y descargarlo
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, `lista_colaboradores.xlsx`);
    };
    useEffect(() => {
        listar();
    }, []);
    const handleEstadoChange = async (id, nuevoEstado) => {
        setLoadingId(id);
        try {
            const res = await actualizarEstadoColaborador(id, nuevoEstado ? 1 : 0);
            if (res.status === "success") {
                // ✅ Actualizamos visualmente el estado del horario en el frontend
                setColaboradores((prevColaboradores) =>
                    prevColaboradores.map((h) =>
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
    const handleMarcacionChange = async (id, nuevoMarcacion) => {
        setLoadingId(id);
        try {
            const res = await actualizarMarcacionColaborador(id, nuevoMarcacion ? 1 : 0);
            if (res.status === "success") {
                // ✅ Actualizamos visualmente el marcacion del horario en el frontend
                setColaboradores((prevColaboradores) =>
                    prevColaboradores.map((h) =>
                        h.id === id ? { ...h, marcacion: nuevoMarcacion ? 1 : 0 } : h
                    )
                );
                alertify.success(res.message);
            } else {
                alertify.error(res.message);
            }
        } catch (err) {
            console.error("Error al actualizar el marcacion:", err);
            alertify.error("Error al actualizar el marcacion");
        } finally {
            setLoadingId(null);
        }
    };
    const listar = async () => {
        const data = await getColaboradores();
        setColaboradores(data);
    };

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Colaboradores</h1>
            <div className="row">
                <div className="col-md-12 text-right mb-3">
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
                        columns={columns}
                        data={filteredData}
                        pagination
                        subHeader
                        subHeaderComponent={subHeaderComponent}
                    />
                </div>
            </div>

        </div>
    );
}