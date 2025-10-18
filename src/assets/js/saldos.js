let current = null;
$(document).ready(function () {
    lista_clientes();

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

    $(".fecha").datetimepicker({
        format: "Y-m-d",
        timepicker: false
    });
    $.datetimepicker.setLocale('es');
});
function lista_clientes() {
    $.post("ws/service.php?parAccion=lista_clientes", function (response) {
        var obj = JSON.parse(response);
        $.each(obj, function (index, val) {
            $("#id_cliente").append(`<option value="${val.id}">${val.dni} ${val.nombres}</option>`);
        });
    });
}
function buscar_saldos() {
    $('#tabla-saldos').DataTable().clear().destroy();
    $.post("ws/service.php?parAccion=buscar_saldos", {
        id_cliente: $("#id_cliente").val(),
        fecha_desde: $("#fecha_desde").val(),
        fecha_hasta: $("#fecha_hasta").val(),
    }, function (response) {
        var obj = JSON.parse(response);
        $("#tabla-saldos").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-saldos").find("tbody").append(`
                <tr>
                    <td>${val.nombres}</td>
                    <td>${val.monto}</td>
                    <td>${val.fecha}</td>
                    <td></td>
                </tr>
            `);
        });
        $("#tabla-saldos").DataTable({
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
function insertar_saldo() {
    $.post("ws/service.php?parAccion=insertar_saldo", {
        id_cliente: $("#id_cliente").val(),
        monto: $("#monto").val()
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            buscar_saldos();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function limpiar_formulario() {
    $("#monto").val('');

    $("#saldoModalLabel").text("Recargar");
    $("#btn-accion-saldo").text("Guardar");
    $("#btn-accion-saldo").attr("onclick", "insertar_saldo();");
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