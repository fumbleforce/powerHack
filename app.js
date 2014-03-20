var express = require('express'),
    app = module.exports = express(),
    http = require('http'),
    https = require('https');



app.configure(function() {
    app.use(express.static(__dirname+'/public/src'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.favicon());
    app.use(express.cookieParser('supersecretcookiesecret'));
    app.use(express.session({
        secret: 'lkcswemgliu348u9234f98djf9834j9fwefj02ifj20jsd'
    }));

    app.use(app.router);
});


app.configure('development', function() {
    app.use(express.errorHandler());
});


app.get("/readings", function(req, res, next) {

    var options = {
        hostname: 'api.demosteinkjer.no',
        path: '/examplefiles/download-6.json',
        method: 'GET',
    };

    https.request(options, function(response) {
        
        console.log("Got response");
        var str = '';

        //another chunk of data has been recieved, so append it to `str`
        response.on('data', function (chunk) {
            str += chunk;
        });

        //the whole response has been recieved, so we just print it out here
        response.on('end', function () {
            console.log(str);
            var jsonRes = JSON.parse(str);
            res.json(jsonRes);
        });

    }).on('error', function(e) {
        console.log("Got error: ", e);
    }).end();
});


app.set('port', process.env.PORT || 8000);
app.listen(app.get('port'), function(){
    console.log("Express server \"%s\" listening on port %d in %s mode", 'powerHack', app.get('port'), app.settings.env);
});