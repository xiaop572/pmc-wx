var studentDao = require("../dao/userDao");
var path = new Map();
function userVerify(userinfo,req,res){
    studentDao.queryUser(userinfo.openid,function(result){
        if(result.length===0){
            studentDao.insetUser(userinfo.openid,userinfo.nickname,userinfo.sex,userinfo.province,userinfo.city,userinfo.country,userinfo.headimgurl,function(result){

            })
        }else{

        }
    })
}
path.set("/userVerify", userVerify);
module.exports.path = path;