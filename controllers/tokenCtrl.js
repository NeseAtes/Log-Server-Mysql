var jwt = require('jsonwebtoken');

var token= function(data){
  var token = jwt.sign(data, 'supersecret');   //private key=> supersecret
  //{expiresIn: 30}
  return {token:token}
}
var tokenControl=function(req, res,next) {
  if(req.cookies.auth!=undefined){
    var token = req.cookies.auth.token;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
        
    jwt.verify(token, 'supersecret', function(err, decoded) {
    if (err) {
      res.clearCookie("auth");
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
      res.locals.data={auth:true,data:decoded};
      next();
    });
  }
  else{
    return res.status(503).send({message:'Database not connected'});
  }
}
var adminControl=function(req,res,next){
  if(req.cookies.auth!=undefined){
    var token = req.cookies.auth.token;
    if (!token) return res.status(401).send({ auth: false, message: 'No token provided.' });
    jwt.verify(token, 'supersecret', function(err, decoded) {
    if (err) {
      res.clearCookie("auth");
      return res.status(500).send({ auth: false, message: 'Failed to authenticate token.' });
    }
      if(decoded.role=="admin"){
        res.locals.data={auth:true,data:decoded};
        next();
      }
      else{
        return res.status(500).send({ auth: false, message: 'You are not authorized to access the page.' });
      }
    });
  }else{
    return res.status(503).send({message:'Database not connected'});
  }
}
module.exports.token=token;
module.exports.tokenControl=tokenControl;
module.exports.adminControl=adminControl;