const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config();


var filename = process.env.LOGGERFILE || "logger.txt";


function logger (req, res, next) {

   // console.log(filename);

    var date = new Date();
    var month = date.getMonth() + 1;
    var hour = date.getHours();

    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var milliseconds = date.getMilliseconds();
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
    var dateTime = `${date.getDate()}-${month}-${date.getFullYear()} - ${hour}:${minutes}:${seconds}.${milliseconds}`;

    var data = `${dateTime} | ${req.originalUrl} \n`;
    fs.appendFile(filename, data, 'utf8',
        function (err) {
            if (err) throw err;
            // if no error
            console.log("Logged")
        });


    next();
}


module.exports = {
    Logger: logger
}














// const logger = function (req, res, next) {
//     var date = new Date();
//     var month = date.getMonth() + 1;
//     var hour = date.getHours();

//     var minutes = date.getMinutes();
//     var seconds = date.getSeconds();
//     var milliseconds = date.getMilliseconds();
//     if (month < 10) {
//         month = "0" + month;
//     }
//     if (hour < 10) {
//         hour = "0" + hour;
//     }
//     if (minutes < 10) {
//         minutes = "0" + minutes;
//     }
//     if (seconds < 10) {
//         seconds = "0" + seconds;
//     }
//     var dateTime = `${date.getDate()}-${month}-${date.getFullYear()}T${hour}:${minutes}:${seconds}.${milliseconds}`;

//     var data = `${dateTime} | ${req.originalUrl} `;
//     fs.appendFile('logger.txt', data, 'utf8',
//         function (err) {
//             if (err) throw err;
//             // if no error
//             console.log("Data is appended to file successfully.")
//         });


//     next();
// }