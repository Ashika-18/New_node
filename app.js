const http = require('http');
const fs = require('fs');
const ejs = require('ejs');
const url = require('url');
const qs = require('querystring');

const index_page = fs.readFileSync('./index.ejs', 'utf-8');
const other_page = fs.readFileSync('./other.ejs', 'utf-8');
const style_css = fs.readFileSync('./style.css', 'utf-8');

console.log('-コハク準備OK-');

var data = { msg: 'no message' };

//メインプログラム
const getFromClient = (request, response) => {

    var url_parts = url.parse(request.url, true);

    //indexの表示の作成
    const response_index = (request, response) => {
        //POSTアクセスの処理
        if (request.method == 'POST') {
            var body = '';
            
            //データ受信時
            request.on('data', (data) => {
                body += data;
            });

            //データ受信終了時
            request.on('end', () => {
                data = qs.parse(body);
                //クッキーの保存
                setCookie('msg', data.msg, response);
                write_index(request, response);
            });
        } else {
            write_index(request, response);
        }
    }

    //Indexの表示
    const write_index = (request, response) => {
        var msg = "伝言を表示します。"
        var cookie_data = getCookie('msg', request);
        var content = ejs.render(index_page, {
            title: "Index",
            content: msg,
            data: data,
            cookie_data: cookie_data,
        });
        response.writeHead(200, {'Content-Type': 'text/html'});
        response.write(content);
        response.end();
    }

    //クッキーの値を設定
    const setCookie = (key, value, response) => {
        var cookie = escape(value);
        response.setHeader('Set-Cookie', [key + '=' + cookie]);
    }

    //クッキーの値を取得
    const getCookie = (key, request) => {
        var cookie_data = request.headers.cookie != undefined ? request.headers.cookie : '';
        var data = cookie_data.split(';');
        for (var i in data) {
            if (data[i].trim().startsWith(key + '=')) {
                var result = data[i].trim().substring(key.length + 1);
                return unescape(result);
            }
        }
        return '';
    }
    
    //Otherのアクセス処理
    const response_other = (request, response) => {
        var msg = "これはOTHERページですねん。"
        var content = ejs.render(other_page, {
            title: "Other",
            content: msg,
            data: data2,
            filename: 'data_item'
        });
        response.writeHead(200, { 'Content-Type': 'text/html' });
        response.write(content);
        response.end();
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
            response.writeHead(200, {'Content-Type': 'text/html'});
            response.end('no page...');
            break;
    }
}

var server = http.createServer(getFromClient);

server.listen(3000);