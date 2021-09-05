var cookies = require('cookie');

module.exports = {
  userCheck:function(userOrNot){
    if (userOrNot!== undefined){
      return `<h3>hello ${userOrNot}</h3>
              <button onclick="location.href = '/logout_process';">logout</button>`;
    }
    else {
      return `<a href="/login">login</a>   <a href="/signin">sign in</a>`;
    }
  },
  HTML:function(userOrNot, title, list, body, control ){
    return `
    <!doctype html>
    <html>
    <head>
      <title>WEB1 - ${title}</title>
      <meta charset="utf-8">
    </head>
    <body>
      ${this.userCheck(userOrNot)}
      <h1><a href="/">WEB</a></h1>
      ${list}
      ${control}
      ${body}
    </body>
    </html>
    `;
  },list:function(topics){
    var list = '<ul>';
    var i = 0;
    while(i < topics.length){
      list = list + `<li><a href="/?id=${topics[i].id}">${topics[i].title}</a></li>`;
      i = i + 1;
    }
    list = list+'</ul>';
    return list;
  }, 
  // authorSelect:function(authors, author_id){
  //   console.log('author_id '+ author_id);
  //   var tag = '';
  //   for (var i = 0; i<authors.length; i++){
  //     var selected = '';
  //     if (author_id === authors[i].id){
  //      selected = 'selected';
  //     }
  //     tag +=`<option value="${authors[i].id}"${selected}>${authors[i].name}</option>`;
  //   }
  //   return `<select name="author">${tag}</select>`
  // }, 
 
  
}
