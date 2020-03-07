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
function insetUser(openid,nickname,sex,province,city,country,headimgurl,token,date,cb){
    var insertSql = "insert into wx_user (openid,nickname,sex,province,city,country,headimgurl,access_token,token_time) values(?,?,?,?,?,?,?,?,?);";
    var params = [openid,nickname,sex,province,city,country,headimgurl,token,date];
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
function UpdateUserInfo(obj,cb){
    var updateSql = 'UPDATE wx_user SET access_token = ?,token_time = ? WHERE openid= ?'
    var params = [obj.token,obj.tokenTime,obj.openid];
    var connection = dbutil.createConnection();
    connection.connect();
    connection.query(updateSql, params, function (error, result) {
        if (error == null) {
            console.log(result);
        } else {
            throw new Error(error);
        }

    });
    connection.end();
}
function queryUnseInfo(token,cb){
    console.log(token,"伟民民")
    var querySql = "select * from wx_user where access_token=?;";
    var queryParams = [token];
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
function UpdateUserMobile(obj,cb){
    var updateSql = 'UPDATE wx_user SET mobile=? WHERE access_token= ?'
    var params = [obj.phone,obj.token];
    var connection = dbutil.createConnection();
    connection.connect();
    connection.query(updateSql, params, function (error, result) {
        if (error == null) {
            cb(error,result)
        } else {
            cb(error)
        }

    });
    connection.end();
}
module.exports = {"queryUser": queryUser,"insetUser":insetUser,"queryUnseInfo":queryUnseInfo,"UpdateUserInfo":UpdateUserInfo,"UpdateUserMobile":UpdateUserMobile};