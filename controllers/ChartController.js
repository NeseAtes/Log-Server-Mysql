var chartAdd = function(req,res,next){
	var connection = res.locals.connection;
	var veri ={
		app_name:req.body.app_name,
        log_level:req.body.log_level,
        user_id: res.locals.data.data.user_id,
        count:0
		//user_id: res.locals.data.data.user_id,
	};
	connection.query("SELECT * FROM chart_table WHERE app_name=? AND log_level=?",[veri.app_name, veri.log_level],function(err,result){
        console.log("result nasıl ",result);
		if(result==0){
            veri.count=1;
            console.log("true")
            connection.query("Insert into chart_table set ?", veri, function(err, result) {
				if (err) {
                    console.log("err",err)
					next(err);
				}
				else{
					res.locals.data={
						data: true,
					};
					next();
				}
			})
		}
		else{
            for (let i = 0; i < result.length; i++) {
                const element = result[i];
                console.log("element",element.chart_id);
                veri.count=element.count+1;
                connection.query("UPDATE chart_table SET ? where app_name=? AND log_level= ?", [veri, veri.app_name, veri.log_level],function(err, result){
                    console.log("girdi");
                    if (err) {
                        next(err);
                    }
                    else{
                        res.locals.data={
                            data: true
                        };
                        next();
                    }
                });
            }            
		}
	})
};


var chartDelete = function(req,res,next){
	var connection=res.locals.connection;
	var data={
		app_name: req.body.app_name,
        log_level:req.body.log_level,
		user_id: res.locals.data.data.user_id
    };
    connection.query("SELECT * FROM chart_table WHERE app_name=?",[data.app_name],function(err,result){
        console.log("girdi",result[0]);
    	if (err) {
    		console.log("err",err);
    	}
    	if (result.length==0) {
    		return res.status(404).send({ data: false });
    	}
    	else{
            console.log("girdi222222");
            /*for (let i = 0; i < result.length; i++) {
                const element = result[i];
                console.log("element",element);
                console.log("count",element.count)
            }*/
                var newcount;
                newcount=result[0].count - 1;
                console.log("dsdsdd",newcount)
                connection.query("UPDATE chart_table SET count=? WHERE app_name=? AND log_level=?", [newcount, data.app_name, data.log_level],function(err, result){
                    //console.log("update", result);
                    if(err){
                        next(err);
                    }
                    else{
                      console.log("newCunt",newcount)
                        if (newcount==0) {
                            connection.query("DELETE FROM chart_table WHERE count=? ",newcount,function(err, result){
                                if(err){
                                    next(err);
                                }
                                else{
                                    console.log("oldu");
                                };
                            });
                        }
                        res.locals.data={
                            data: true            
                        };
                        next();
                    }
                });
                
            
    	}
    })  
};

var chartList = function(req,res,next){
	var userid=res.locals.data.data.user_id;  

    var chart_id=req.body.chart_id;
    var app_name = req.body.app_name;
    var log_level =req.body.log_level;
    var connection = res.locals.connection;
   
    connection.query("SELECT * FROM chart_table WHERE user_id=?",userid, function(err,result){
        if (err) {
            console.log("err",err);
            next(err);
        } 
        else {
            res.locals.data={
                data : result
            }
            next();
        }
    });
}


module.exports.chartAdd=chartAdd;
module.exports.chartDelete=chartDelete;
module.exports.chartList=chartList;