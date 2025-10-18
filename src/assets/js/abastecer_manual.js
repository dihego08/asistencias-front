$(document).ready(function () {
    lista_sucursales();

    limpiar_campos();
    $("#producto").autocomplete({
        source: function (request, response) {
            $.ajax({
                url: "ws/service.php?parAccion=autocomplete",
                type: "GET",
                dataType: "json",
                data: {
                    search: request.term
                },
                success: function (data) {
                    response($.map(data, function (item) {
                        
                        $("#precio_unitario").val(item.precio_unitario);
                        return {
                            /*label: item.producto,
                            value: item.producto,
                            id: item.id*/
                            label: item.producto,
                            value: item.producto,
                            id: item.id,
                            producto: item.producto,
                            precio_unitario: parseFloat(item.precio_unitario).toFixed(2)
                        }
                    }))
                }
            });
        },
        select: function (event, ui) {
            //$("#add-item").attr("onclick", `anadirItem(${ui.item.id}, '${ui.item.producto}', '${ui.item.precio_unitario}')`);
            $("#add-item").attr("onclick", `guardar_abastecimiento(${ui.item.id}, '${parseFloat(ui.item.precio_unitario).toFixed(2)}')`);
            $("#cantidad").trigger("focus");
        }
    });
    $("#cantidad").on("keydown", function () {
        if (event.key === "Enter" || event.keyCode === 13) {
            $("#add-item").click();
        }
    });
});
function lista_sucursales() {
    $.post("ws/service.php?parAccion=lista_sucursales", function (response) {
        var obj = JSON.parse(response);
        $.each(obj, function (index, val) {
            $("#id_sucursal").append(`<option value="${val.id}">${val.sucursal}</option>`);
        });
    });
}
function limpiar_campos() {
    $("#producto").focus();
    $("#producto").val("");
    $("#cantidad").val("");
    $("#precio_unitario").val('');
}

function guardar_abastecimiento(id, precio_unitario) {
    var formdata = new FormData();
    if ($("#id_sucursal").val() == 0) {
        bootbox.alert({
            message: "Seleccionar una Sucursal",
            size: 'small'
        });
    } else {
        $.post("ws/service.php?parAccion=guardar_abastecimiento_manual", {
            id_producto: id,
            id_sucursal: $("#id_sucursal").val(),
            cantidad: $("#cantidad").val(),
            precio_unitario: $("#precio_unitario").val()
        }, function (response) {
            var obj = JSON.parse(response);
            if (obj.Result == "OK") {
                alertify.success("Venta Registrada Correctamente.");
                $("#tabla-abastecer").find("tbody").append(`<tr>
                    <td>${$("#id_sucursal option:selected").text()}</td>
                    <td>${$("#producto").val()}</td>
                    <td>${$("#cantidad").val()}</td>
                    <td>${$("#precio_unitario").val()}</td>
                </tr>`);
                limpiar_campos();
            } else {
                alertify.error("Algo ha salido terriblemente mal.");
            }
        });
    }
}