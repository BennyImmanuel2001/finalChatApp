$(document).ready(function () {

    const url = "http://127.0.0.1:8000";
    $("#signin_btn").click(function () {
        signIn();
    });

    $(document).on('keypress', function (e) {
        if (e.which == 13) {
        signIn();
        }
    });


    var userType="Patient";
    $('#patientImg').addClass("selected");
    $('#patientImg').css("height","")
    $('#patientImg').css("width","")
    //alert(userType);

    $(document).on('click','img', function (e) {
    userType=$(this).data('role');
    //alert(userType);
     $('img').removeClass('selected');
     $(this).addClass("selected");


     $('.other').css("height","50%")
     $('.other').css("width","50%")
     $(this).css("height","")
     $(this).css("width","")

    // alert(userType);

    });

    function signIn()
    {
        var username = $('#Username').val().trim();
        var password = $('#password').val();

        if (validateUserCredentials(username, password)) {
            // sessionStorage.setItem("Username", username);
            $.ajax({
                url: `${url}/signin/${userType}/${username}/${password}`,
                type: 'GET',
                success: function (res) {
                    if (res[0] == true) {
                        window.location.replace(`${url}/login`);
                    }
                    else {
                        alert(res[1]);
                    }
                }, error: function (err) {
                    alert(err);

                }
            });
        } else {
            $('#Username').css("border", "2px solid red");
            $('#password').css("border", "2px solid red");
        }
    }


    function validateUserCredentials(name, password) {
        var max = 25;
        var min=2;
        
        var pattern = new RegExp(eval(`/^(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{${min},${max}}$/`));

        if (name.length >=min && pattern.test(password)) {
            return true;
        }
        else {
            
            return false;
        }
    }

});