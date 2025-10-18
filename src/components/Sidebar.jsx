import { NavLink    } from "react-router-dom";
import logo from "../assets/img/logo.png";
export default function Sidebar() {
  return (
    <ul className="navbar-nav bg-gradient-primary-alt sidebar sidebar-dark accordion" id="accordionSidebar">

      <div id="sidebar-brand-logo">
        <a class="sidebar-brand d-flex align-items-center justify-content-center" href="index.html">
          <div class="sidebar-brand-icon">
            <img src={logo} class="w-100" alt=""></img>
          </div>
        </a>
      </div>

      <hr className="sidebar-divider my-0"></hr>

      <li className="nav-item active">
        <NavLink  className="nav-link" to="index.html">
          <i className="fas fa-fw fa-tachometer-alt"></i>
          <span>Dashboard</span></NavLink >
      </li>

      <hr className="sidebar-divider"></hr>

      <div className="sidebar-heading">
        Asistencias
      </div>

      <li className="nav-item">
        <a className="nav-link " to="#" data-toggle="collapse" data-target="#collapsePages"
          aria-expanded="true" aria-controls="collapsePages">
          <i className="fas fa-fw fa-folder"></i>
          <span>Control</span>
        </a>
        <div id="collapsePages" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
          <div className="bg-brown py-2 collapse-inner rounded">
          <NavLink  className="collapse-item" to="colaboradores">Colaboradores</NavLink >
            <NavLink  className="collapse-item" to="relojes">Relojes</NavLink >
            <NavLink  className="collapse-item" to="feriados">Feriados</NavLink >
            <NavLink  className="collapse-item" to="permisos">Permisos</NavLink >
            <NavLink  className="collapse-item" to="horarios">Horarios</NavLink >
            <NavLink  className="collapse-item" to="asignar">Asignar Horario</NavLink >
            <NavLink  className="collapse-item" to="tipos_permisos">Tipos de Permisos</NavLink >
          </div>
        </div>
      </li>

      <hr className="sidebar-divider"></hr>

      <div className="sidebar-heading">
        Reportes
      </div>

      <li className="nav-item">
        <a className="nav-link" to="#" data-toggle="collapse" data-target="#collapsePOS"
          aria-expanded="true" aria-controls="collapsePOS">
          <i className="fas fa-fw fa-folder"></i>
          <span>Ventas</span>
        </a>
        <div id="collapsePOS" className="collapse" aria-labelledby="headingPages" data-parent="#accordionSidebar">
          <div className="bg-brown py-2 collapse-inner rounded">
            <NavLink  className="collapse-item" to="venta">Nueva Venta</NavLink >
            <NavLink  className="collapse-item" to="ventas">Lista Ventas</NavLink >
          </div>
        </div>
      </li>

      <hr className="sidebar-divider d-none d-md-block"></hr>

      <div className="text-center d-none d-md-inline">
        <button className="rounded-circle border-0" id="sidebarToggle"></button>
      </div>

    </ul>
  );
}
