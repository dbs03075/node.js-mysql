var http = require('http');
var cookie = require('cookie');

http.createServer(function(request, response){

    if(request.headers.cookie !== undefined){
        console.log(request.headers.cookie);
        var cookies = cookie.parse(request.headers.cookie); // 만약 쿠키가 없으면 undefined가 되게 되고 이 경우 parse를 할 수 없다.
        console.log(cookies);
        
        cookie.set('yummy_cookie', {expires: Date.now()});
    }
    
    response.writeHead(200,{
        'Set-Cookie':['yummy_cookie=choco', 'tasty_cookie=strawberry',
        `Permanent=cookies; Max-Age=${60*60*24*30}`,
        'Secure=Secure; Secure',
        'HttpOnly=HttpOnly; HttpOnly',
        'Path=Path; Path=/cookie',
        'Domain=Domain; Domain=o2.org' 
    ]
    });
    response.end('Cookie!!');
}).listen(5800)
