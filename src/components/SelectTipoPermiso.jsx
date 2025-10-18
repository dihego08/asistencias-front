import { useState, useEffect } from 'react';
import {
    getTiposPermisos
} from "../services/tiposPermisosService";
import { Form } from 'react-bootstrap';

export default function SelectTipoPermiso({ value, onChange }) {
    const [tiposPermisos, setTiposPermisos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        listar();
    }, []);

    const listar = async () => {
        const data = await getTiposPermisos();
        setLoading(false);
        setTiposPermisos(data);
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
            {tiposPermisos.map((tipo_permiso) => (
                <option key={tipo_permiso.id} value={tipo_permiso.id}>
                    {tipo_permiso.nombres} {tipo_permiso.tipo}
                </option>
            ))}
        </Form.Control>
    );
}