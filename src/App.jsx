import "./assets/vendor/fontawesome-free/css/all.min.css";

import "./assets/css/sb-admin-2.min.css";
import "./assets/css/stylo.css";
import 'alertifyjs/build/css/alertify.min.css';
import 'alertifyjs/build/css/themes/default.min.css';
import { BrowserRouter as Router, Routes, Route, NavLink } from "react-router-dom";
import { useState } from "react";
import Relojes from "./pages/Relojes";
import Feriados from "./pages/Feriados";
import Permisos from "./pages/Permisos";
import Horarios from "./pages/Horarios";
import TiposPermisos from "./pages/TiposPermisos";
import Colaboradores from "./pages/Colaboradores";
import Sidebar from "./components/Sidebar";
import AsignarHorarioModal from "./pages/AsignarHorario";
import img_user from "./assets/img/undraw_profile.svg";

// Placeholder CRUD pages
const Areas = () => <div className="p-4">Gestión de Áreas</div>;
const Puestos = () => <div className="p-4">Gestión de Puestos</div>;
// const Colaboradores = () => <div className="p-4">Gestión de Colaboradores</div>;
// const Horarios = () => <div className="p-4">Gestión de Horarios</div>;
// const Feriados = () => <div className="p-4">Gestión de Feriados</div>;
// const Permisos = () => <div className="p-4">Gestión de Permisos</div>;
//const Relojes = () => <div className="p-4">Gestión de Relojes</div>;
const Marcaciones = () => <div className="p-4">Gestión de Marcaciones</div>;

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems = [
    { path: "/areas", label: "Áreas" },
    { path: "/puestos", label: "Puestos" },
    { path: "/colaboradores", label: "Colaboradores" },
    { path: "/horarios", label: "Horarios" },
    { path: "/feriados", label: "Feriados" },
    { path: "/permisos", label: "Permisos" },
    { path: "/relojes", label: "Relojes" },
    { path: "/marcaciones", label: "Marcaciones" },
    { path: "/asignar", label: "Asignar Horario" },
    { path: "/tipos_permisos", label: "Tipos de Permisos" },
    { path: "/colaboradores", label: "Colaboradores" }
  ];

  return (
    <Router>
      <div id="wrapper">
        <Sidebar />
        <div id="content-wrapper" className="d-flex flex-column">
          <div id="content">
            <nav className="navbar navbar-expand navbar-light bg-brown-alt topbar mb-4 static-top shadow" >
              <button id="sidebarToggleTop" className="btn btn-link d-md-none rounded-circle mr-3">
                <i className="fa fa-bars"></i>
              </button>
              <ul className="navbar-nav ml-auto">
                <div className="topbar-divider d-none d-sm-block"></div>
                <li className="nav-item dropdown no-arrow" id="li-user">
                  <a className="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-toggle="dropdown" aria-haspopup="true"
                    aria-expanded="false">
                    <span className="mr-2 d-none d-lg-inline small text-white" id="span-usuario">Diego Engelbert Aranibar Ramos</span>
                    <img className="img-profile rounded-circle" src={img_user} />
                  </a>
                  <div className="dropdown-menu dropdown-menu-right shadow animated--grow-in" aria-labelledby="userDropdown">
                    <div className="dropdown-divider"></div>
                    <span className="dropdown-item" onclick="cerrar_session();" data-toggle="modal" data-target="#logoutModal">
                      <i className="fas fa-sign-out-alt fa-sm fa-fw mr-2 text-gray-400"></i>
                      Cerrar Sesión
                    </span>
                  </div>
                </li>
              </ul>
            </nav>
            <div className="container-fluid">
              <Routes>
                <Route path="/feriados" element={<Feriados />} />
                <Route path="/relojes" element={<Relojes />} />
                <Route path="/marcaciones" element={<Marcaciones />} />
                <Route path="/permisos" element={<Permisos />} />
                <Route path="/horarios" element={<Horarios />} />
                <Route path="/puestos" element={<Puestos />} />
                <Route path="/areas" element={<Areas />} />
                <Route path="/asignar" element={<AsignarHorarioModal />} />
                <Route path="/tipos_permisos" element={<TiposPermisos />} />
                <Route path="/colaboradores" element={<Colaboradores />} />
              </Routes>
            </div>
          </div>
          <footer className="sticky-footer bg-white" id="footer-dom">
            <div className="container my-auto">
              <div className="copyright text-center my-auto">
                <span>Copyright © DB Digital Business 2025</span>
              </div>
            </div>
          </footer>
        </div>
      </div>
      <a className="scroll-to-top rounded" href="#page-top">
        <i className="fas fa-angle-up"></i>
      </a>
    </Router>
  );
}
