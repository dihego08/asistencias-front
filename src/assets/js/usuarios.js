let current = null;
$(document).ready(function () {
    lista_usuarios();
    lista_sucursales();
    lista_roles();
});
function lista_roles() {
    $.post("ws/service.php?parAccion=lista_roles", function (response) {
        var obj = JSON.parse(response);
        $("#id_rol").append(`<option value="0">--SELECCIONE--</option>`);
        $.each(obj, function (index, val) {
            $("#id_rol").append(`<option value="${val.id}">${val.rol}</option>`);
        });
    });
}
function lista_sucursales() {
    $.post("ws/service.php?parAccion=lista_sucursales", function (response) {
        var obj = JSON.parse(response);
        $("#id_sucursal").append(`<option value="0">--SELECCIONE--</option>`);
        $.each(obj, function (index, val) {
            $("#id_sucursal").append(`<option value="${val.id}">${val.sucursal}</option>`);
        });
    });
}
function lista_usuarios() {
    $.post("ws/service.php?parAccion=lista_usuarios", function (response) {
        var obj = JSON.parse(response);
        $("#tabla-usuarios").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-usuarios").find("tbody").append(`<tr>
                <td>${val.id}</td>
                <td>${val.nombres}</td>
                <td>${val.dni}</td>
                <td>${val.sucursal}</td>
                <td>${val.usuario}</td>
                <td>${val.rol}</td>
                <td>
                    <span class="btn btn-outline-warning btn-sm d-block mb-1" data-toggle="modal" data-target="#formulario" onclick="editar_usuario(${val.id});"><i class="fa fa-edit"></i></span>
                    <span  class="btn btn-outline-danger btn-sm d-block" onclick="eliminar_usuario(${val.id});"><i class="fa fa-trash"></i></span>
                </td>
                </tr>`);
        });
    });
}
function actualizar_usuario(id) {
    $.post("ws/service.php?parAccion=actualizar_usuario", {
        id_sucursal: $("#id_sucursal").val(),
        id_rol: $("#id_rol").val(),
        nombres: $("#nombres").val(),
        dni: $("#dni").val(),
        usuario: $("#usuario").val(),
        pass: $("#pass").val(),
        id: id,
        fecha_creacion: current.fecha_creacion,
        id_usuario_creacion: current.id_usuario_creacion
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se modificó correctamente.");
            lista_usuarios();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function insertar_usuario() {
    $.post("ws/service.php?parAccion=insertar_usuario", {
        id_sucursal: $("#id_sucursal").val(),
        id_rol: $("#id_rol").val(),
        nombres: $("#nombres").val(),
        dni: $("#dni").val(),
        usuario: $("#usuario").val(),
        pass: $("#pass").val(),
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            lista_usuarios();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function nuevo_usuario() {
    $("#usuarioModalLabel").text("Nuevo Usuario");
    $("#btn-accion-usuario").text("Guardar");
    $("#btn-accion-usuario").attr("onclick", "insertar_usuario();");
}
function editar_usuario(id) {
    $("#usuarioModalLabel").text("Editar Usuario");
    $("#btn-accion-usuario").text("Actualizar");
    $("#btn-accion-usuario").attr("onclick", "actualizar_usuario(" + id + ");");
    $.post("ws/service.php?parAccion=editar_usuario", {
        id: id
    }, function (response) {
        var obj = JSON.parse(response);
        current = obj;
        $("#id_sucursal").val(obj.id_sucursal);
        $("#nombres").val(obj.nombres);
        $("#dni").val(obj.dni);
        $("#usuario").val(obj.usuario);
        $("#id_rol").val(obj.id_rol);
    });
}
function limpiar_formulario(){
    $(".form-control").val('');
    $("select").val(0);
}
function eliminar_usuario(id) {
    alertify.confirm('¿Eliminar este Usuario?', 'Esta acción no se puede deshacer', function () {
        $.post("ws/service.php?parAccion=eliminar_usuario", {
            id: id
        }, function (response) {
            var obj = JSON.parse(response);
            if (obj.Result == "OK") {
                alertify.success("Se eliminó correctamente.");
                lista_usuarios();
            } else {
                alertify.error("Algo ha salido terriblemente mal.");
            }
        });
    }, function () {
        alertify.error('Cancel')
    });
}