let current = null;
let id_selected = null;
$(document).ready(function () {
    lista_proveedores();
});
function lista_proveedores() {
    $('#tabla-proveedores').DataTable().clear().destroy();
    $.post("ws/service.php?parAccion=lista_proveedores", function (response) {
        var obj = JSON.parse(response);
        $("#tabla-proveedores").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-proveedores").find("tbody").append(`<tr>
                <td>${val.id}</td>
                <td>${val.nombres}</td>
                <td>${val.n_documento}</td>
                <td>${val.email}</td>
                <td>${val.telefono}</td>
                <td>  
                    <span class="btn btn-outline-warning btn-sm d-block mb-1" data-toggle="modal" data-target="#formulario" onclick="editar_proveedor(${val.id});"><i class="fa fa-edit"></i></span>
                    <span  class="btn btn-outline-danger btn-sm d-block" onclick="eliminar_proveedor(${val.id});"><i class="fa fa-trash"></i></span>
                </td>
                </tr>`);
        });
        $("#tabla-proveedores").DataTable({
            scrollX: true,       // Habilita el desplazamiento horizontal
            autoWidth: false,    // Evita que DataTables ajuste el ancho automáticamente
            responsive: true,    // Permite que la tabla se adapte
            searching: true,     // Habilita el buscador
            paging: true,        // Habilita paginación
            ordering: true,      // Habilita ordenación
            info: true,
            dom: 'Brftip',
            "language": {
                "url": "./js/Spanish.json"
            },
            buttons: [
                'excel'
            ]
        });
    });
}
function actualizar_proveedor(id) {
    $.post("ws/service.php?parAccion=actualizar_proveedor", {
        id: id,
        nombres: $("#nombres").val(),
        n_documento: $("#n_documento").val(),
        direccion: $("#direccion").val(),
        telefono: $("#telefono").val(),
        email: $("#email").val(),
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se modificó correctamente.");
            lista_proveedores();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function insertar_proveedor() {
    $.post("ws/service.php?parAccion=insertar_proveedor", {
        nombres: $("#nombres").val(),
        n_documento: $("#n_documento").val(),
        direccion: $("#direccion").val(),
        telefono: $("#telefono").val(),
        email: $("#email").val(),
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            lista_proveedores();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function nuevo_proveedor() {
    $("#proveedorModalLabel").text("Nuevo Proveedor");
    $("#btn-accion-proveedor").text("Guardar");
    $("#btn-accion-proveedor").attr("onclick", "insertar_proveedor();");
}
function editar_proveedor(id) {
    $("#proveedorModalLabel").text("Editar Proveedor");
    $("#btn-accion-proveedor").text("Actualizar");
    $("#btn-accion-proveedor").attr("onclick", "actualizar_proveedor(" + id + ");");
    $.post("ws/service.php?parAccion=editar_proveedor", {
        id: id
    }, function (response) {
        var obj = JSON.parse(response);
        current = obj;

        /*$("#nombres").val(obj.nombres)
        $("#dni").val(obj.dni)
        $("#id_sucursal").val(obj.id_sucursal)
        $("#grado").val(obj.grado)
        $("#seccion").val(obj.seccion)
        $("#id_tipo_proveedor").val(obj.id_tipo_proveedor)
        $("#padre").val(obj.padre)
        $("#celular").val(obj.celular)
        $("#saldo").val(obj.saldo)
        $("#correo").val(obj.correo)*/

        $("#nombres").val(obj.nombres);
        $("#n_documento").val(obj.n_documento);
        $("#direccion").val(obj.direccion);
        $("#telefono").val(obj.telefono);
        $("#email").val(obj.email);
    });
}
function limpiar_formulario() {
    $(".form-control").val('');
    $("select").val(0);
}
function eliminar_proveedor(id) {
    alertify.confirm('¿Eliminar este proveedor?', 'Esta acción no se puede deshacer', function () {
        $.post("ws/service.php?parAccion=eliminar_proveedor", {
            id: id
        }, function (response) {
            var obj = JSON.parse(response);
            if (obj.Result == "OK") {
                alertify.success("Se agregó correctamente.");
                lista_proveedores();
            } else {
                alertify.error("Algo ha salido terriblemente mal.");
            }
        });
    }, function () {
        alertify.error('Cancel')
    });
}