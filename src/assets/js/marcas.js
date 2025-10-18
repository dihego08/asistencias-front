let current = null;
$(document).ready(function () {
    lista_marcas();
});
function lista_marcas() {
    $.post("ws/service.php?parAccion=lista_marcas", function (response) {
        var obj = JSON.parse(response);
        $("#tabla-marcas").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-marcas").find("tbody").append(`<tr>
                <td>${val.id}</td>
                <td>${val.marca}</td>
                <td>
                    <span class="btn btn-outline-warning btn-sm d-block mb-1" data-toggle="modal" data-target="#formulario" onclick="editar_marca(${val.id});"><i class="fa fa-edit"></i></span>
                    <span  class="btn btn-outline-danger btn-sm d-block" onclick="eliminar_marca(${val.id});"><i class="fa fa-trash"></i></span>
                </td>
                </tr>`);
        });
    });
}
function actualizar_marca(id) {
    $.post("ws/service.php?parAccion=actualizar_marca", {
        marca: $("#marca").val(),
        id: id,
        fecha_creacion: current.fecha_creacion,
        id_usuario_creacion: current.id_usuario_creacion
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se modificó correctamente.");
            lista_marcas();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function insertar_marca() {
    $.post("ws/service.php?parAccion=insertar_marca", {
        marca: $("#marca").val()
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            lista_marcas();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function nueva_marca() {
    $("#marcaModalLabel").text("Nueva Marca");
    $("#btn-accion-marca").text("Guardar");
    $("#btn-accion-marca").attr("onclick", "insertar_marca();");
}
function limpiar_formulario(){
    $(".form-control").val('');
    $("select").val(0);
}
function editar_marca(id) {
    $("#marcaModalLabel").text("Editar Marca");
    $("#btn-accion-marca").text("Actualizar");
    $("#btn-accion-marca").attr("onclick", "actualizar_marca(" + id + ");");
    $.post("ws/service.php?parAccion=editar_marca", {
        id: id
    }, function (response) {
        var obj = JSON.parse(response);
        current = obj;
        $("#marca").val(obj.marca);
    });
}
function eliminar_marca(id) {
    alertify.confirm('¿Eliminar marca?', 'Esta acción no se puede deshacer', function () {
        $.post("ws/service.php?parAccion=eliminar_marca", {
            id: id
        }, function (response) {
            var obj = JSON.parse(response);
            if (obj.Result == "OK") {
                alertify.success("Se eliminó correctamente.");
                lista_marcas();
            } else {
                alertify.error("Algo ha salido terriblemente mal.");
            }
        });
    }, function () {
        alertify.error('Cancel')
    });
}