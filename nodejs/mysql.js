// var mysql = require('mysql');
// var connection = mysql.createConnection({
//     host : 'localhost',
//     user : 'root',
//     password : '5800',
//     database : 'my_db'
// });

// connection.connect();

// connection.query(`INSERT INTO topic (title, description, created) VALUES(css, css is ..., ${12});`, function (error, results, fields){
//     if (error) {
//         console.log(error);
//     }
//     console.log(results);
// });


// connection.end();

// 수정 파일
var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "5800",
  database: "my_db"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
  var sql = "INSERT INTO topic (title, description, created) VALUES ('Company Inc', 'Highway 37', '2018-01-01 12:10:11')";
  con.query(sql, function (err, result) {
    if (err) throw err;
    console.log(result); 
    con.query(`select * from topic where id=${result.insertId}`, function (err, result) {
        if (err) throw err;
        console.log(result); 
      });
  });
});
