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
            onChange={(e) => onChange(e.target.value)}
            className="form-control"
        >
            <option value="">--SELECCIONE--</option>
            {colaboradores.map((colaborador) => (
                <option key={colaborador.id} value={colaborador.id}>
                    {colaborador.nombres} {colaborador.apellido_paterno} {colaborador.apellido_materno}
                </option>
            ))}
        </Form.Control>
    );
}