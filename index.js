var express = require("express");
var globalConfig = require("./config");
var loader = require("./loader");
var cookieParase = require("cookie-parser");
var multer = require("multer");
const request=require('request')
var app = new express();
app.use(cookieParase());
var uploadSingle = multer({dest: "./file/"});

app.use(express.static(globalConfig["page_path"]));
app.use(cookieParase());


/*h5网页接口*/ 
app.get("/api/h5/login",loader.get('/h5_wx_login'));
app.get('/api/h5_get_wx_access_token',loader.get('/h5_get_wx_access_token'));
/*获取用户信息*/
app.post('/api/h5/getUserInfo',loader.get('/h5_getUserInfo'))
//判断 是否填写手机号
app.post('/api/h5/isMobile',loader.get('/h5_isMobile'))
app.post('/api/h5/setMobile',loader.get('/h5_setMobile'))
app.listen(globalConfig["port"]);

/*微信小程序接口*/ 
app.post('/api/wx/login',loader.get('/wx_login'))
app.post('/api/wx/insetUserInfo',loader.get('/wx_inset'))
// app.get("/api/getAllStudent", loader.get("/api/getAllStudent"));

// app.get("/api/addStudent", loader.get("/api/addStudent"));

// app.get("/login", loader.get("/login"));

// app.post("/upload", uploadSingle.single("file"), loader.get("/upload"));

// app.get("/getPic", loader.get("/getPic"));