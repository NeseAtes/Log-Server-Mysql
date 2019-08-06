var conf = require('../config/database');
var mysql = require("mysql");

var pool = mysql.createPool(
    {
      connectionLimit : conf.connection.poolSize,
      queueLimit : 2000,
      host     : conf.connection.host,
      port     : conf.connection.port,
      user     : conf.connection.user,
      password : conf.connection.password,
      database : conf.connection.database 
    }
); 


exports.getConnection = function(callback) {
  pool.getConnection(function(err, conn) {
    if(err) {
      return callback(err);
    }
    callback(err, conn);
  });
}; 