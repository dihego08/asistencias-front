$(document).ready(function () {
    lista_sucursales();
    $("#archivo").change(function () {
        readURL(this);
    });
    $("#div-btn-guardar").hide();
});
function lista_sucursales() {
    $.post("ws/service.php?parAccion=lista_sucursales", function (response) {
        var obj = JSON.parse(response);
        $.each(obj, function (index, val) {
            $("#id_sucursal").append(`<option value="${val.id}">${val.sucursal}</option>`);
        });
    });
}
function _(el) {
    return document.getElementById(el);
}
function progressHandler(event) {
    _("loaded_n_total").innerHTML = "Uploaded " + event.loaded + " bytes of " + event.total;
    var percent = (event.loaded / event.total) * 100;
    _("progressBar").value = Math.round(percent);
}
function completeHandler(event) {
    var obj = JSON.parse(event.target.response);
    if (obj.Result == "OK") {
        $("#tabla-abastecer").find("tbody").empty();
        if (obj.data.length > 0) {
            $.each(obj.data, function (index, val) {
                if (index > 0) {
                    $("#tabla-abastecer").find("tbody").append(`<tr>
                <td>${val[0]}</td>
                <td>${val[1]}</td>
                <td>${val[2]}</td>
                <td>${parseFloat(val[3]).toFixed(2)}</td>
            </tr>`);
                }
            });
            $("#div-btn-guardar").show();
        }
        alertify.success("El archivo se cargo correctamente.");
    } else {
        $("#div-btn-guardar").hide();

        alertify.notify("Algo ha salido mal.</strong> " + obj.ERROR, "custom-black", 4, function () { });
    }


    _("progressBar").value = 0;
}
function errorHandler(event) {
    _("status").innerHTML = "Upload Failed";
}
function abortHandler(event) {
    _("status").innerHTML = "Upload Aborted";
}
function readURL(input) {
    if (input.files && input.files[0]) {
        var file = input.files[0]; // Obtener el archivo
        console.log(file.name); // Mostrar el nombre del archivo
        $("#archivo_seleccionado").text(file.name);
    }
}

function cargar_archivo() {
    /*dialog = bootbox.dialog({
        message: '<p class="text-center mb-0"><i class="fa fa-spin fa-cog"></i> Cargando...</p>',
        closeButton: false
    });*/
    var formdata = new FormData();

    if ($("#id_sucursal").val() == 0) {
        bootbox.alert({
            message: "Seleccionar una Sucursal",
            size: 'small'
        });
    } else {

        var file = _("archivo").files[0];
        formdata.append("archivo", file);
        formdata.append("id_sucursal", $("#id_sucursal").val());

        var ajax = new XMLHttpRequest();
        ajax.upload.addEventListener("progress", progressHandler, false);
        ajax.addEventListener("load", completeHandler, false);
        ajax.addEventListener("error", errorHandler, false);
        ajax.addEventListener("abort", abortHandler, false);
        ajax.open("POST", "ws/service.php?parAccion=cargar_archivo");
        ajax.send(formdata);
        //dialog.modal('hide');
    }
}

function guardar_abastecimiento() {
    var formdata = new FormData();
    if ($("#id_sucursal").val() == 0) {
        bootbox.alert({
            message: "Seleccionar una Sucursal",
            size: 'small'
        });
    } else if ($("#archivo_seleccionado").text() == "") {
        bootbox.alert({
            message: "Debe Cargar un Archivo",
            size: 'small'
        });
    } else {
        var file = _("archivo").files[0];
        formdata.append("archivo", file);
        formdata.append("id_sucursal", $("#id_sucursal").val());

        var ajax = new XMLHttpRequest();
        ajax.upload.addEventListener("progress", progressHandler, false);
        ajax.addEventListener("load", completeHandler, false);
        ajax.addEventListener("error", errorHandler, false);
        ajax.addEventListener("abort", abortHandler, false);
        ajax.open("POST", "ws/service.php?parAccion=guardar_abastecimiento");
        ajax.send(formdata);
    }
}