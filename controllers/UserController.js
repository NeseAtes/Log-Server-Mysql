var bcrypt = require("bcrypt");
var conf = require('../config/database');
var mysql = require("mysql");
var addUser=function(req,res,next){
    var connection = res.locals.connection;
    var veri = {
        username:req.body.username,
        password:req.body.password,
        role:req.body.role
    };
    if (req.body.username !== "" && req.body.password !== ""){
        connection.query("Insert into users set ?", veri, function(err, result){
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
    }   
    else{
        res.locals.data={
            data: false
        }
        next();
    }       
};

var getAllUsers=function(req,res,next){
	var connection = res.locals.connection;
	//var user_id=req.query.user_id;
	//var username=req.query.username;
	//var password=req.query.password;
	
    connection.query("SELECT * FROM users",function(err, result){
        if (err) {
            next(err);
        } 
        else {
            res.send(result);
        }
        next();
    }); 
};

var TokenCtrl = require("../controllers/tokenCtrl");
var login=function(req,res,next){
	var connection=res.locals.connection;
    var username=req.body.username;
    var password=req.body.password;
    var role=req.body.role;
    if (req.body.username !== "" && req.body.password !== "") {
        connection.query("SELECT * FROM users WHERE username=?",username,function(err, result){
            for (let i = 0; i < result.length; i++) {
                const element = result[i];
                //console.log(element.user_id)
                if (err) throw err;
                else{
                    bcrypt.compare(password,element.password,function(err,isMatch){
                        if (err) {
                            console.log("err",err);
                            throw err;
                        }
                        else{
                            if (err) console.log("err",err);
                            else if (result != null)
                            { //if user is exist

                                var userid = {
                                    user_id : element.user_id,
                                    role : element.role
                                };               
                                //token
                                var token=TokenCtrl.token(userid);
                                //save it 
                                res.cookie('auth',token);
                                res.locals.data = {
                                    is_user:true,
                                    is_admin:element.role=="admin"?true:false,
                                    data: token
                                };
                                next();
                            }
                            else{
                                return res.send({is_user:false,message: 'Please check the information' });
                            }
                        }
                    }); 
                }      
            }
                
        });
    }
    else{
        res.locals.data={
            data: false
        }
        next();
    }   
}

var logout=function(req,res,next){
    res.clearCookie('auth');
    res.send({message:'OK'})
}

module.exports.addUser=addUser;
module.exports.getAllUsers=getAllUsers;
module.exports.login=login;
module.exports.logout=logout;