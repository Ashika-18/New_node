const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf-8');
const other_page = fs.readFileSync('./other.ejs', 'utf-8');
const style_css = fs.readFileSync('./style.css', 'utf-8');

console.log('-コハク準備OK-');

//メインプログラム
const getFromClient = (request, response) => {
    var url_parts = url.parse(request.url, true);

    var data = {
        'Taro': '09-9999-00000',
        'Hanako': '080-888-88888',
        'Jiro': '0700-7777-7777'
    };

    //indexのアクセス処理
    const response_index = (request, response) => {
        var msg = "これはIndexページです"
        var content = ejs.render(index_page, {
            title: "Index",
            content: msg,
            data: data,
        });
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(content);
        response.end();
    }

    //otherのアクセス処理
    const response_other = (request, response) => {
        var msg = "これがOtherページですねん"

        //Postアクセス時
        if (request.method == 'POST') {
            var body = '';
            //データ受信のイベント処理
            request.on('data', (data) => {
                body += data;
            });

            //データ受信終了のイベント処理
            request.on('end', () => {
                var post_data = qs.parse(body);
                msg += 'あなたは、「' + post_data.msg +'」と書きました。';
                var content = ejs.render(other_page, {
                    title: "Other",
                    content: msg,
                });
                response.writeHead(200, { 'Content-Type': 'text/html' });
                response.write(content);
                response.end();
            });

            //Getアクセスの処理 
        } else {
            var msg = "ページがありませんよ？"
            var content = ejs.render(other_page, {
                title: "Other",
                content: msg,
            });
            response.writeHead(200, { 'Content-Type': 'text/html' });
            response.write(content);
            response.end();
        }
    }

    switch (url_parts.pathname) {

        case '/':
            response_index(request, response);
            break;

        case '/other':
            response_other(request, response);
            break;

        case '/style.css':
            response.writeHead(200, {  'Content-Type': 'text/css' });
            response.write(style_css);
            response.end();
            break;

        default:
            response.writeHead(200, {'Content-Type': 'text/plain'});
            response.end('no page...');
            break;
    }
}

var server = http.createServer(getFromClient);

server.listen(3000);