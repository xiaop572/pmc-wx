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


app.get("/api/*", function (request, response, next) {
    next();
});

/*h5网页接口*/ 
app.get("/api/h5/login",loader.get('/h5_wx_login'));
app.get('/h5_get_wx_access_token',loader.get('/h5_get_wx_access_token'));
app.listen(globalConfig["port"]);



// app.get("/api/getAllStudent", loader.get("/api/getAllStudent"));

// app.get("/api/addStudent", loader.get("/api/addStudent"));

// app.get("/login", loader.get("/login"));

// app.post("/upload", uploadSingle.single("file"), loader.get("/upload"));

// app.get("/getPic", loader.get("/getPic"));