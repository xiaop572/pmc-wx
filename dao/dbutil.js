var mysql = require("mysql");



function createConnection() {
    var connection  = mysql.createConnection({
        host: "49.234.96.58",
        port: "3306",
        user: "root",
        password: "oneinstack",
        database: "pmcwx",
        charset : 'utf8mb4'
    });

    return connection;
}

module.exports.createConnection = createConnection;