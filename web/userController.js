var studentDao = require("../dao/userDao");
var globalConfig = require("../config");
var loader = require("../loader");
const network = require('request')
const url = require('url');
var querystring = require("querystring");
var async = require("async");
const jwt = require('jsonwebtoken');
var path = new Map();

function userVerify(userinfo,tokenJson) {
    studentDao.queryUser(userinfo.openid, function (result) {
        if (result.length === 0 && userinfo.openid) {
            studentDao.insetUser(userinfo.openid, userinfo.nickname, userinfo.sex, userinfo.province, userinfo.city, userinfo.country, userinfo.headimgurl,tokenJson.token,tokenJson.date, function (result) {})
        }
    })
}
path.set("/userVerify", userVerify);

function h5_wx_login(request, response) {
    var arg = url.parse(request.url).query;
    //将arg参数字符串反序列化为一个对象
    var params = querystring.parse(arg);
    var re_url=params.re_url;
    response.cookie('re_url',re_url,{maxAge:600000})
    var router = 'h5_get_wx_access_token';
    // 这是编码后的地址
    var return_uri = 'http%3A%2F%2F' + globalConfig['h5_return_uri'] + '%2F' + router;
    var scope = 'snsapi_userinfo';
    response.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + globalConfig["h5_appid"] + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect');
}
path.set("/h5_wx_login", h5_wx_login);
//获取微信用户信息
function getWxUserInfo(code,responses) {
    return new Promise((resolve, reject) => {
        network.get({
            url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + globalConfig["h5_appid"] + '&secret=' + globalConfig["h5_appsecret"] + '&code=' + code + '&grant_type=authorization_code',
        }, function (error, res, body) {
            if (res.statusCode == 200) {
                resolve(body)
            }
        })
    }).then((body) => {
        var data = JSON.parse(body)
        var access_token = data.access_token;
        var openid = data.openid;
        return new Promise((resolve, reject) => {
            network.get({
                    url: 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN',
                },
                function (error, res2, body) {
                    if (res2.statusCode == 200) {
                        resolve(body)
                    }
                }
            );
        })

    }).then((body) => {
        var userinfo = JSON.parse(body);
        let tokenJson=createToken(userinfo);//生成token
        userVerify(userinfo,tokenJson);//添加用户
        return {
            userinfo,
            tokenJson
        }
    })
}
function createToken(userinfo){
    let payload = {openid:userinfo.openid};
    var date = +new Date();
    let secret = 'pmc';
    let token=jwt.sign(payload, secret);
    return {
        token,
        date
    }
}
async function h5_get_wx_access_token(request, responses, next) {
    var re_url=request.cookies.re_url;
    var code = request.query.code;
    let userinfo = await getWxUserInfo(code,responses);//同步获取微信用户信息
    console.log(userinfo)
    responses.redirect(`${re_url}?token=${userinfo.tokenJson.token}`)
}
path.set("/h5_get_wx_access_token", h5_get_wx_access_token);
module.exports.path = path;

