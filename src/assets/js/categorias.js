let current = null;
$(document).ready(function () {
    lista_categorias();
});
function lista_categorias() {
    $.post("ws/service.php?parAccion=lista_categorias", function (response) {
        var obj = JSON.parse(response);
        $("#tabla-categorias").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-categorias").find("tbody").append(`<tr>
                <td>${val.id}</td>
                <td>${val.categoria}</td>
                <td>
                    <span class="btn btn-outline-warning btn-sm d-block mb-1" data-toggle="modal" data-target="#formulario" onclick="editar_categoria(${val.id});"><i class="fa fa-edit"></i></span>
                    <span  class="btn btn-outline-danger btn-sm d-block" onclick="eliminar_categoria(${val.id});"><i class="fa fa-trash"></i></span>
                </td>
                </tr>`);
        });
    });
}
function actualizar_categoria(id) {
    $.post("ws/service.php?parAccion=actualizar_categoria", {
        categoria: $("#categoria").val(),
        id: id,
        fecha_creacion: current.fecha_creacion,
        id_usuario_creacion: current.id_usuario_creacion
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se modificó correctamente.");
            lista_categorias();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function insertar_categoria() {
    $.post("ws/service.php?parAccion=insertar_categoria", {
        categoria: $("#categoria").val()
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            lista_categorias();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function nueva_categoria() {
    $("#categoriaModalLabel").text("Nueva Categoria");
    $("#btn-accion-categoria").text("Guardar");
    $("#btn-accion-categoria").attr("onclick", "insertar_categoria();");
}
function limpiar_formulario(){
    $(".form-control").val('');
    $("select").val(0);
}
function editar_categoria(id) {
    $("#categoriaModalLabel").text("Editar Categoria");
    $("#btn-accion-categoria").text("Actualizar");
    $("#btn-accion-categoria").attr("onclick", "actualizar_categoria(" + id + ");");
    $.post("ws/service.php?parAccion=editar_categoria", {
        id: id
    }, function (response) {
        var obj = JSON.parse(response);
        current = obj;
        $("#categoria").val(obj.categoria);
    });
}
function eliminar_categoria(id) {
    alertify.confirm('¿Eliminar Categoria?', 'Esta acción no se puede deshacer', function () {
        $.post("ws/service.php?parAccion=eliminar_categoria", {
            id: id
        }, function (response) {
            var obj = JSON.parse(response);
            if (obj.Result == "OK") {
                alertify.success("Se eliminó correctamente.");
                lista_categorias();
            } else {
                alertify.error("Algo ha salido terriblemente mal.");
            }
        });
    }, function () {
        alertify.error('Cancel')
    });
}