$(document).ready(function () {
    lista_sucursales();
});
function lista_sucursales() {
    $.post("ws/service.php?parAccion=lista_sucursales", function (response) {
        var obj = JSON.parse(response);
        $.each(obj, function (index, val) {
            $("#id_sucursal").append(`<option value="${val.id}">${val.sucursal}</option>`);
        });
    });
}
function ver_stock() {
    $('#tabla-stock').DataTable().clear().destroy();
    $.post("ws/service.php?parAccion=ver_stock", {
        id_sucursal: $("#id_sucursal").val()
    }, function (response) {
        var obj = JSON.parse(response);
        $("#tabla-stock").find("tbody").empty();
        $.each(obj, function (index, val) {
            $("#tabla-stock").find("tbody").append(`<tr>
                <td>${val.id}</td>
                <td>${val.producto}</td>
                <td>${val.stock||0}</td>
            </tr>`);
        });
        $("#tabla-stock").DataTable({
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