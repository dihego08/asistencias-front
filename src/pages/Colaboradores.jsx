import { useEffect, useState } from "react";
import Switch from "react-switch";
import {
    getColaboradores, createColaborador, deleteColaborador, updateColaborador, actualizarEstadoColaborador, actualizarMarcacionColaborador
} from "../services/colaboradoresService";
import { Modal, Button, Form } from "react-bootstrap";
import alertify from 'alertifyjs';

export default function Colaboradores() {
    const [colaboradores, setColaboradores] = useState([]);
    const [loadingId, setLoadingId] = useState(null);

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
                <div className="table-response w-100">
                    <table className="table table-bordered table-striped" id="tabla-marcas">
                        <thead>
                            <tr>
                                <th>Id</th>
                                <th>Nombres</th>
                                <th>Apellidos Paterno</th>
                                <th>Apellidos Materno</th>
                                <th>DNI</th>
                                <th>Fecha Nacimiento</th>
                                <th>Estado</th>
                                <th>¿Controlar Marcación?</th>
                            </tr>
                        </thead>
                        <tbody>
                            {colaboradores.map((c) => (
                                <tr key={c.id}>
                                    <td>{c.id}</td>
                                    <td>{c.nombres}</td>
                                    <td>{c.apellido_paterno}</td>
                                    <td>{c.apellido_materno}</td>
                                    <td>{c.dni}</td>
                                    <td>{c.fecha_nacimiento}</td>
                                    <td className="text-center">
                                        <Switch
                                            checked={c.estado === 1}
                                            onChange={(checked) => handleEstadoChange(c.id, checked)}
                                            onColor="#28a745"
                                            offColor="#e74a3b"
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            disabled={loadingId === c.id}
                                        />
                                    </td>
                                    <td className="text-center">
                                        <Switch
                                            checked={c.marcacion === 1}
                                            onChange={(checked) => handleMarcacionChange(c.id, checked)}
                                            onColor="#28a745"
                                            offColor="#ccc"
                                            uncheckedIcon={false}
                                            checkedIcon={false}
                                            disabled={loadingId === c.id}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}