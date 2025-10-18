import { useState } from "react";
import { Button, Form, Card } from "react-bootstrap";
import alertify from "alertifyjs";
import { loginUser } from "../services/loginService";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await loginUser({ username, password });

            if (res.token) {
                localStorage.setItem("token", res.token);
                localStorage.setItem("usuario", JSON.stringify(res.user));
                alertify.success("Inicio de sesión exitoso");

                // Redirigir (ajusta según tu router)
                window.location.href = "/colaboradores";
            } else {
                alertify.error(res.error || "Credenciales incorrectas");
            }
        } catch (err) {
            console.error(err);
            alertify.error("Error al iniciar sesión");
            setError("Usuario o contraseña incorrectos");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center">
            <div className="card p-4 shadow" style={{ width: 400 }}>
                <h3 className="text-center mb-3">Iniciar Sesión</h3>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="form-group mb-3">
                        <label>Usuario</label>
                        <input
                            type="text"
                            className="form-control"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="form-group mb-3">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">
                        Ingresar
                    </button>
                </form>
            </div>
        </div>
    );
}
