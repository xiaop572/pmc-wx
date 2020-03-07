var wxUserDao = require("../dao/wxUserDao");
var globalConfig = require("../config");
var loader = require("../loader");
const network = require('request')
const url = require('url');
var querystring = require("querystring");
var async = require("async");
const jwt = require('jsonwebtoken');
var path = new Map();

function wx_login(request, response) {
    var obj = "";
    request.on('data', function (data) {
        obj += data;
    })
    request.on("end", function () {
        var dataObj = JSON.parse(obj);
        network.get('https://api.weixin.qq.com/sns/jscode2session?appid=' + globalConfig["wx_appid"] + '&secret=' + globalConfig["wx_appsecret"] + '&js_code=' + dataObj.code + '&grant_type=authorization_code',
            function (err, res, body) {
                if (err == null) {
                    response.write(JSON.stringify({
                        code: '200',
                        body
                    }));
                    response.end();
                } else {
                    response.write(JSON.stringify({
                        code: '200',
                        err
                    }));
                    response.end();
                }
            })
    })
}
path.set("/wx_login", wx_login);

function wx_inset(request, response) {
    response.setHeader('Content-Type', 'text/palin; charset=utf-8');
    var obj = "";
    request.on('data', function (data) {
        obj += data;
    })
    request.on("end", function () {
        var dataObj = JSON.parse(obj);
        wxUserDao.queryWxUser(dataObj.openid, function (result) {
            if (result && result.length === 0) {
                wxUserDao.insetWxUser(dataObj, function (result) {
                    response.write(JSON.stringify({
                        code: 200,
                        msg: "用户添加成功"
                    }));
                    response.end()
                })
            } else {
                response.write(JSON.stringify({
                    code: 200,
                    msg: "用户已存在"
                }));
                response.end()
            }
        })
    })
}
path.set("/wx_inset", wx_inset);
module.exports.path = path;