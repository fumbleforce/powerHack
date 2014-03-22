var express = require('express'),
    app = module.exports = express(),
    http = require('http'),
    https = require('https'),
    querystring = require('querystring');



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

app.get("/latest", function(req, res, next) {

    var id = 'f8536c9a898f48af9d4b0586afc4ca05';
    
    get_json('/meters/'+id+'/latest/json', {
        path: '/meters/'+id+'/latest/json' +'?' + querystring.stringify({ seriesType: 'ActivePlus' }),
        headers: {

        }}, function(data) {
        res.json(data);
    });
});

app.get("/readings", function(req, res) {

    get_all_readings(function (data) {
        res.json(data);
    });
});

app.get("/reading/:rid", function(req, res) {
    var id = req.params.rid;
    
    get_address('/meters/'+id+'/', {
        seriesType:'ActivePlus',
        dateFrom:'2014-03-21',
        dateTo:'2014-03-22',
        intervalType:'Minute'
    }, function (address) {
         get_json(address, function(data) {
            res.json(data);
         });
    });
});

app.get("/meters", function(req, res, next) {

    get_address('/meters/', {
        seriesType:'ActivePlus',
        dateFrom:'2014-03-21',
        dateTo:'2014-03-22',
        intervalType:'Hour'
    }, function (address) {
         get_json(address, function(data) {
            res.json(data);
         });
    });
});

app.get("/demo", function(req, res, next) {

     get_json('/examplefiles/download-6.json', function(data) {
        res.json(data);
     });
});



app.set('port', process.env.PORT || 8000);
app.listen(app.get('port'), function(){
    console.log("Express server \"%s\" listening on port %d in %s mode", 'powerHack', app.get('port'), app.settings.env);
});




function get_address(path, opts, callback) {
    var post_data, options, req_obj, address;

    post_data = querystring.stringify(opts);

    // An object of options to indicate where to post to
    options = {
        host: 'api.demosteinkjer.no',
        path: path,
        auth: 'a3edca89c1104bd4a7437f87d781ca56:84bab227988e4fa1952127f5a64f11eb',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
        }
    };

    req_obj = https.request(options, function(response) {
        address = response.headers.location;
        console.log(response.headers.location);

        if (address)
            address = address.split('.no')[1];
        else
            address = '/';

        console.log("Address is: "+address);

        return callback(address);
    });

    req_obj.on('error', function(e) {
        console.log("Got error: ", e);
    });

    req_obj.write(post_data);
    req_obj.end();
}


function get_json(address, opts, callback) {
    var options, req_obj, str, jsonRes;

    if (!callback) {
        callback = opts;
        opts = {};
    }

    options = {
        host: 'api.demosteinkjer.no',
        path: opts.path || address,
        auth: 'a3edca89c1104bd4a7437f87d781ca56:84bab227988e4fa1952127f5a64f11eb',
        method: 'GET',
        headers: opts.headers || { 'Accept': 'application/json' }
    };
    console.log(options);
    function handle_response(response) {
        
        str = '';

        response.on('data', function (chunk) {
            str += chunk;
        });

        response.on('end', function () {
            if (str == '') {
                console.log('waiting...');
                setTimeout(function() {
                  send_request();
                }, 1000);
            } else {
                console.log('Done');
                jsonRes = JSON.parse(str);
                callback(jsonRes);
            }
        });
    }

    function handle_error(e) {
        console.log("Got error: ", e);
    }

    function send_request() {
        req_obj = https.request(options, handle_response);
        req_obj.on('error', handle_error);
        req_obj.end();
    }

    send_request();
    
}

function get_all_readings(callback) {
    var options, req_obj, str, ids, readings;

    ids = [
        '0e6e348bfdb74432b6709526527c3d12',
        '278d2f2dbf8244f6901596ab97b31a18',
        '42ef576a9d0a4b4cba442aced5289a1f',
        '60f25c842b384f65beb2879cba5d61c7',
        '63b23efd8cd44068827adbd834602515',
        '6af1822d94b6441cada60a38c89f58fa',
        '784dcda936c848ca8c07e0f9044b8155',
        '97eff2bcbf024b18920a928dc90d806c',
        'a5b4e13275f648b586681cedd7a562ee',
        'e848f649dcc047bab0532e1b5dc20219',
    ];

    readings = [];
    
    function pass_address(address) {
        get_json(address, add_data);
    }

    function add_data(data) {
        readings.push(data);

        //if (readings.length == ids.length) {
        if (readings.length == 1) {
            return callback(readings);
        }
    }

    for (var i = 0; i < 1; i++) {

        get_address('/meters/'+ids[i]+'/', {
            seriesType:'ActivePlus',
            dateFrom:'2014-03-21',
            dateTo:'2014-03-22',
            intervalType:'Minute'
        }, pass_address);
    }
}