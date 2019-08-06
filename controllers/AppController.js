var IndexAction = function(req, res, next) {
    var appArr = [];
    var connection = res.locals.connection;

    var userid = res.locals.data.data.user_id;
    var app_id=req.query.app_id;
    var app_ip=req.query.app_ip;
    var hostname=req.query.hostname;
    var version=req.query.version;

    function buildConditions()
    {
      var conditions = [];
      var values = [];
        if (typeof app_id !== 'undefined')
        {
            conditions.push("app_id like ?");
            values.push("%" + app_id + "%");
        }

        if (typeof app_ip !== 'undefined')
        {
            conditions.push("app_ip like ?");
            values.push("%" + app_ip + "%");
        }

        if (typeof hostname !== 'undefined')
        {
            conditions.push("hostname like ?");
            values.push("%" + hostname + "%");
        }

        if (typeof version  !== 'undefined')
        {
            conditions.push("version like ?");
            values.push("%" + version + "%");

        }

        return {
            where: conditions.length ?
                     conditions.join(' AND ') : '1',
            values: values
          };
    
    }
    var conditions = buildConditions();
    var sql = 'SELECT * FROM app_detail WHERE user_id=? AND ' + conditions.where ;
    connection.query(sql,[userid,conditions.values], function(err, apps) {
        if (err) {
            next(err);
        } 
        else {
            for (var i in apps){
                var app = {
                    app_id : apps[i].app_id,
                    app_ip : apps[i].app_ip,
                    hostname : apps[i].hostname,
                    version : apps[i].version,
                    user_id: apps[i].user_id
                };
                appArr.push(app);
            }
            res.locals.data = {
                data: appArr
            }
            next();
        }
    });
};   

var AddApps=function(req,res,next){

    var app_veri={
        app_ip:req.body.app_ip == "" ? null : req.body.app_ip,
        hostname:req.body.hostname,
        version:req.body.version,
        user_id: res.locals.data.data.user_id
    };

    var connection = res.locals.connection;
    connection.query("Insert into app_detail set ?", app_veri, function(err,result){
        if (err) {
           next(err);
        }
        else{
            res.locals.data ={
                data : true
            };
            next();
        }
    
    });
};

var UpdateApps=function(req,res,next){
    var app_veri={
        app_ip: req.body.app_ip == "" ? null : req.body.app_ip,
        hostname: req.body.hostname,
        version: req.body.version,
        app_id: req.params.app_id,
        user_id: res.locals.data.data.user_id
    };

console.log("object",app_veri);
    var connection = res.locals.connection;
    connection.query("SELECT * FROM app_detail WHERE app_id=?",app_veri.app_id, function(err,result){
        //console.log("resultUpdate",result);
        for (let i = 0; i < result.length; i++) {
            const element = result[i];
            //console.log("result",element.app_id);
            if (app_veri.app_ip == undefined) {
                app_veri.app_ip = element.app_ip
            }
            if (app_veri.hostname == undefined) {
                app_veri.hostname = element.hostname
            }
            if (app_veri.version == undefined) {
                app_veri.version = element.version
            }
            connection.query("Update app_detail set ? where app_id = ?", [app_veri, app_veri.app_id], function(err,result){
                if (err) {
                    next(err);
                }
                else{
                    res.locals.data={
                        data : true
                    };
                    next();
                }
            });
        }
    })
};

var DeleteApps=function(req,res,next){
    var connection = res.locals.connection;
    connection.query("Delete from app_detail where app_id = ? ", [req.params.app_id] , function(err, result){
        if (err) {
            next(err);
        }
        else{
            res.locals.data={
                data : true
            };
            next();
        }
    });
};

module.exports.index = IndexAction;
module.exports.addApps=AddApps;
module.exports.deleteApps=DeleteApps;
module.exports.updateApps=UpdateApps;