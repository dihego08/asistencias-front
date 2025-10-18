import { useState, useEffect } from 'react';
import {
    getHorarios
} from "../services/horariosService";
import { Form } from 'react-bootstrap';

export default function SelectHorario({ value, onChange }) {
    const [horarios, setHorarios] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listar();
    }, []);

    const listar = async () => {
        const data = await getHorarios();
        setLoading(false);
        setHorarios(data);
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
            {horarios.map((horario) => (
                <option key={horario.id} value={horario.id}>
                    {horario.nombre}
                </option>
            ))}
        </Form.Control>
    );
}