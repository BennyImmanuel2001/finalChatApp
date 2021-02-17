const dotenv = require('dotenv');
const bcrypt = require("bcrypt");
const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const { v4: uuidv4 } = require('uuid');

const cors = require('cors')
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
const { Logger } = require('./logger');

//socket.to(privatemessage.anotherSocketId).emit("private_message",  return_msg)


var url = "mongodb://localhost:27017";
var port = process.env.PORT || 8000;
var database = process.env.DATABASE_NAME || "chatApp";
var collection_name = process.env.COLLECTION_NAME || "users";
var commonDB = process.env.COMMONDB || "commonDB";




app.use(express.static(__dirname));
app.set('view engine', 'ejs');
app.use(cors());
dotenv.config();
app.use(Logger);


var sockets=[]; 

// var val=5;
// const found = array1.find((element) =>{
// //console.log(element);
//   if(element.client==val)
//   {
//     return element;
//   }else
//   {
//     return false;
//   }
// });
// console.log(found.client);



//io.use((socket, next) => {
//    io.engine.generateId = () => {
//        // USE ONE OF THESE
//        socket.id = uuidv4();
//        console.clear();
//        console.log(socket.id);
//        // return socket.handshake.query.CustomId;
//    }
//    next(null, true);
//});


async function messageread(user ,otheruser){

    //clicked - otheruser
    // me -user .

    var ID='';
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(database);
        dbo.collection(commonDB).updateMany({ from: otheruser,to:user}, { $set: { seen: true } });




        dbo.collection(collection_name).findOne({ name: otheruser }, function (err, result) {
            console.clear();
        
                console.log(result);
            ID = result.socketID;

            for (var i = 0; i < sockets.length; i++) {
                var c = sockets[i];
                if (c.customId == ID) {

                    console.log(c.customId);
                    ID = c.socket_id;
                    break;
                }
            }

            db.close();
            return ID;
        });
        



    });
}

function changeStatus(_socket_id,_status){
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(database);
        dbo.collection(collection_name).updateOne({ socketID: _socket_id }, { $set: { status: _status } });
        db.close();
    });
}

function changelastseen(socketID)
{
    
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(database);
        dbo.collection(collection_name).updateOne({socketID},{$set:{lastseen:getTime()}});
        db.close();
    });
}

io.on('connection', (socket) => {

    socket.on('disconnect', function () {
        for (var i = 0; i < sockets.length; i++) {
            var c = sockets[i];
            if (c.customId == socket.id) {
                sockets.splice(i, 1);
                console.log(c.customId );
                changeStatus(socket.id,false);
                changelastseen(socket.id);
                io.emit('status_changed',"diconnect");
                break;
            }
        }
        console.log('user disconnected ' + socket.id);
    });

    socket.on('changeSocketID', (msg) => {

        sockets.push({ socket_id: socket.id, customId :msg});
        changeStatus(msg,true);
       
        socket.id=msg;
        console.log(msg,socket.id);
        socket.emit('changeSocketID', msg);
    });

    socket.on('status_changed', (msg) => {
        io.emit('status_changed',msg);
    });

    socket.on('messageread', (ids) => {
        var user = ids.user;
        var otheruser = ids.otheruser;
        
             console.log("");

             var ID = '';
             MongoClient.connect(url, function (err, db) {
                 if (err) throw err;
                 var dbo = db.db(database);
                 dbo.collection(commonDB).updateMany({ from: otheruser, to: user }, { $set: { seen: true } });




                 dbo.collection(collection_name).findOne({ name: otheruser }, function (err, result) {
                     console.clear();

                     console.log(result);
                     ID = result.socketID;

                     for (var i = 0; i < sockets.length; i++) {
                         var c = sockets[i];
                         if (c.customId == ID) {

                             console.log(c.customId);
                             ID = c.socket_id;
                             socket.to(ID).emit("messageread", ID);
                             break;
                         }
                     }

                     db.close();
                    // return ID;
                 });
             });
    });
  

    socket.on('Image', (img) => {
        MongoClient.connect(url, function (err, db) {
            if (err) throw err;
            console.clear();
            var dbo = db.db(database);

            var message=img.src;

            var dateTime = getTime();

            var msg = {
                msg: message,
                from: img.fromName,
                to: img.toName,
                seen:false,
                date: dateTime,
                type: "Image"
            };
            dbo.collection(commonDB).insertOne(msg, function (err, res) {
                if (err) throw err;
                console.clear();
              //  console.log(req.params);
                console.log("1 image inserted");
                for (var i = 0; i < sockets.length; i++) {
                    var c = sockets[i];
                    if (c.customId == img.toSID) {
                        console.log(c.customId);
                        //changeStatus(socket.id, false);
                        //changelastseen(socket.id);
                        socket.to(c.socket_id).emit("Image", img.src);
                        break;
                    }
                }
                for (var i = 0; i < sockets.length; i++) {
                    var c = sockets[i];
                    if (c.customId == img.mySID) {
                        console.log(c.customId);
                        //changeStatus(socket.id, false);
                        //changelastseen(socket.id);
                        socket.to(c.socket_id).emit("Image", img.src);
                        break;
                    }
                }

                
            db.close();
            });
        });
    });
    
    socket.on('messageSent', (msg) => {
        console.clear();
        console.log(msg);
        
        console.log(socket.id);
        try{
        const found = sockets.find((element) => {
           console.log(element);
            if (element.customId == msg) {
                return element;
            } else {
                return null;
            }
        });
        console.log("f" + found.socket_id, found.customId);
        socket.to(found.socket_id).emit("messageSent", msg);
        socket.to(socket.id).emit("messageReceived", msg);
    }catch(err){
        console.clear();
        console.log("restart the server");
    }
    });
});




app.get('/', (req, res) => {
    res.redirect("/login");
});



app.get('/login', (req, res) => {
    res.render(`login_page.ejs`);
});

app.get('/sigin', (req, res) => {
    res.render(`signin_page.ejs`);
});

app.get('/main', (req, res) => {
    res.render(`main.ejs`);
});



app.get('/main/getLastseen/:soc_id', (req, res) => {
    var _id = req.params.soc_id;

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        var dbo = db.db(database);

        dbo.collection(collection_name).findOne({ socketID: _id }, function (err, result) {
            console.clear();
            if (result != null) {
                console.log(result);
                res.send(result.lastseen);
            } else {
                res.send("invalid");
            }
        });
    });
});
app.get('/main/getContacts', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        var dbo = db.db(database);

        dbo.collection(collection_name).find({ isAlive: true }).toArray(function (err, result) {
            if (err) throw err;
            // console.log(result);
            res.send(result);
        });
        db.close();
    });
});


function getTime()
{
    var date = new Date();
    var month = date.getMonth() + 1;
    var hour = date.getHours();

    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if (month < 10) {
        month = "0" + month;
    }
    if (hour < 10) {
        hour = "0" + hour;
    }
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
  return `${date.getDate()}-${month}-${date.getFullYear()}T${hour}:${minutes}:${seconds}`;
}


app.delete('/deleteMsg/:chatID', (req, res) => {
   var id= req.params.chatID;
   MongoClient.connect(url, function (err, db) {
    if (err) throw err;

    var dbo = db.db(database);
    var _img ="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 17 19' width='17' height='19'%3E%3Cpath fill='currentColor' d='M12.629 12.463a5.17 5.17 0 0 0-7.208-7.209l7.208 7.209zm-1.23 1.229L4.191 6.484a5.17 5.17 0 0 0 7.208 7.208zM8.41 2.564a6.91 6.91 0 1 1 0 13.82 6.91 6.91 0 0 1 0-13.82z'%3E%3C/path%3E%3C/svg%3E";
    dbo.collection(commonDB).updateOne({_id:ObjectID(id)},{$set:{isDeleted:true,type:"text",msg:`<img style="margin-bottom: -6%;" src="${_img}" />Deleted`}},function(err,result){
        

        res.send(result);
    });
    
   });


});



app.get('/msg/:fromId/:toId/:msg/:type', (req, res) => {
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        console.clear();
        console.log(req.params);
        var dbo = db.db(database);

        var message= req.params.msg;

        var dateTime = getTime();
   


        var msg = {
            msg: message,
            from: req.params.fromId,
            to: req.params.toId,
            seen:false,
            date: dateTime,
            type: req.params.type,
            isDeleted:false
        };


        dbo.collection(commonDB).insertOne(msg, function (err, res) {
            if (err) throw err;
            console.clear();
            console.log(req.params);
            console.log("1 Message inserted");
        });


        db.close();
        res.send(msg);
    });
});


app.get('/loadMessage/:user/:otheruser', (req, res) => {
    var user = req.params.user;
    var otheruser = req.params.otheruser;

    console.log(user, otheruser);
    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

        var dbo = db.db(database);

        dbo.collection(commonDB).updateMany({from :otheruser,to:user},{$set:{seen:true}});
        //   dbo.collection(commonDB).find({ from: user ,to :otheruser}).sort({ "date": -1 }).toArray(function (err, result) {
        dbo.collection(commonDB).find({
            $or:
                [{
                    $and:
                        [{ from: user }, { to: otheruser }]
                }, {
                    $and:
                        [{ to: user }, { from: otheruser }]
                }]
        }).sort({ "date": -1 }).toArray(function (err, result) {
            if (err) throw err;
            db.close();
            res.send(result);
        });
    });
});





app.get('/login/:name/:password', (req, res) => {
    var username = req.params.name;
    //  var passwword = bcrypt.hashSync(req.params.password, 10); 
    var passwword = req.params.password;


    MongoClient.connect(url, function (err, db) {
        if (err) throw err;

      

        var dbo = db.db(database);


        dbo.collection(collection_name).findOne({ name: username }, function (err, result) {
            console.clear();
            if (result != null) {
                const verified = bcrypt.compareSync(passwword, result.password);
                if (verified) {
                    dbo.collection(collection_name).updateOne({socketID:result.socketID},{$set:{status:true}});
                    dbo.collection(collection_name).updateOne({socketID:result.socketID},{$set:{lastseen:getTime()}});
                    res.send(result);
                } else {
                    res.send("invalid");
                }
                console.log(verified);
            } else {
                res.send("invalid");
            }
        });
    });

});


// app.get('/signin/checkUserName/:name', (req, res) => {
// res.send("ok");
// });

function generateID() {

    var uu_id = uuidv4();
    console.clear();
    console.log(uu_id);
    return uu_id;
    // MongoClient.connect(url, function (err, db) {
    //     if (err) throw err;
    //     var dbo = db.db(database);

    //     var uu_id = uuidv4();
    //     console.clear();
    //     console.log(uu_id);
        

        // dbo.collection(collection_name).findOne({ socketID: uu_id }, function (err, result) {
        //     if (err) throw err;
        //     console.log(result);
        //     if (result == null) {
        //         console.log("in null");
        //         return uu_id;
        //     } else {
        //         generateID();
        //         console.log("in fun");

        //     }
        // });
   // });
}

app.get('/signin/:userType/:name/:password', (req, res) => {
    
    var userType = req.params.userType;
    var username = req.params.name;
    var passwword = bcrypt.hashSync(req.params.password, 10);

    MongoClient.connect(url, function (err, db) {
        if (err) throw err;
        var dbo = db.db(database);



        dbo.collection(collection_name).findOne({ name: username }, function (err, result) {
            if (err) throw err;

            var response_arr = [];
            var newUserId = "";
            if (result == null) {

                response_arr[0] = true;
                response_arr[1] = "user does not exist";


                var socketID = generateID();
                console.log(socketID);

                var newUser = {userType, name: username, password: passwword, isAlive: true, status: false, socketID,lastseen:getTime() };

                dbo.collection(collection_name).insertOne(newUser, function (err, res) {
                    if (err) throw err;
                    console.log("1 document inserted");
                    newUserId = `${res.insertedId}`;
                    console.log("newUserId  " + newUserId.toString());
                    console.log("newUserId  type " + typeof (newUserId));
                });

                // dbo.createCollection(username);

            } else {
                response_arr[0] = false;
                response_arr[1] = "user exist";
            }
            db.close();
            res.send(response_arr);
        });
    });
});






http.listen(port, () => {
    console.log("server is running on port : " + port);
});





















     // dbo.createCollection(newUserId, function (err, result) {
                    //     if (err) throw err
                    //    try{
                    //     console.log(`Collection created for ${newUserId}`);
                    //    }
                    //    catch(err)
                    //    {
                    //        console.log(" dsgfdfggd " +err);
                    //    }
                    // });


// dbo.createCollection(res.insertedId.toString(),{from:"string"});
                    //insert here --------->


                    // dbo.collection("users").findOne({name:"ben"}, function (err, result) {
                    //   //  console.clear();
                    //     console.log(result.ops);
                    //     console.log(result._id);
                    //     res.send(
                    //         result
                    //     );
                    //     dbo.createCollection(result._id.toString());

                    //   });

                    // dbo.collection(collection_name).find({ name: "ben" }, function (err, result) {
                    //     console.clear();
                    //     console.clear();

                    //     console.log("test summa");
                    //     console.log(username);
                    //     console.clear();

                    //     console.log(result);
                    //     console.log(result._id);
                    //     var newUserId = result._id.toString();
                    //     //dbo.createCollection(newUserId);
                    //     //  dbo.createCollection(newUserId).findOne({ _id: o_id }, function (err, result) {
                    //     //      console.log("----------------------");
                    //     //      console.log(newUserId);
                    //     //  });

                    // });
















                    // db.getCollection("students").aggregate(
                    //     [
                    //         { 
                    //             "$project" : {
                    //                 "_id" : NumberInt(0), 
                    //                 "students" : "$$ROOT"
                    //             }
                    //         }, 
                    //         { 
                    //             "$lookup" : {
                    //                 "localField" : "students._id", 
                    //                 "from" : "units", 
                    //                 "foreignField" : "_id", 
                    //                 "as" : "units"
                    //             }
                    //         }, 
                    //         { 
                    //             "$unwind" : {
                    //                 "path" : "$units", 
                    //                 "preserveNullAndEmptyArrays" : false
                    //             }
                    //         }
                    //     ]
                    // );