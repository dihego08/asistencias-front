let current = null;
$(document).ready(function () {

    lista_sucursales();

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;
    $("#fecha_hasta").val(today);
    today = new Date();
    today.setMonth(today.getMonth() - 1); // Restar 1 mes

    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); // Enero es 0
    var yyyy = today.getFullYear();
    let last_month = yyyy + '-' + mm + '-' + dd;

    $("#fecha_desde").val(last_month);

    lista_gastos();

    $(".fecha").datetimepicker({
        format: "Y-m-d",
        timepicker: false
    });
    $.datetimepicker.setLocale('es');
});
function lista_sucursales() {
    $.post("ws/service.php?parAccion=lista_sucursales", function (response) {
        var obj = JSON.parse(response);
        $("#id_sucursal").append(`<option value="0">--SELECCIONE--</option>`);
        $.each(obj, function (index, val) {
            $("#id_sucursal").append(`<option value="${val.id}">${val.sucursal}</option>`);
        });
    });
}
function lista_gastos() {
    $('#tabla-gastos').DataTable().clear().destroy();
    $.post("ws/service.php?parAccion=lista_gastos", {
        fecha_desde: $("#fecha_desde").val(),
        fecha_hasta: $("#fecha_hasta").val(),
    }, function (response) {
        var obj = JSON.parse(response);
        $("#tabla-gastos").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-gastos").find("tbody").append(`<tr>
                <td>${val.id}</td>
                <td>${val.concepto}</td>
                <td>S/ ${val.monto}</td>
                <td>${val.sucursal}</td>
                <td>${val.fecha}</td>
                <td>
                    <span class="btn btn-outline-warning btn-sm d-block mb-1" data-toggle="modal" data-target="#formulario" onclick="editar_gasto(${val.id});"><i class="fa fa-edit"></i></span>
                    <span  class="btn btn-outline-danger btn-sm d-block" onclick="eliminar_usuario(${val.id});"><i class="fa fa-trash"></i></span>
                </td>
                </tr>`);
        });
        $("#tabla-gastos").DataTable({
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
function actualizar_gasto(id) {
    $.post("ws/service.php?parAccion=actualizar_gasto", {
        id_sucursal: $("#id_sucursal").val(),
        concepto: $("#concepto").val(),
        monto: $("#monto").val(),
        id: id,
        fecha_creacion: current.fecha_creacion,
        id_usuario_creacion: current.id_usuario_creacion,
        fecha: $("#fecha").val()
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se modificó correctamente.");
            lista_gastos();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function insertar_gasto() {
    $.post("ws/service.php?parAccion=insertar_gasto", {
        id_sucursal: $("#id_sucursal").val(),
        concepto: $("#concepto").val(),
        monto: $("#monto").val(),
        fecha: $("#fecha").val()
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            lista_gastos();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function nuevo_gasto() {
    $("#gastoModalLabel").text("Nuevo Gasto");
    $("#btn-accion-gasto").text("Guardar");
    $("#btn-accion-gasto").attr("onclick", "insertar_gasto();");
}
function editar_gasto(id) {
    $("#gastoModalLabel").text("Editar Gasto");
    $("#btn-accion-gasto").text("Actualizar");
    $("#btn-accion-gasto").attr("onclick", "actualizar_gasto(" + id + ");");
    $.post("ws/service.php?parAccion=editar_gasto", {
        id: id
    }, function (response) {
        var obj = JSON.parse(response);
        current = obj;
        $("#id_sucursal").val(obj.id_sucursal);
        $("#concepto").val(obj.concepto);
        $("#monto").val(obj.monto);
        $("#fecha").val(obj.fecha);
    });
}
function limpiar_formulario() {
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
                lista_gastos();
            } else {
                alertify.error("Algo ha salido terriblemente mal.");
            }
        });
    }, function () {
        alertify.error('Cancel')
    });
}