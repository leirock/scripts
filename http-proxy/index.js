var http = require('http');
var url = require('url');
var request = require('request');

http.createServer(onRequest).listen(8080);

function onRequest(req, res) {

    var queryData = url.parse(req.url, true).query;
    if (queryData.url) {
        request({
            url: queryData.url.replace(/.*libravatar\.org\/avatar\/(.*)/g, 'https://sdn.geekzu.org/avatar/$1?d=mp')
        }).on('error', function(e) {
            res.end(e);
        }).pipe(res);
    }
    else {
        res.end("No url found.");
    }
}
