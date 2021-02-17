


$(document).ready(function () {

    // msgRecived() ;
  
  
        // $("#YOU").click(function(e){ 
        //     $("#forgot-dialog").dialog("open");
        //     e.preventDefault();
        // });
            
        // $("#forgot-dialog").dialog({
        //             modal: true,
        //             autoOpen: false,
        //             height: 255,
        //             width: 300,
        //             buttons: {
        //                 "Retrieve": function() {
        //                     document.forms["forgotform"].submit();
        //                 },
        //                 Cancel: function() {
        //                     $( this ).dialog( "close" );
        //                 }
        //             },
        //     });

    function msgRecived() {
        try {
            //var audio = new Audio("/sound/just-saying-593.ogg");
            var audio = new Audio("/sound/you-know-508.ogg");

            audio.loop = false;
            audio.autoplay=true;
            audio.play();

        } catch (err) {
            console.log(err);
        }
    }







    const url = "http://127.0.0.1:8000";

    const port = "ws://127.0.0.1:8000";

    var socketID = "";
    const socket = io(port);



    socket.on('connect', () => {
        socketID = socket.id;
    });

    socket.emit('changeSocketID', sessionStorage.getItem("SocketID"));
    // socket.on("disconnect", () => {
    //     socket.emit('status_changed', "changed");
    // });


    socket.on('messageread', text => {
        console.log("messageread");
        loadMessage();
    });
        socket.on('status_changed',text=>{

        //getContacts(sessionStorage.getItem("To"));
        getContacts();
    });



//   socket.on('ChangeMessageRecivedStatus',text=>{

//         ChangeMsgRecivedStatus();
//     });

    socket.on('Image', img => {
        //socketImage

        //var time = formateTime(res.date.split('T')[1].split(':')[0], res.date.split('T')[1].split(':')[1]);
        //var svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15">
        //            <path fill="grey" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z">
        //            </path>
        //            </svg>`;
        //var image = res.msg.replace('_', '/');
        //$('#msg_div').append(`<div class="user"> <img class='msg_img'  src=' ${image}'/>   <br>   <span> ${time} </span>  ${svg}      </div>`);
        //$('#msg_div').scrollTop(($('#msg_div').height() + $('#msg_div').height()) * $('#msg_div').height());

        ////get socketID
        //socket.emit('messageSent', sessionStorage.getItem("ToSocketID"));
        //$('#msgContainer').val("");
        loadMessage();

    });


    socket.on('changeSocketID', _id => {
        socketID =_id;
        socket.id=_id;
        socket.emit('status_changed', "changed");
    });
    socket.on('messageSent', text => {
      //  socket.id="12121121212id";
        console.log(socket.id);
        loadMessage();
        msgRecived();
    });

    socket.on('messageReceived', text => {
        //  socket.id="12121121212id";
          console.log(socket.id);
          loadMessage();
         
      });

    $('#YOU').text(sessionStorage.getItem("Username"));



    if (sessionStorage.getItem("Username") == undefined) {
        window.location.replace(`${url}/login`);
    }

    getContacts();
 

function getContacts()
{
    $.ajax({
        url: `${url}/main/getContacts`,
        type: 'GET',
        success: function (res) {

            $('.contacts_container').empty();


            //document.getElementById("result").innerHTML = sessionStorage.getItem("lastname");

            var you = sessionStorage.getItem("Username");
            var userselected = false;

            for (var i = 0; i < res.length; i++) {
                if (you != res[i].name) {
                    var img = `<img class="profilePic chatimg" src="/img/defaultProfile.png" >`;
                    var label=`<labe class="nameContainer"> ${res[i].name} </labe>`;
                    var stethoscope = "";

                    if(res[i].userType=="Doctor")
                    {
                        stethoscope = `<img src="/img/stethoscope.png" style="padding-top: 9px;height: 23px;padding-left: 11px;">`;
                    }


                    var statusContainer="";
                    if( res[i].status==true)
                    {
                        statusContainer=`<div class="statusContainer online"></div>`;
                    }else{
                        statusContainer=`<div class="statusContainer"></div>`;
                    }

                    if (!userselected) {
                        $('.contacts_container').append(`<div style="background-color:#c2c2c2;" class="contact ${res[i]._id}" data-socketID="${res[i].socketID}" data-user_id="${res[i].name}" > ${img} ${label} ${stethoscope} ${statusContainer} </div>`);
                        sessionStorage.setItem("To", res[i].name);
                        sessionStorage.setItem("ToSocketID",res[i].socketID );
                        userselected = true;
                        getLastseen(res[i].name,res[i].socketID);
                        loadMessage();
                    } else {
                        $('.contacts_container').append(`  <div class="contact ${res[i]._id}" data-socketID="${res[i].socketID}"  data-user_id="${res[i].name}" >${img} ${label} ${statusContainer} </div>`);
                    }
                }
            }


        }, error: function (err) {
            alert(err);
            sessionStorage.setItem("lastname", "Smith");
            alert(sessionStorage.getItem("lastname"));
        }
    });
}


    $(document).on("click", ".contact", function () {
        var bg_color='#c2c2c2';
        sessionStorage.setItem("To", $(this).data("user_id"));
        sessionStorage.setItem("ToSocketID", $(this).data("socketid"));
        $('.contact').css("background-color", "#eee");
        $(this).css("background-color", bg_color);
        // $(this).css("background-color", "#69ffcd");
        getLastseen($(this).data("user_id"), sessionStorage.getItem("ToSocketID"));
        var id = {
            otheruser: sessionStorage.getItem("To"),
            user: sessionStorage.getItem("Username")
        }
        socket.emit('messageread', id);
        loadMessage();
    });


    var G_chatID='';
    // $(document).mousemove(function(event){
    //     $("#YOU").text(event.pageX + ", " + event.pageY);
    //   });
  //  var div = $( ".user" );
    var div =  $(`#msg_div`).find('.user');
    $(document).contextmenu(function(e) {
     
    e.preventDefault();
    });


    $(document).on('dblclick','.user', function (e) {
         G_chatID=$(this).data('chatid');
       
        $('#context').css('display','block');
        $('#context').css('position','absolute');
        var X=e.pageX;
        var Y=e.pageY;
        if(X>($( window ).width()/2))
        {
            X=X-$('#context').width();
        }
        // else{
        //     X=X+$('#context').width();
        // }

        if(Y>($( window ).height()/2))
        {
            Y=Y-$('#context').height();
        }
        // else{
        //     Y=Y+$('#context').height();
        // }
        $('#context').css("left", X + "px");
        $('#context').css("top", Y + "px");
        e.preventDefault();
    });
    $(document).on('click','#contextItem1', function (e) {
       // alert(G_chatID);
       //ondelete
        $.ajax({
            url: `${url}/deleteMsg/${G_chatID}`,
            type: 'Delete',
            success: function (res) {
               // loadMessage();
                var id = {
                    otheruser: sessionStorage.getItem("To"),
                    user: sessionStorage.getItem("Username")
                }
                var _id = {
                    otheruser: sessionStorage.getItem("Username"),
                    user: sessionStorage.getItem("To")
                }
                socket.emit('messageread', id);
                socket.emit('messageread', _id);
               // $(`[data-chatid="${G_chatID}"]`).empty().append("Deleted");
            }
        });
        $('#context').css('display','none');
    });
    $(document).on('click','#contextItemCancel', function (e) {
        $('#context').css('display','none');
    });
    


// function ChangeMsgRecivedStatus(user_id,otheruser_id)
// {

//     //socket.emit('changeSocketID', sessionStorage.getItem("SocketID"));

// }
    function getLastseen(to, socket_id) {
        //data-socketid="07fd5e02-cdee-48bd-b108-daceffb9b64b"
        //statusContainer 
        if ($(`[data-socketid="${socket_id}"]`).find('.statusContainer').hasClass("online")) {
            $('.userInfoTime').text("Online");
            $('.userInfoName').text(to);
        } else {
            $.ajax({
                url: `${url}/main/getLastseen/${sessionStorage.getItem("ToSocketID")}`,
                type: 'GET',
                success: function (res) {
                    res = res.toString();
                    //var name = $('#userInfo').data("lastseen") ;
                    var time = $('#userInfo').data("lastseen") + res.split('T')[0] + " " + formateTime(res.split('T')[1].split(':')[0], res.split('T')[1].split(':')[1]);
                    $('.userInfoTime').text(time);
                    $('.userInfoName').text(to);
                }
            });
        }
    }




    function loadMessage() {
        $.ajax({
            url: `${url}/loadMessage/${sessionStorage.getItem("Username")}/${sessionStorage.getItem("To")}`,
            type: 'GET',
            success: function (res) {
                $('#msg_div').empty();
                console.log(`${url}/loadMessage/${sessionStorage.getItem("Username")}/${sessionStorage.getItem("To")}`);

                for (var i = res.length - 1; i >= 0; i--) {
                    var  color_="grey";
                    if(res[i].seen==true)
                    {
                        color_="blue";
                    }
                    var svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15">
                    <path fill="${color_}" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z">
                    </path>
                    </svg>`;

                    var time = formateTime(res[i].date.split('T')[1].split(':')[0], res[i].date.split('T')[1].split(':')[1]);


                    // /$(`[data-chatid="${G_chatID}"]`).empty().append("Deleted");
                    if (res[i].to == sessionStorage.getItem("Username")) {
                        if (res[i].type == "text") {
                            $('#msg_div').append(`<div data-chatID="${res[i]._id}" class="otheruser">${res[i].msg}<br><span> ${time} </span></div>`);
                        }else{
                           // var image=res.msg.replace('_','/');
                           
                            $('#msg_div').append(`<div data-chatID="${res[i]._id}" class="otheruser"> <img class='msg_img chatimg'  src='${res[i].msg}'/><br><span> ${time} </span></div>`);
                        }
                    } else {
                        if (res[i].type == "text") {
                            $('#msg_div').append(`<div data-chatID="${res[i]._id}" class="user">${res[i].msg}<br><span>${time}</span> ${svg} </div>`);
                        } else {
                           // var image=res.msg.replace('_','/');
                       
                            $('#msg_div').append(`<div  data-chatID="${res[i]._id}" class="user"> <img class='msg_img chatimg'  src='${res[i].msg}'/><br><span> ${time} </span> ${svg} </div>`);
                        }
                    }



                    $('#msg_div').scrollTop(($('#msg_div').height() + $('#msg_div').height()) * $('#msg_div').height());
                }
            }
        });
    }

    function formateTime(hour, minutes) {

        var am_pm = "AM";
        if (hour > 12) {
            am_pm = "PM";
        }
        hour = ((parseInt(hour) + 11) % 12 + 1);
        if (hour < 10) {
            hour = "0" + hour;
        }
        return `${hour}:${minutes} ${am_pm}`;
    }

    $(document).on("click", "#enter", function () {
        sendMessage();
    });

    $(document).on('keypress', function (e) {
        if (e.which == 13) {
            sendMessage();
        }else
        {
            $('#msgContainer').focus();
        }
        // alert(e.which);
        // alert(e.key);
        // alert(e.keyCode);
        if(e.which==27)
        {
            $('#dialog').css('display','none');
        }
    });



    $(document).on('click','.chatimg', function (e) {

        e.stopPropagation();
       $('#dialogContentImg').attr('src', $(this).attr('src'));
        $('#dialog').css('display','block');


        var width=$( window ).width();
        var height=$( window ).height();

        width=width-(width * .1);
        height=height-(height * .1);

        $('#dialog').css( 'left', (width * .1)/2);
        $('#dialog').css( 'top', (height * .1)/2);

        $('#dialog').css( 'width',  width);
        $('#dialog').css( 'height', height);
    });
    $(document).on('click','#dialogCloseBtn', function (e) {
        $('#dialog').css('display','none');
     });
    




    function convertToString() {
        if (this.files && this.files[0]) {
            var FR = new FileReader();
            FR.addEventListener("load", function (e) {
                //sendimage(e.target.result);
                var image_data={
                    toName:  sessionStorage.getItem("To"),
                    fromName:  sessionStorage.getItem("Username"),
                    src:  e.target.result,
                    mySID: sessionStorage.getItem("SocketID"),
                    toSID: sessionStorage.getItem("ToSocketID")
                }

                socket.emit('Image', image_data);
                //emit image with/ from / to/ userid  / otherUserID / src
            });
            FR.readAsDataURL(this.files[0]);
        }
    }

    document.getElementById("image_sender").addEventListener("change", convertToString);
    

    function sendMessage() {
        var chatMsg = $('#msgContainer').val();
        if (sessionStorage.getItem("To") != undefined) {
            if (chatMsg.trim() != "") {
                $.ajax({
                    url: `${url}/msg/${sessionStorage.getItem("Username")}/${sessionStorage.getItem("To")}/${chatMsg}/text`,
                    type: 'GET',
                    success: function (res) {
                        var time = formateTime(res.date.split('T')[1].split(':')[0], res.date.split('T')[1].split(':')[1]);
                        var svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 15" width="16" height="15">
                        <path fill="grey" d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.879a.32.32 0 0 1-.484.033l-.358-.325a.319.319 0 0 0-.484.032l-.378.483a.418.418 0 0 0 .036.541l1.32 1.266c.143.14.361.125.484-.033l6.272-8.048a.366.366 0 0 0-.064-.512zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.366.366 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z">
                        </path>
                        </svg>`;
                        $('#msg_div').append(`<div class="user">${res.msg}   <br>   <span> ${time} </span>  ${svg}      </div>`);
                        $('#msg_div').scrollTop(($('#msg_div').height() + $('#msg_div').height()) * $('#msg_div').height());

                        //get socketID
                        socket.emit('messageSent', sessionStorage.getItem("ToSocketID"));
                        $('#msgContainer').val("");
                        loadMessage();
                        // socket.emit('messageSent', sessionStorage.getItem("ToSocketID"));
                    }
                });
            }
        }
        else {
            alert("Select a user");
            // $(".contact").fadeTo(1000, 0.1);
            // $(".contact").fadeTo(100, 1);

        }
    }

    // $( "#dialog" ).dialog( {autoOpen: false});
    // $("#dialog").dialog({
    //     autoOpen: true,
    //     hide: "slide",
    //     show: "slide",
    //     height: 200
    // });
    // $(document).on("click", ".profilePic", function () {
    //     $("#dialog").append("sdsd");
    //     $("#dialog").dialog("open");
    // });

    // $("img").click(function(){
    //     $("#dialog").append("sdsd");
    //     $("#dialog").dialog("open");
    // });

});















