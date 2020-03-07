var dbutil = require("./dbutil");

function queryWxUser(openid, cb) {
    var querySql = "select * from wx_smallProgram_user where openid=?;";
    var queryParams = [openid];
    var connection = dbutil.createConnection();
    connection.connect();
    connection.query(querySql, queryParams, function (error, result) {
        if (error == null) {
            cb(result)
        } else {
            throw new Error(error);
        }

    });
    connection.end();
}

function insetWxUser(obj, cb) {
    console.log(obj.avatarUrl,"11")
    var insertSql = "insert into wx_smallProgram_user (openid,nickName,city,province,country,avatarUrl) values(?,?,?,?,?,?);";
    var params = [obj.openid,obj.nickName,obj.city,obj.province,obj.country,obj.avatarUrl];
    var connection = dbutil.createConnection();
    connection.connect();
    connection.query(insertSql, params, function (error, result) {
        if (error == null) {
            cb(result)
        } else {
            throw new Error(error);
        }
    });
    // connection.end();
}
module.exports = {
    "queryWxUser": queryWxUser,
    "insetWxUser": insetWxUser
}