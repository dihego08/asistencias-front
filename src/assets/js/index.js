$(document).ready(function () {
    lista_sucursales();

    var today = new Date();
    var dd = String(today.getDate()).padStart(2, '0');
    var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
    var yyyy = today.getFullYear();

    today = yyyy + '-' + mm + '-' + dd;

    $("#fecha").val(today);

    $("#fecha").datetimepicker({
        format: "Y-m-d",
        timepicker: false
    });
    $.datetimepicker.setLocale('es');
});
function lista_sucursales() {
    $.post("ws/service.php?parAccion=lista_sucursales", function (response) {
        var obj = JSON.parse(response);
        $("#id_sucursal").append(`<option value="0">--TODOS--</option>`);
        $.each(obj, function (index, val) {
            $("#id_sucursal").append(`<option value="${val.id}">${val.sucursal}</option>`);
        });
    });
}
function reporte_fecha() {
    $.ajax({
        url: "ws/service.php?parAccion=reporte_fecha",
        type: "POST",
        data: {
            id_sucursal: $("#id_sucursal").val(),
            fecha: $("#fecha").val()
        },
        headers: {
            "Authorization": "Bearer " + localStorage.getItem("token") // Token almacenado en localStorage
        },
        success: function (response) {
            var obj = JSON.parse(response);
            let total = 0;
            let total_ventas = 0;
            let total_gastos = 0;
            $.each(obj.ventas, function (index, val) {
                $("#div_pago_" + val.id).text("S/ " + val.cant);
                total += parseFloat(val.cant);
            });
            $("#ventas_ahora").text("S/ " + total.toFixed(2));
            $("#gastos_ahora").text("S/ " + obj.gastos[0].cant)

            $("#ventas_gastos").text("S/ " + (total - obj.gastos[0].cant).toFixed(2));

            $("#ventas_acumuladas").empty();
            $("#gastos_acumulados").empty();

            $.each(obj.acumulado, function (index, val) {
                if (val.tipo == "V") {
                    total_ventas += parseFloat(val.cant);
                    $("#ventas_acumuladas").append(`<li class="list-group-item">
                        <div class="form-row">
                            <div class="col-md-6">
                                <div class="h5 mb-0 font-weight-bold text-gray-800">${val.fecha}</div>
                            </div>
                            <div class="col-md-6">
                                S/ ${val.cant}
                            </div>
                        </div>
                    </li>`);
                } else {
                    total_gastos += parseFloat(val.cant);
                    $("#gastos_acumulados").append(`<li class="list-group-item">
                        <div class="form-row">
                            <div class="col-md-6">
                                <div class="h5 mb-0 font-weight-bold text-gray-800">${val.fecha}</div>
                            </div>
                            <div class="col-md-6">
                                S/ ${val.cant}
                            </div>
                        </div>
                    </li>`);
                }
            });

            $("#ventas_gastos_acumulados").text("S/ " + (total_ventas - total_gastos).toFixed(2));
        },
        error: function (xhr, status, error) {
            console.error("Error en la solicitud:", error);
        }
    });
}