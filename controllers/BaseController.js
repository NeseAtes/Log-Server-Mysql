var db = require("../lib/db");


var InitSession = function(req, res, next)
{
    db.getConnection(function(err, connection) {
        if (err) {        
            next(err);
        } else {
            console.log("bağlantı kuruldu")
            res.locals.connection = connection;
            next();
        }
    });
};

var EndSession = function(req, res, next)
 {
    if (res.locals.connection) {
        res.locals.connection.release();
    }
    if (res.locals.responseType && res.locals.responseType == "xml") {
        res.send(res.locals.data);
        res.end();
    } else if (res.locals.responseType && res.locals.responseType == "file") { 
        res.end();
    } else {
        res.json(res.locals.data);
    }
};

module.exports.InitSession = InitSession;
module.exports.EndSession = EndSession;

