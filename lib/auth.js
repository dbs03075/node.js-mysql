var cookie = require('cookie');

module.exports = {
    cookieCheck: function(request){
        if(request.headers.cookie !== undefined){
            var cookies = cookie.parse(request.headers.cookie);
            console.log(cookies);
            return cookies;
        }
        
    },
    authIsLogin(cookies){
        if (cookies !== undefined && Object.keys(cookies).includes('nickname','email','password', 'author_id')){
            return  {'nickname': cookies.nickname, 'author_id':cookies.author_id};
        }
        else return {'nickname': undefined, 'author_id':undefined};
    },
    authLogin:function(email, password, authInfo){
        for (var i = 0; i<authInfo.length; i++){
          if(email === authInfo[i].email){
            if (password === authInfo[i].password){
              return {'email': email, 'password':password, 'id':authInfo[i].id, 'author_id':authInfo[i].author_id};
              
            }
          }
        }
        return null;
      }
}