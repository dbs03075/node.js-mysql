var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var auth = require('./lib/auth.js');
var path = require('path');
var sanitizeHtml = require('sanitize-html');
var mysql = require('mysql');
var db = mysql.createConnection({
    host : 'localhost',
    user : 'root',
    password : '5800',
    database : 'my_db'
});
var crypto = require('crypto');

db.connect();


var app = http.createServer(function(request,response){
    
    
    // check user cookie and export user's nickname
    var userOrNot = auth.authIsLogin(auth.cookieCheck(request)); //if there is user's cookie, restore the user's nickname
    console.log(userOrNot);

    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    if(pathname === '/'){
      if(queryData.id === undefined){
        db.query('SELECT * FROM topic', function (error, topics){
          var title = 'Welcome';
          var description = 'Hello, Node.js';
          var list = template.list(topics);
          var html = template.HTML(userOrNot.nickname, title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
          );
          response.writeHead(200);
          response.end(html);
        });
       

      } else {

        var filteredId = path.parse(queryData.id).base;
        db.query('SELECT * FROM topic', function (error, topics){
          if(error) throw error;
          var list = template.list(topics);
          db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id where topic.id=?`,[filteredId], function (error2, topic){ // 이 방식이 보안상 더 좋다
            if(error2) throw error2;  
            console.log(topic);

            var title = topic[0].title;
            var description = topic[0].description;
            var created = topic[0].created;
            var profile = topic[0].profile;

            var html = template.HTML(userOrNot.nickname, title, list,
              `<h1>${title}</h1> <h3>by ${topic[0].name} as ${profile}</h3> <h4>created : ${created}</h4> <h2>${description}</h2>`,
              `<a href="/create">create</a>
              <a href="/update?id=${filteredId}">update</a>
              <form action="delete_process" method="post">
                <input type="hidden" name="id" value="${filteredId}">
                <input type="submit" value="delete">
              </form>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      
      }
    } else if(pathname === '/create'){

      db.query('SELECT * FROM topic', function (error, topics){
        db.query('SELECT * FROM author', function(error2, authors){

          var title = 'WEB - create';
          var list = template.list(topics);
          var html = template.HTML(userOrNot.nickname, title, list, `
            <form action="/create_process" method="post">
              <p><input type="text" name="title" placeholder="title"></p>
              <p>
                <textarea name="description" placeholder="description"></textarea>
              </p>
              
              <input type="hidden" name="author_id" value="${userOrNot.author_id}">
              <p>
                <input type="submit">
              </p>
            </form>
          `, '');
          response.writeHead(200);
          response.end(html);
          }) 
      });

    } else if(pathname === '/create_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var title = post.title;
          var description = post.description;
          var author_id = post.author_id;
          
          db.query(`INSERT INTO topic (title, description, created, author_id) VALUES(?, ?, NOW(),?);`,[title, description, author_id], function (err, result) {
              if (err) throw err;
              console.log(result); 
              db.query(`select * from topic where id=${result.insertId}`, function (err, result) {
                  if (err) throw err;
                  console.log(result); 
                  response.writeHead(302, {Location: `/?id=${result[0].id}`});
                  response.end();
                });
            });
          });
      
    } else if(pathname === '/update'){

      var filteredId = path.parse(queryData.id).base;
      db.query('SELECT * FROM topic', function (error, topics){
        var list = template.list(topics);
        db.query(`SELECT * FROM topic where id=?`,[filteredId], function (error, topics){
          db.query(`SELECT * FROM author`, function(error2, authors){
            console.log(topics);
            var title = topics[0].title;
            var description = topics[0].description;
            var author_id = topics[0].author_id;
            var html = template.HTML(userOrNot.nickname, title, list,
              `
              <form action="/update_process" method="post">

                <input type="hidden" name="id" value="${filteredId}">
                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                <p>
                  <textarea name="description" placeholder="description">${description}</textarea>
                </p>
                
                <p>
                  <input type="hidden" name="author_id" value="${userOrNot.author_id}">
                  <input type="submit">
                </p>

              </form>
              `,
              `<a href="/create">create</a> <a href="/update?id=${filteredId}">update</a>`
            );
            response.writeHead(200);
            response.end(html);
          });
        });
      });
    } else if(pathname === '/update_process'){

      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          console.log(post);
          var id = post.id;
          var title = post.title;
          var description = post.description;
          var author_id = post.author_id;

          db.query( `UPDATE topic SET title=?, description=?, created=NOW(), author_id=? WHERE id=?;`,[title, description, author_id, id] , function (err, result) {
              if (err) throw err;
              console.log('1');
              console.log(result); 
              response.writeHead(302, {Location: `/?id=${id}`});
              response.end();
            });
          });


    } else if(pathname === '/delete_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var id = post.id;
          var filteredId = path.parse(id).base;
          console.log('이거 확인'+filteredId);

          db.query(`DELETE FROM topic WHERE id=?;`,[filteredId], function (err, result) {
            if (err) throw err;
            response.writeHead(302, {Location: `/`});
            response.end()
          });
      });
    } else if(pathname === '/login'){
      db.query('SELECT * FROM topic', function (error, topics){
        console.log(topics);
        var title = 'login';
        var list = template.list(topics);
        var html = template.HTML(userOrNot.nickname, title, list,
        `
        <h1>login</h1>
        <form action="/login_process" method="post">
          <div class="login_id">
              <h4>E-mail</h4>
              <input type="email" name="email" id="" placeholder="Email">
          </div>
          <div class="login_pw">
              <h4>Password</h4>
              <input type="password" name="password" id="" placeholder="Password">
          </div>
          <p>
            <input type="submit">
          </p>
        
        </form>`,
        ''
          );
        response.writeHead(200);
        response.end(html);
      });
      
    } else if(pathname === '/login_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var email = post.email;
          var password = post.password;
          var sanitizedPassword = crypto.createHash('sha512').update(password).digest('base64');
          db.query(`SELECT * FROM authentication`, function(err,authInfo){
            var authPersonalInfo = auth.authLogin(email, sanitizedPassword, authInfo);
            console.log('authPersonalInfo check');
            console.log(authPersonalInfo);

            db.query(`SELECT * FROM authentication LEFT JOIN author ON authentication.author_id=author.id where authentication.id=?`,authPersonalInfo.id, function (error2, result){
              console.log('nickname check');
              console.log(result);
              authPersonalInfo["nickname"] = result[0].name;
              console.log(authPersonalInfo);

              if (authPersonalInfo !== null){
                response.writeHead(302, 
                {'Set-Cookie':[
                  `email=${authPersonalInfo.email};`,
                  `password=${authPersonalInfo.password};`,
                  `nickname=${authPersonalInfo.nickname};`,
                  `author_id=${authPersonalInfo.author_id};`
                ],
                Location: `/`});
                response.end();
              }
              else {
                response.writeHead(302,{Location:'/login'});
                response.end('who?');
              }
            });
           })
      });
    } else if(pathname === '/logout_process'){
      response.writeHead(302, 
        {'Set-Cookie':[
          `email=; Max-Age=0 `,
          `password=; Max-Age=0`,
          `nickname=; Max-Age=0`,
          `author_id=; Max-Age=0`
        ],
        Location: `/`});

      response.end();
    } else if(pathname ==='/signin'){
      db.query('SELECT * FROM topic', function (error, topics){
        console.log(topics);
        var title = 'login';
        var list = template.list(topics);
        var html = template.HTML(userOrNot.nickname, title, list,
        `
        <h1>Sign In</h1>
        <form action="/signin_process" method="post">
          <div class ="signin_nickname">
              <h4>Nickname</h4>
              <input type="text" name="nickname" id="" placeholder="nickname">
          </div>
          <div class ="signin_profile">
              <h4>profile</h4>
              <input type="text" name="profile" id="" placeholder="profile">
          </div>
          <div class="signin_id">
              <h4>E-mail</h4>
              <input type="email" name="email" id="" placeholder="Email">
          </div>
          <div class="signin_pw">
              <h4>Password</h4>
              <input type="password" name="password" id="" placeholder="Password">
          </div>
          <p>
            <input type="submit">
          </p>
        
        </form>`,
        ''
          );
        response.writeHead(200);
        response.end(html);
      });
    } else if(pathname === '/signin_process'){
      var body = '';
      request.on('data', function(data){
          body = body + data;
      });
      request.on('end', function(){
          var post = qs.parse(body);
          var email = post.email;
          var password = post.password;
          var sanitizedPassword = crypto.createHash('sha512').update(password).digest('base64');
          var profile = post.profile;
          var nickname = post.nickname;

          db.query(`INSERT INTO author (name, profile) VALUES(?, ?);`,[nickname, profile], function (err, authorResult) {
            if (err) throw err;
            console.log(authorResult); 
            db.query(`INSERT INTO authentication (email, password, author_id) VALUES(?, ?, ?);`,[email, sanitizedPassword, authorResult.insertId ], function (err, result) {
              if (err) throw err;
              console.log(result); 

              response.writeHead(302, {Location: `/`});
              response.end();
            });
          });

         
         

          // db.query(`SELECT * FROM authentication`, function(err,authInfo){
          //   var authPersonalInfo = auth.authLogin(email, sanitizedPassword, authInfo);
          //   console.log('authPersonalInfo check');
          //   console.log(authPersonalInfo);

          //   db.query(`SELECT * FROM authentication LEFT JOIN author ON authentication.author_id=author.id where authentication.id=?`,authPersonalInfo.id, function (error2, result){
          //     console.log('nickname check');
          //     console.log(result);
          //     authPersonalInfo["nickname"] = result[0].name;
          //     console.log(authPersonalInfo);

          //     if (authPersonalInfo !== null){
          //       response.writeHead(302, 
          //       {'Set-Cookie':[
          //         `email=${authPersonalInfo.email};`,
          //         `password=${authPersonalInfo.password};`,
          //         `nickname=${authPersonalInfo.nickname};`,
          //         `author_id=${authPersonalInfo.author_id};`
          //       ],
          //       Location: `/`});
          //       response.end();
          //     }
          //     else {
          //       response.writeHead(302,{Location:'/login'});
          //       response.end('who?');
          //     }
          //   });
          //  })
      });
    } 
    else {
      response.writeHead(404);
      response.end('Not found');
    }
});
app.listen(3000);
