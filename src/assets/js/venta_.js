var codigos_carro = [];
var cantidades = [];
var precios = [];
$(document).ready(function () {
    lista_categorias();
    lista_clientes_sucursal();
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
    $("#id_cliente").select2();

    lista_sucursales();
    lista_formas_pagos();
    lista_tipos_clientes();
    $("#id_tipo_cliente").on("change", function () {
        if ($(this).val() == 1) {
            $("#div-tipo-cliente").attr("hidden", false);
        } else {
            $("#div-tipo-cliente").attr("hidden", true);
        }
    });
    $("#guardar_venta").on("click", function () {
        console.log("CLIC EN VENTA");
        console.log(codigos_carro);
        console.log(cantidades);
        console.log(precios);
        $.post("ws/service.php?parAccion=guardar_venta", {
            codigos_carro: codigos_carro,
            cantidades: cantidades,
            precios: precios,
            id_cliente: $("#id_cliente").val(),
            id_forma_pago: $("#id_forma_pago").val(),
            monto: $("#total").val()
        }, function (response) {
            var obj = JSON.parse(response);

            if (obj.Result == "OK") {
                alertify.success("Venta Registrada Correctamente.");
                limpiar_formulario();
            } else {
                if (obj.Message !== undefined) {
                    bootbox.alert({
                        message: "ERROR: " + obj.Message,
                        size: 'small'
                    });
                } else {
                    alertify.error("Algo ha salido terriblemente mal.");
                }
            }
        });
    });
});
function limpiar_formulario() {
    $(".form-control").val('');
    $("select").val(0);
    $('.item-carrito').remove();
    $(".order-empty").show();
    codigos_carro = [];
    cantidades = [];
    precios = [];
    calcularTodo();
}
function lista_formas_pagos() {
    $.post("ws/service.php?parAccion=lista_formas_pagos", {
        id_sucursal: 2
    }, function (response) {
        var obj = JSON.parse(response);
        $.each(obj, function (index, val) {
            $("#id_forma_pago").append(`<option value="${val.id}">${val.forma_pago}</option>`);
        });
    });
}
function lista_clientes_sucursal() {
    $.post("ws/service.php?parAccion=lista_clientes_sucursal", function (response) {
        var obj = JSON.parse(response);
        $("#id_cliente").empty();
        $("#id_cliente").append(`<option value="0">--SELECCIONE--</option>`);
        $.each(obj, function (index, val) {
            $("#id_cliente").append(`<option value="${val.id}">${val.dni} - ${val.nombres}</option>`);
        });
    });
}
function lista_categorias() {
    $.post("ws/service.php?parAccion=lista_categorias", function (response) {
        var obj = JSON.parse(response);
        $.each(obj, function (index, val) {
            $("#div-categorias").append(`<div class="col-xl-2 col-md-4 mb-4">
                <div class="card border-left-primary shadow h-100 py-2">
                    <div class="card-body pointer" onclick="lista_productos(${val.id});">
                        <div class="row no-gutters align-items-center">
                            <div class="col mr-2">
                                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                                    ${val.categoria}
                                </div>
                                <!--<div class="h5 mb-0 font-weight-bold text-gray-800">$40,000</div>-->
                            </div>
                            <div class="col-auto">
                                <!--<i class="fas fa-calendar fa-2x text-gray-300"></i>-->
                                <i class="fas fa-chevron-right fa-2x text-gray-300"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`);
        });
    });
}
function lista_productos(id_categoria) {
    $.post("ws/service.php?parAccion=lista_productos_categoria", {
        id_categoria: id_categoria
    }, function (response) {
        var obj = JSON.parse(response);
        $("#div-productos").empty();
        $.each(obj, function (index, val) {
            $("#div-productos").append(`<div class="col-md-3 mb-3">
                <div class="card">
                    <div class="card-body text-center">
                        <h5 class="card-title">${val.producto}</h5>
                        <p class="card-text">S/ ${parseFloat(val.precio_unitario).toFixed(2)}</p>
                        <button class="btn btn-primary" onclick="anadirItem(${val.id}, '${val.producto}', '${parseFloat(val.precio_unitario).toFixed(2)}')">Agregar</button>
                    </div>
                </div>
            </div>`);
        });
    });
}

function anadirItem(id, nombre, precio) {
    var flag = 0;
    var iterador = 0;
    for (var i = 0; i < codigos_carro.length; i++) {
        if (id == codigos_carro[i]) {
            flag = 1;
            iterador = i;
        }
    }
    if (flag == 0) {
        codigos_carro.push(id);
        cantidades.push(1);
        precios.push(precio);

        $(".order-empty").hide();
        $("#div_lista_ventas").append(`
            <div id="item${id}" class="row item-carrito" style="color: #555555; background: rgba(140,143,183,0.2); border-bottom: solid 1px #313131;">
                <table class="table mb-0">
                    <tr>
                        <td width="10%">
                            <strong id="cant${id}">1</strong>
                        </td>
                        <td width="30%">
                            <p style="font-weight: bold; display: block; font-size: 13px; text-align: left;" class="w-100 mb-0">${nombre}</p>
                            <p class="w-100 mt-0" style="font-size: 13px; text-align: left;"> <span class="badge badge-primary">S/ ${precio}</span></p>
                        </td>
                        <td width="30%">
                            <strong>S/ </strong><strong id="precio${id}">${precio}</strong>
                        </td>
                        <td width="30%">
                            <span class="btn btn-danger btn-sm d-block" onclick="quitar_carro(${id},${precio})"><i class="fa fa-trash"></i></span>
                        </td>
                    </tr>
                </table>
            </div>
        `);

        $("#div_engloba").empty();
        $("#div_engloba").append(`
            <div class="row">
                <div class="col-6">
                </div>
                <div class="col-6 text-center" style="border-top: solid 2px #313131;">
                    <p>Total: S/ <strong id="subtotal"></strong> </p>
                </div>
            </div>
        `);
    }
    else {
        var cant_actual = parseInt($("#cant" + id).text());
        var precio_nuevo = precio * (cant_actual + 1);
        $("#cant" + id).text(cant_actual + 1);
        $("#precio" + id).text(redondear(precio_nuevo, 2));
        cantidades[iterador]++;
        precios.push(precio);
    }
    calcularTodo();

    $(".la_cantidad").keyup(function () {
        var id_d = $(this).attr("id");
        var cant_d = $(this).val();

        $("#precio" + id_d.substring(4, id_d.length)).html(cant_d * precio)

        calcularTodo();
    });

    $(".la_cantidad").on("change", function () {
        var id_d = $(this).attr("id");
        var cant_d = $(this).val();

        $("#precio" + id_d.substring(4, id_d.length)).html(cant_d * precio)

        calcularTodo();
    });
}
function calcularTodo() {
    var total = 0;
    for (var i = 0; i < codigos_carro.length; i++) {
        total += parseFloat($("#precio" + codigos_carro[i]).html() || 0);
    }
    total = redondear(total, 2);
    var sub_total = redondear(total / 1.18);
    var igv = redondear(total - sub_total, 2);
    $("#total").val(total);
    $("#total_detalle_span").text("S/ " + total)

    console.log("El total: " + total);
}
function redondear(num, decimales = 2) {
    var signo = (num >= 0 ? 1 : -1);
    num = num * signo;
    if (decimales === 0)
        return signo * Math.round(num);
    num = num.toString().split("e");
    num = Math.round(+(num[0] + "e" + (num[1] ? (+num[1] + decimales) : decimales)));
    num = num.toString().split("e");
    return signo * (num[0] + "e" + (num[1] ? (+num[1] - decimales) : -decimales));
}
function quitar_carro(id, precio) {
    var iterador = 0;//para saber en que posicion esta el articulo y su cantidad
    for (var i = 0; i < codigos_carro.length; i++) {
        if (id == codigos_carro[i]) {
            iterador = i;
        }
    }
    var precio_a_dos = redondear(precio, 2);
    var cantidad_anterior = parseInt($("#cant" + id).val());
    var precio_anterior = parseFloat($("#precio" + id).html());
    if (cantidad_anterior > 1) {
        var nueva_cantidad = cantidad_anterior - 1;
        var nuevo_precio = precio_anterior - precio_a_dos;
        $("#cant" + id).val(nueva_cantidad);
        $("#precio" + id).html(redondear(nuevo_precio, 2));
        cantidades[iterador]--;
    } else {
        console.log("para borrar pues");
        //borrar tanto de tabla como de sus arreglos sabiendo su posicion
        $("#item" + id).remove();
        //codigos_carro.pop(id);
        codigos_carro.splice(iterador, 1);//el 1 es cuantas veces hara la funcion 
        cantidades.splice(iterador, 1);
    }
    calcularTodo();
}
function nuevo_cliente() {
    $("#clienteModalLabel").text("Nuevo Cliente");
    $("#btn-accion-cliente").text("Guardar");
    $("#btn-accion-cliente").attr("onclick", "insertar_cliente();");
}
function insertar_cliente() {
    $.post("ws/service.php?parAccion=insertar_cliente", {
        nombres: $("#nombres").val(),
        dni: $("#dni").val(),
        id_sucursal: $("#id_sucursal").val(),
        grado: $("#grado").val(),
        seccion: $("#seccion").val(),
        id_tipo_cliente: $("#id_tipo_cliente").val(),
        padre: $("#padre").val(),
        celular: $("#celular").val(),
        saldo: $("#saldo").val(),
        correo: $("#correo").val(),
    }, function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "OK") {
            alertify.success("Se agregó correctamente.");
            lista_clientes_sucursal();
            limpiar_formulario();
        } else {
            alertify.error("Algo ha salido terriblemente mal.");
        }
    });
}
function lista_tipos_clientes() {
    $.post("ws/service.php?parAccion=lista_tipos_clientes", function (response) {
        var obj = JSON.parse(response);
        $.each(obj, function (index, val) {
            $("#id_tipo_cliente").append(`<option value="${val.id}">${val.tipo_cliente}</option>`);
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