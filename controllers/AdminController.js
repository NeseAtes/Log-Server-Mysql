var UserCtrl=require('./UserController');
var bcrypt = require('bcrypt');

var add_request=function(req,res,next){
	var connection = res.locals.connection;
    var username = req.body.username;
    var password = req.body.password;
    var role = req.body.role;
    connection.query("SELECT * FROM users WHERE username=?",username,function(err, result){
        console.log("resultNe",result)
        if (result.length != 0) {
            console.log("Farklı kullanıcı adı deneyiniz!!");
            return res.status(404).send({ data: false });
        }
        else{
            connection.query("SELECT * FROM user_register_requests WHERE username=?",username,function(err, result){
                console.log("girdi3");
                if (result.length != 0) {
                    console.log("Farklı kullanıcı adı deneyiniz!!");
                    return res.status(404).send({ data: false });
                }
                else{
                    if (req.body.username !== "" && req.body.password !== ""){
                        bcrypt.genSalt(12, function(err, salt){
                            bcrypt.hash(password, salt, function(err,hash){
                                password=hash;
                                //console.log("hash",hash);
                                connection.query("Insert into user_register_requests set ?", {username,password,role}, function(err, result){
                                    if (err) {
                                        console.log("err",err);
                                        next(err);
                                    }
                                    else{
                                        res.locals.data={
                                            data:true
                                        }
                                        next();
                                    }
                                });
                            });   
                        });
                    }
                    else{
                        res.locals.data={
                            data: false
                        }
                        next();
                    }
                }
            })
        }  
    })
};

var get_userRequests=function(req,res,next){
    var connection = res.locals.connection;

    connection.query("SELECT * FROM user_register_requests",function(err,items){
        if (err) {
            console.log("err",err);
            next(err);
        } 
        else {
            res.locals.data={
                data : items
            }
            next();
        }
    });
};

var positive_answer=function(req,res,next){
	var connection = res.locals.connection;
	var req_id=req.query.req_id;
	connection.query("SELECT * FROM user_register_requests WHERE req_id=?",req_id,function(err,result){
        console.log("nedeeeeeeeeeen",result);
		if(err) throw err;
		req.body=result[0];
        console.log(req.body);
		UserCtrl.addUser(req,res,next);
		connection.query("Delete from user_register_requests where req_id=? ",req_id,function(err,obj){
            if(err) throw err;
            else{
                res.locals.data={
                    data: true            
                };
                next();
            }
        });
	});
};

var negative_answer=function(req,res,next){
	var connection = res.locals.connection;
    var req_id = req.query.req_id;
	connection.query("Delete from user_register_requests where req_id=? ",req_id,function(err,obj){
        if(err) throw err;
        else{
            res.locals.data={
                data: true            
            };
            next();
        }
    });    
}

module.exports.add_request=add_request;
module.exports.get_userRequests=get_userRequests;
module.exports.positive_answer=positive_answer;
module.exports.negative_answer=negative_answer;
