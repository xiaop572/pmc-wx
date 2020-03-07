var h5userDao = require("../dao/userDao");
var globalConfig = require("../config");
var loader = require("../loader");
const network = require('request')
const url = require('url');
var querystring = require("querystring");
var async = require("async");
const jwt = require('jsonwebtoken');
var path = new Map();
//验证是否存在用户信息 并插入
function userVerify(userinfo, tokenJson) {
    h5userDao.queryUser(userinfo.openid, function (result) {
        //插入
        if (result.length === 0 && userinfo.openid) {
            h5userDao.insetUser(userinfo.openid, userinfo.nickname, userinfo.sex, userinfo.province, userinfo.city, userinfo.country, userinfo.headimgurl, tokenJson.token, tokenJson.date, function (result) {})
        } else {
            h5userDao.UpdateUserInfo({
                openid: userinfo.openid,
                token: tokenJson.token,
                tokenTime: tokenJson.date
            }, function (result) {})
        }
    })
}
path.set("/userVerify", userVerify);
//h5获取code
function h5_wx_login(request, response) {
    var arg = url.parse(request.url).query;
    //将arg参数字符串反序列化为一个对象
    var params = querystring.parse(arg);
    var re_url = params.re_url;
    response.cookie('re_url', re_url, {
        maxAge: 600000
    })
    var router = 'api/h5_get_wx_access_token';
    // 这是编码后的地址
    var return_uri = 'http%3A%2F%2F' + globalConfig['h5_return_uri'] + '%2F' + router;
    var scope = 'snsapi_userinfo';
    response.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + globalConfig["h5_appid"] + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect');
}
path.set("/h5_wx_login", h5_wx_login);
//获取微信用户信息
function getWxUserInfo(code, responses) {
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
        let tokenJson = createToken(userinfo); //生成token
        userVerify(userinfo, tokenJson); //添加用户
        return {
            userinfo,
            tokenJson
        }
    })
}
//创建token
function createToken(userinfo) {
    let payload = {
        openid: userinfo.openid
    };
    var date = +new Date();
    let secret = 'pmc';
    let token = jwt.sign(payload, secret);
    return {
        token,
        date
    }
}
//获取asscess_token并获取用户信息
async function h5_get_wx_access_token(request, responses, next) {
    var re_url = request.cookies.re_url;
    var code = request.query.code;
    let userinfo = await getWxUserInfo(code, responses); //同步获取微信用户信息
    responses.redirect(`${re_url}?token=${userinfo.tokenJson.token}`) //重定向回前端页面 并返回token
}
path.set("/h5_get_wx_access_token", h5_get_wx_access_token);
//获取用户信息
function h5_getUserInfo(request, response) {
    response.setHeader('Content-Type', 'text/palin; charset=utf-8');
    var localToken = request.headers.token;
    console.log(request.headers)
    // var dataObj = JSON.parse(obj);
    new Promise((resolve, reject) => {
        h5userDao.queryUnseInfo(localToken, (res) => {
            if (res && res.length == 0 || +new Date() - res[0].token_time > 259200000) {
                response.write(JSON.stringify({
                    code: "101",
                    msg: "token过期或没有该用户"
                }))
                response.end()
            } else {
                resolve(res)
            }
        });
    }).then(res => {
        var dataObj = res[0];
        delete dataObj['openid'];
        delete dataObj['token_time'];
        response.write(JSON.stringify(dataObj))
        response.end()
    }).catch(e => {
        response.write(JSON.stringify({
            code: "101",
            msg: "没有该用户"
        }))
        response.end()
    })
}
path.set("/h5_getUserInfo", h5_getUserInfo);

function h5_isMobile(request, response) {
    response.setHeader('Content-Type', 'text/palin; charset=utf-8');
    const localToken=request.headers.token;
    new Promise((resolve, reject) => {
        h5userDao.queryUnseInfo(localToken, (res) => {
            resolve(res)
        });
    }).then(res => {
        if (!res[0].mobile) {
            response.write(JSON.stringify({
                code: "400",
                msg: "手机号不存在"
            }))
            response.end()
        } else {
            response.write(JSON.stringify({
                code: "200",
                msg: "手机号已存在"
            }))
            response.end()
        }
    }).catch(e => {
        response.write(JSON.stringify({
            code: "400",
            msg: "手机号不存在"
        }))
        response.end()
    })
}
path.set("/h5_isMobile", h5_isMobile)

function h5_setMobile(request,response) {
    response.setHeader('Content-Type', 'text/palin; charset=utf-8');
    var obj="";
    request.on('data',function(data){
        obj+=data;
    })
    request.on('end',function(){
        var dataObj=JSON.parse(obj);
        var token=request.headers.token;
        if(dataObj && !dataObj.phone){
            response.write(JSON.stringify({
                code: "400",
                msg: "手机号不正确"
            }))
            response.end()
        }
        h5userDao.UpdateUserMobile({
            token: token,
            phone:dataObj.phone
        }, function (error,result) {
            console.log(error)
            if(error==null){
               response.write(JSON.stringify({
                   code:'200',
                   msg:'绑定手机成功'
               })) 
               response.end()
            }else{
                response.write(JSON.stringify({
                    code:'400',
                    msg:error
                }))
                response.end()
            }
        })
    })
}
path.set("/h5_setMobile", h5_setMobile)
module.exports.path = path;