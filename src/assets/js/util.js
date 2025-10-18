$(document).ready(function () {
    $("#li-user").load("js/dom/user.html");
    $("#sidebar-brand-logo").load("js/dom/logo.html");
    $("#footer-dom").load("js/dom/footer.html");
    get_data_session();
});
function get_data_session() {
    $.post("ws/service.php?parAccion=get_data_session", function (response) {
        var obj = JSON.parse(response);
        if (obj.Result == "ERROR") {
            window.location.href = "login.html";
        } else {
            $("#span-usuario").text(obj.nombres);
        }
    });
}
function cerrar_session() {
    $.post("ws/service.php?parAccion=cerrar_session", function () {
        window.location.href = "login.html";
    });
}