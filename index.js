var express = require("express");
var globalConfig = require("./config");
var loader = require("./loader");
var cookie = require("cookie-parser");
var multer = require("multer");
const request=require('request')

var app = new express();
var uploadSingle = multer({dest: "./file/"});

app.use(express.static(globalConfig["page_path"]));
app.use(cookie());


app.get("/api/*", function (request, response, next) {
    next();
});

/*h5网页接口*/ 
app.get("/api/h5/login",(request,response)=>{
    var router = 'get_wx_access_token';
    // 这是编码后的地址
    var return_uri = 'http%3A%2F%2Fu3npdk.natappfree.cc%2F' + router;
    var scope = 'snsapi_userinfo';
    response.redirect('https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + globalConfig["h5_appid"] + '&redirect_uri=' + return_uri + '&response_type=code&scope=' + scope + '&state=STATE#wechat_redirect');
})
app.get('/get_wx_access_token', function (req, res, next) {
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});//只需要设置响应头的编码格式就好
    // 第二步：通过code换取网页授权access_token
    var code = req.query.code;
    var oneReq = req;
    var oneRes = res;
    request.get({
            url: 'https://api.weixin.qq.com/sns/oauth2/access_token?appid=' + globalConfig["h5_appid"] + '&secret=' + globalConfig["h5_appsecret"] + '&code=' + code + '&grant_type=authorization_code',
        },
        function (error, response, body) {
            if (response.statusCode == 200) {
                // 第三步：拉取用户信息(需scope为 snsapi_userinfo)
                //console.log(JSON.parse(body));
                var data = JSON.parse(body)
                var access_token = data.access_token;
                var openid = data.openid;
                request.get({
                        url: 'https://api.weixin.qq.com/sns/userinfo?access_token=' + access_token + '&openid=' + openid + '&lang=zh_CN',
                    },
                    function (error, response, body) {
                         if (response.statusCode == 200) {
                            var userinfo = JSON.parse(body);
                            loader.get('/userVerify')(userinfo,req,res);//添加用户或生成新的token
                        } else {
                            console.log(response.statusCode);
                        }
                        
                    }
                );
            } else {
                console.log(response.statusCode);
            }
        }
    );
})
app.listen(globalConfig["port"]);



// app.get("/api/getAllStudent", loader.get("/api/getAllStudent"));

// app.get("/api/addStudent", loader.get("/api/addStudent"));

// app.get("/login", loader.get("/login"));

// app.post("/upload", uploadSingle.single("file"), loader.get("/upload"));

// app.get("/getPic", loader.get("/getPic"));