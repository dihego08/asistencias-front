function iniciar_sesion() {
    let user = $("#user").val();
    let pass = $("#pass").val();

    $.post("ws/service.php?parAccion=iniciar_sesion", {
        user: user,
        pass: pass
    }, function (response) {
        var obj = JSON.parse(response);

        if (obj.Result == "OK") {
            localStorage.setItem("token", obj.Token);
            window.location.href = "index.html";
        } else {
            bootbox.alert({
                message: "Usuario o Contraseña Incorrectos",
                size: 'small'
            });
        }
    });
}