var dbutil = require("./dbutil");
function queryUser(openid,cb){
    var querySql = "select * from wx_user where openid=?;";
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
function insetUser(openid,nickname,sex,province,city,country,headimgurl,cb){
    var insertSql = "insert into wx_user (openid,nickname,sex,province,city,country,headimgurl) values(?,?,?,?,?,?,?);";
    var params = [openid,nickname,sex,province,city,country,headimgurl];
    var connection = dbutil.createConnection();
    connection.connect();
    connection.query(insertSql, params, function (error, result) {
        if (error == null) {
            console.log(result);
        } else {
            throw new Error(error);
        }

    });
    connection.end();
}
module.exports = {"queryUser": queryUser,"insetUser":insetUser};