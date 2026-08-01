import { useState, useEffect } from 'react';
import {
    getColaboradores
} from "../services/colaboradoresService";
import { Form } from 'react-bootstrap';

export default function SelectColaborador({ value, onChange }) {
    const [colaboradores, setColaboradores] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listar();
    }, []);

    const listar = async () => {
        const data = await getColaboradores();
        setLoading(false);
        setColaboradores(data);
    };

    if (loading) return <p>Cargando...</p>;

    return (
        <Form.Control
            as="select"
            value={value || ""}
            onChange={(e) => {
                const selectedOption = e.target.options[e.target.selectedIndex];
                onChange({
                    id: e.target.value,
                    nombre: selectedOption.text,
                    dni: selectedOption.dataset.dni || ""
                });
            }}
            className="form-control"
        >
            <option value="">--SELECCIONE--</option>
            {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id} data-dni={colaborador.dni}>
                    {colaborador.nombres} {colaborador.apellido_paterno} {colaborador.apellido_materno}
                </option>
            ))}
        </Form.Control>
    );
}