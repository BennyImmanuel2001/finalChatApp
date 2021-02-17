$(document).ready(function () {


    const url = "http://127.0.0.1:8000";
    sessionStorage.clear();

    $('#Username').focus();

    //window.location.replace(`${url}/main/${sessionStorage.getItem("Username", username)}`);
    $(document).on('keypress', function (e) {
        if (e.which == 13) {
            loginIn();
        }
    });



    $("#login_btn").click(function () {
        loginIn();
    });

    function loginIn() {
        var username = $('#Username').val().trim();
        var password = $('#password').val();
        sessionStorage.clear();
        if (username.length > 0 && password.length > 0) {
            $.ajax({
                url: `${url}/login/${username}/${password}`,
                type: 'GET',
                success: function (res) {
                    if (res == "invalid") {
                        $('#Username').css("border", "2px solid red");
                        $('#password').css("border", "2px solid red");
                    } else {
                        sessionStorage.setItem("Username", res.name);
                        sessionStorage.setItem("SocketID", res.socketID);
                        window.location.replace(`${url}/main`);
                    }
                }, error: function (err) {
                    alert(err);

                }
            });
        }else{
            $('#Username').css("border", "2px solid red");
            $('#password').css("border", "2px solid red");
        }
    }

});