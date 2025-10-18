let current = null;
$(document).ready(function () {
    lista_sucursales();
});
function lista_sucursales() {
    $.post("ws/service.php?parAccion=lista_sucursales", function (response) {
        var obj = JSON.parse(response);
        $("#tabla-sucursales").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-sucursales").find("tbody").append(`<tr>
                <td>${val.id}</td>
                <td>${val.sucursal}</td>
                <td>${val.direccion}</td>
                <td>
                    <span class="btn btn-outline-warning btn-sm d-block mb-1" data-toggle="modal" data-target="#formulario" onclick="editar_sucursal(${val.id});"><i class="fa fa-edit"></i></span>
                    <span  class="btn btn-outline-danger btn-sm d-block" onclick="eliminar_sucursal(${val.id});"><i class="fa fa-trash"></i></span>
                </td>
                </tr>`);
        });
    });
}
function actualizar_sucursal(id) {
    $.post("ws/service.php?parAccion=actualizar_sucursal", {
        sucursal: $("#sucursal").val(),
        direccion: $("#direccion").val(),
        id: id,
        fecha_creacion: current.fecha_creacion,
        id_usuario_creacion: current.id_usuario_creacion
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se modificó correctamente.");
            lista_sucursales();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function insertar_sucursal() {
    $.post("ws/service.php?parAccion=insertar_sucursal", {
        sucursal: $("#sucursal").val(),
        direccion: $("#direccion").val()
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            lista_sucursales();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function nueva_sucursal() {
    $("#sucursalModalLabel").text("Nueva Sucursal");
    $("#btn-accion-sucursal").text("Guardar");
    $("#btn-accion-sucursal").attr("onclick", "insertar_sucursal();");
}
function limpiar_formulario(){
    $(".form-control").val('');
    $("select").val(0);
}
function editar_sucursal(id) {
    $("#sucursalModalLabel").text("Editar Sucursal");
    $("#btn-accion-sucursal").text("Actualizar");
    $("#btn-accion-sucursal").attr("onclick", "actualizar_sucursal(" + id + ");");
    $.post("ws/service.php?parAccion=editar_sucursal", {
        id: id
    }, function (response) {
        var obj = JSON.parse(response);
        current = obj;
        $("#sucursal").val(obj.sucursal);
        $("#direccion").val(obj.direccion);
    });
}
function eliminar_sucursal(id) {
    alertify.confirm('¿Eliminar Sucursal?', 'Esta acción no se puede deshacer', function () {
        $.post("ws/service.php?parAccion=eliminar_sucursal", {
            id: id
        }, function (response) {
            var obj = JSON.parse(response);
            if (obj.Result == "OK") {
                alertify.success("Se eliminó correctamente.");
                lista_sucursales();
            } else {
                alertify.error("Algo ha salido terriblemente mal.");
            }
        });
    }, function () {
        alertify.error('Cancel')
    });
}