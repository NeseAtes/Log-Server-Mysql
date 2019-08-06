var moment = require("moment");
var esController = require("./ElasticSearchController");
var chartSer= require('./ChartController');
//var deneme = require("./dene");

var IndexAction = function(req, res, next) {
    var logArr = [];
    var connection = res.locals.connection;
    var userid=res.locals.data.data.user_id;
    var log_id=req.query.log_id;
    var app_name = req.query.app_name;
    var date = req.query.date;
    var log_level = req.query.log_level;


    function buildConditions()
    {
      var conditions = [];
      var values = [];
        if (typeof log_id !== 'undefined')
        {
            conditions.push("log_id like ?");
            values.push("%" + log_id + "%");
        }

        if (typeof ip_no !== 'undefined')
        {
            conditions.push("ip_no like ?");
            values.push("%" + ip_no + "%");
        }

        if (typeof app_name !== 'undefined')
        {
            conditions.push("app_name like ?");
            values.push("%" + app_name + "%");
        }

        if (typeof date  !== 'undefined')
        {
            conditions.push("date ?");
            values.push(date);

        }

        if (typeof log_level !== 'undefined') 
        {
            conditions.push("log_level like ?");
            values.push("%" + log_level + "%");
        }
    
      return {
        where: conditions.length ?
                 conditions.join(' AND ') : '1',
        values: values
      };
    }
    
    var conditions = buildConditions();
    var sql = 'SELECT * FROM logs WHERE user_id=? AND ' + conditions.where;
    
    connection.query(sql,[userid,conditions.values] , function(err, logs) {
        if (err) {
            next(err);
        } else {
        for (var i in logs) {
            var log = {             
                log_id: logs[i].log_id,
                ip_no: logs[i].ip_no,
                app_name: logs[i].app_name,
                date: moment(logs[i].date).format("DD.MM.YYYY"),
                description: logs[i].description,
                log_level: logs[i].log_level,
                user_id: logs[i].user_id                  
        };
        logArr.push(log);
        }
        res.locals.data = {
            data: logArr
        }
        next();
        }
    });

};

var list = function(req,res,next){
    var connection = res.locals.connection;
    var user_id = res.locals.data.data.user_id;
    var sonbes = 'SELECT * FROM logs WHERE user_id=? Order By log_id DESC LIMIT 5'
    var logbes = [];
    connection.query(sonbes,user_id,function(err, logs) {
        if (err) {
            next(err);
        } else {
        for (var i in logs) {
            var log = {             
                log_id: logs[i].log_id,
                ip_no: logs[i].ip_no,
                app_name: logs[i].app_name,
                date: moment(logs[i].date).format("DD.MM.YYYY"),
                description: logs[i].description,
                log_level: logs[i].log_level,
                user_id: logs[i].user_id                     
        };
        logbes.push(log);
        }
        res.locals.data = {
            data: logbes
        }
        next();
        }
    });
}

var logSer = require('../WS');
var AddLog=function(req,res,next){
    console.log("girdi");
    var logObj = {
        ip_no: req.body.app_name == "" ? null : req.body.ip_no,
        app_name: req.body.app_name == "" ? null : req.body.app_name,
        date: req.body.date == "" ? null : moment(req.body.date, 'DD.MM.YYYY').format('YYYY-MM-DD'),
        description: req.body.description,
        log_level: req.body.log_level,
        user_id: res.locals.data.data.user_id
    };
    var connection = res.locals.connection;
    connection.query("Insert into logs set ?", logObj, function(err, result) {
        if (err) {
            next(err);
        } 
        else {
            console.log("db insert result: ", result);
            chartSer.chartAdd(req,res,next);
            logObj.insertId = result.insertId;
            esController.addDocumentInner(logObj, function(error, result){
                console.log("addDocumentInner: ", error, result);
                if(error) {
                    res.locals.data = {
                        data: false,
                        error: error
                    }
                    next();
                }else {
                    res.locals.data = {
                        data: true
                    }
                    next();
                }
                logSer.veri(logObj);
            });   
        }
    });
};

var UpdateLog=function(req,res,next){

    var logObj={
        ip_no: req.body.app_name,
        app_name: req.body.app_name,
        date: moment(req.body.date,'DD.MM.YYYY').format('YYYY-MM-DD'),
        description: req.body.description,
        log_level: req.body.log_level,
        log_id: req.params.log_id,
        user_id: res.locals.data.data.user_id
    };
    
    console.log("object",logObj);
    var connection = res.locals.connection;
    connection.query("SELECT * FROM logs WHERE log_id=?", logObj.log_id,function(err,result){
        console.log("result",result);
        for (let i = 0; i < result.length; i++) {
            const element = result[i];
            console.log("element",element.log_id);
            if (logObj.ip_no == undefined) {
                logObj.ip_no = element.ip_no
            }   
            if (logObj.app_name == undefined) {
                logObj.app_name = element.app_name
            }
            if (logObj.date == "Invalid date") {
                logObj.date = element.date
            }
            if (logObj.description == undefined) {
                logObj.description = element.description
            }
            if (logObj.log_level == undefined) {
                logObj.log_level = element.log_level
            }
            connection.query("UPDATE logs SET ? where log_id = ?", [logObj, logObj.log_id],function(err, result){
                if (err) {
                    next(err);
                }
                else{
                    res.locals.data={
                        data: true
                    //console.log("veri eklendi.")
                    };
                    next();
                }
            });
            if(req.body.log_level!=undefined){
                var data={body:logObj};
                chartSer.chartAdd(data,res,next);
                data.body.log_level=element.log_level;
                chartSer.chartDelete(data,res,next);
            } 
            if (req.body.app_name!=undefined) {
                var data={body:logObj};
                chartSer.chartAdd(data,res,next);
                data.body.app_name=element.app_name;
                chartSer.chartDelete(data,res,next);
            } 
        }
        
    })

    
};

var DeleteLog=function(req,res,next){
    
    var connection = res.locals.connection;
    connection.query("SELECT * FROM logs WHERE log_id=?",[req.params.log_id],function(err,result){
        if (err) {
            //return console.error(hata.message);
            next(err);
        }
        console.log("DeleteLog",result);
        req.body=result[0];
        chartSer.chartDelete(req,res,next);
        connection.query("Delete from logs where log_id = ?", [req.params.log_id], function(err,result){
            /*if (err) {
                //return console.error(hata.message);
                next(err);
            }
            else{
                /*res.locals.data={
                    data: true            
                };
                next();
            }*/
        });
    })
   
};
  
module.exports.index = IndexAction;
module.exports.list= list;
module.exports.addlog = AddLog;
module.exports.updateLog= UpdateLog;
module.exports.deleteLog=DeleteLog;