import { useState } from "react";
import { reportByDias } from "../services/reportesService";
import alertify from 'alertifyjs';
import { Button, Dropdown, DropdownButton, Form, Table } from "react-bootstrap";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ReportesDia() {
    const [reportes, setReportes] = useState([]);
    const [mes, setMes] = useState(new Date().getMonth() + 1);
    const [anio, setAnio] = useState(new Date().getFullYear());
    const [filterText, setFilterText] = useState("");
    const [loading, setLoading] = useState(false);

    const meses = [
        { value: 1, label: "Enero" },
        { value: 2, label: "Febrero" },
        { value: 3, label: "Marzo" },
        { value: 4, label: "Abril" },
        { value: 5, label: "Mayo" },
        { value: 6, label: "Junio" },
        { value: 7, label: "Julio" },
        { value: 8, label: "Agosto" },
        { value: 9, label: "Septiembre" },
        { value: 10, label: "Octubre" },
        { value: 11, label: "Noviembre" },
        { value: 12, label: "Diciembre" },
    ];

    const generarAnios = () => {
        const anioActual = new Date().getFullYear();
        const anios = [];
        for (let i = anioActual - 5; i <= anioActual + 2; i++) {
            anios.push(i);
        }
        return anios;
    };

    // Obtener número de días del mes
    const getDiasDelMes = () => {
        return new Date(anio, mes, 0).getDate();
    };

    // Obtener nombre del día de la semana (abreviado)
    const getDiaSemana = (dia) => {
        const fecha = new Date(anio, mes - 1, dia);
        const dias = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
        return dias[fecha.getDay()];
    };

    // Determinar color de celda según valor
    const getCellClass = (valor) => {
        if (valor === '0.00') return 'bg-danger text-white'; // Falta
        if (valor === '-') return 'bg-secondary text-white'; // No laborable
        if (valor === null || valor === undefined) return 'bg-light'; // Sin datos
        return 'bg-white'; // Día trabajado
    };

    // Convertir formato "HH:MM:SS" a horas decimales
    const convertirHorasADecimal = (tiempoStr) => {
        if (!tiempoStr || tiempoStr === null) return 0;
        const partes = tiempoStr.split(':');
        const horas = parseInt(partes[0]) || 0;
        const minutos = parseInt(partes[1]) || 0;
        const segundos = parseInt(partes[2]) || 0;
        return horas + (minutos / 60) + (segundos / 3600);
    };

    // Calcular diferencia de horas
    const calcularDiferenciaHoras = (horasTeoricas, totalHoras) => {
        const teoricasDecimal = convertirHorasADecimal(horasTeoricas);
        const trabajadasDecimal = parseFloat(totalHoras) || 0;
        const diferencia = trabajadasDecimal - teoricasDecimal;
        return diferencia.toFixed(2);
    };

    const filteredData = reportes.filter(
        (item) =>
            item.nombre?.toLowerCase().includes(filterText.toLowerCase()) ||
            item.tra_codigo?.toLowerCase().includes(filterText.toLowerCase())
    );

    const listar = async () => {
        setLoading(true);
        try {
            const data = await reportByDias({
                mes: mes,
                anio: anio,
            });
            setReportes(data);
            alertify.success(`Reporte generado para ${meses.find(m => m.value === parseInt(mes))?.label} ${anio}`);
        } catch (error) {
            alertify.error("Error al generar el reporte");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const exportToExcel = () => {
        const mesNombre = meses.find(m => m.value === parseInt(mes))?.label || mes;

        // Preparar datos para Excel
        const excelData = filteredData.map(row => {
            const rowData = {
                'DNI': row.tra_codigo,
                'Nombre': row.nombre,
            };

            // Agregar días del mes como valores numéricos
            for (let i = 1; i <= getDiasDelMes(); i++) {
                const diaKey = `dia_${String(i).padStart(2, '0')}`;
                const valor = row[diaKey];

                // Convertir a número o dejar vacío/guión
                if (valor === '-' || valor === null || valor === undefined) {
                    rowData[`Día ${i}`] = valor || '';
                } else if (valor === '0.00') {
                    rowData[`Día ${i}`] = 0;
                } else {
                    // Convertir el string a número decimal
                    const numValue = parseFloat(valor);
                    rowData[`Día ${i}`] = isNaN(numValue) ? valor : numValue;
                }
            }

            // Agregar totales como números
            rowData['TOTAL'] = parseFloat(row.total_horas) || 0;
            rowData['HRS. TEÓR.'] = parseFloat(row.horas_teoricas) || 0;

            const diferenciaHoras = calcularDiferenciaHoras(row.horas_teoricas, row.total_horas);
            rowData['HRS. EXT.'] = row.horas_extras;

            rowData['HRS. TAR.'] = parseFloat(row.total_tardanza) || '';
            rowData['HRS. PER.'] = parseFloat(row.total_horas_permiso) || '';
            rowData['FALTAS'] = parseInt(row.total_faltas) || 0;
            rowData['ASIST.'] = parseInt(row.dias_asistidos) || 0;

            return rowData;
        });

        const ws = XLSX.utils.json_to_sheet(excelData);

        // Opcional: Configurar formato de columnas numéricas
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = 2; C <= range.e.c; C++) { // Desde la columna de días
            const address = XLSX.utils.encode_col(C) + "1";
            if (!ws[address]) continue;

            // Aplicar formato numérico a las columnas de horas
            for (let R = 2; R <= range.e.r + 1; R++) {
                const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                if (ws[cellAddress] && typeof ws[cellAddress].v === 'number') {
                    ws[cellAddress].z = '0.00'; // Formato con 2 decimales
                }
            }
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Reporte");

        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const blob = new Blob([wbout], { type: "application/octet-stream" });
        saveAs(blob, `reporte_asistencias_${mesNombre}_${anio}.xlsx`);
    };

    const exportToPDF = () => {
        const mesNombre = meses.find(m => m.value === parseInt(mes))?.label || mes;
        const doc = new jsPDF({
            orientation: "landscape",
            unit: "mm",
            format: "a3", // Usar A3 para más espacio
        });

        doc.text(`Reporte de Asistencias - ${mesNombre} ${anio}`, 14, 15);

        // Preparar columnas
        const tableColumn = ['DNI', 'Nombre'];
        for (let i = 1; i <= getDiasDelMes(); i++) {
            tableColumn.push(i.toString());
        }
        tableColumn.push('TOTAL', 'HRS. TEÓR.', 'HRS. EXT.', 'HRS. TAR.', 'HRS. PER.', 'FALTAS', 'ASIST.');

        // Preparar filas
        const tableRows = filteredData.map((row) => {
            const rowData = [row.tra_codigo, row.nombre];

            for (let i = 1; i <= getDiasDelMes(); i++) {
                const diaKey = `dia_${String(i).padStart(2, '0')}`;
                rowData.push(row[diaKey] || '');
            }

            rowData.push(row.total_horas, row.horas_teoricas, calcularDiferenciaHoras(row.horas_teoricas, row.total_horas) < 0 ? '' : calcularDiferenciaHoras(row.horas_teoricas, row.total_horas), row.total_tardanza == "00:00:00" ? "" : row.total_tardanza, row.total_horas_permiso == "00:00:00" ? "" : row.total_horas_permiso, row.total_faltas, row.dias_asistidos);
            return rowData;
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            styles: { fontSize: 6, cellPadding: 1 },
            headStyles: { fillColor: [41, 128, 185] },
        });

        doc.save(`reporte_asistencias_${mesNombre}_${anio}.pdf`);
    };

    return (
        <div>
            <h1 className="h3 mb-4 text-gray-800">Reporte de Asistencias por Mes</h1>

            {/* Controles */}
            <div className="row mb-3">
                <div className="col-md-2">
                    <Form.Label className="d-block">Mes</Form.Label>
                    <Form.Select
                        value={mes}
                        onChange={(e) => setMes(parseInt(e.target.value))}
                        className="form-control"
                    >
                        {meses.map((m) => (
                            <option key={m.value} value={m.value}>
                                {m.label}
                            </option>
                        ))}
                    </Form.Select>
                </div>

                <div className="col-md-2">
                    <Form.Label className="d-block">Año</Form.Label>
                    <Form.Select
                        value={anio}
                        onChange={(e) => setAnio(parseInt(e.target.value))}
                        className="form-control"
                    >
                        {generarAnios().map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </Form.Select>
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
                                <i className="fas fa-search"></i> Generar
                            </>
                        )}
                    </Button>
                </div>

                <div className="col-md-2">
                    <Form.Label className="d-block">&nbsp;</Form.Label>
                    <DropdownButton
                        id="dropdown-export"
                        title="Exportar"
                        variant="success"
                        className="w-100"
                        disabled={reportes.length === 0}
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

                <div className="col-md-4">
                    <Form.Label className="d-block">&nbsp;</Form.Label>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="🔍 Buscar por nombre o DNI..."
                        value={filterText}
                        onChange={(e) => setFilterText(e.target.value)}
                    />
                </div>
            </div>

            {/* Tabla de reporte */}
            <div className="card">
                <div className="card-header">
                    <h5 className="mb-0">
                        Reporte de Asistencias - {meses.find(m => m.value === parseInt(mes))?.label} {anio}
                    </h5>
                </div>
                <div className="card-body p-0">
                    {reportes.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                            <p className="text-muted">
                                No hay datos para mostrar. Selecciona un mes y año, luego presiona "Generar".
                            </p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <Table striped bordered hover size="sm" className="mb-0">
                                <thead className="table-dark sticky-top">
                                    <tr>
                                        <th rowSpan="2" className="text-center align-middle" style={{ minWidth: '100px' }}>DNI</th>
                                        <th rowSpan="2" className="text-center align-middle" style={{ minWidth: '200px' }}>NOMBRE</th>
                                        <th colSpan={getDiasDelMes()} className="text-center">DÍAS DEL MES</th>
                                        <th rowSpan="2" className="text-center align-middle" style={{ minWidth: '80px' }}>TOTAL</th>
                                        <th rowSpan="2" className="text-center align-middle" style={{ minWidth: '80px' }}>HRS. TEÓR.</th>
                                        <th rowSpan="2" className="text-center align-middle">HRS. EXT.</th>
                                        <th rowSpan="2" className="text-center align-middle">HRS. TAR.</th>
                                        <th rowSpan="2" className="text-center align-middle">HRS. PER.</th>
                                        <th rowSpan="2" className="text-center align-middle" style={{ minWidth: '70px' }}>FALTAS</th>
                                        <th rowSpan="2" className="text-center align-middle" style={{ minWidth: '70px' }}>ASIST.</th>
                                    </tr>
                                    <tr>
                                        {Array.from({ length: getDiasDelMes() }, (_, i) => i + 1).map(dia => (
                                            <th key={dia} className="text-center" style={{ minWidth: '35px', fontSize: '0.75rem' }}>
                                                <div>{dia}</div>
                                                <div className="text-muted" style={{ fontSize: '0.65rem' }}>
                                                    {getDiaSemana(dia)}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map((row, index) => (
                                        <tr key={index}>
                                            <td className="text-center">{row.tra_codigo}</td>
                                            <td>{row.nombre}</td>
                                            {Array.from({ length: getDiasDelMes() }, (_, i) => i + 1).map(dia => {
                                                const diaKey = `dia_${String(dia).padStart(2, '0')}`;
                                                const valor = row[diaKey];
                                                return (
                                                    <td
                                                        key={dia}
                                                        className={`text-center ${getCellClass(valor)}`}
                                                        style={{ fontSize: '0.75rem', padding: '4px' }}
                                                    >
                                                        {valor}
                                                    </td>
                                                );
                                            })}
                                            <td className="text-center fw-bold">{row.total_horas}</td>
                                            <td className="text-center text-muted" style={{ fontSize: '0.75rem' }}>
                                                {row.horas_teoricas}
                                            </td>
                                            <td className="text-center text-info fw-bold">{row.horas_extras}</td>
                                            <td className="text-center text-warning fw-bold">{row.total_tardanza == "00:00:00" ? "" : row.total_tardanza}</td>
                                            <td className="text-center text-primary fw-bold">{row.total_horas_permiso == "00:00:00" ? "" : row.total_horas_permiso}</td>
                                            <td className="text-center text-danger fw-bold">{row.total_faltas}</td>
                                            <td className="text-center text-success fw-bold">{row.dias_asistidos}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    )}
                </div>
            </div>

            {/* Leyenda */}
            {reportes.length > 0 && (
                <div className="card mt-3">
                    <div className="card-body">
                        <h6 className="card-title">Leyenda:</h6>
                        <div className="d-flex gap-3 flex-wrap">
                            <div className="d-flex align-items-center">
                                <div className="bg-danger text-white px-2 py-1 me-2" style={{ fontSize: '0.75rem' }}>0.00</div>
                                <span>Falta (día laborable sin asistencia)</span>
                            </div>
                            <div className="d-flex align-items-center">
                                <div className="bg-secondary text-white px-2 py-1 me-2" style={{ fontSize: '0.75rem' }}>-</div>
                                <span>Día no laborable (descanso)</span>
                            </div>
                            {/*<div className="d-flex align-items-center">
                                <div className="bg-white border px-2 py-1 me-2" style={{ fontSize: '0.75rem' }}>8.50</div>
                                <span>Horas trabajadas</span>
                            </div>*/}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}