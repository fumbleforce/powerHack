/*
require('angular/angular');
require('angular-route/angular-route');
var mainctrl = require('./mainctrl');
*/


//Declare app level module and dependencies
var app = angular.module('app', ['ngRoute'])


.config(['$routeProvider', '$httpProvider', function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: '../templates/home.html',
            controller: 'MainController'
        })
        .otherwise({
            redirectTo: '/'
        });
}])



.service('Readings', function($http, $timeout, GameData) {

    var self = this, usage, change, t, identity,
        ids = [
            '278d2f2dbf8244f6901596ab97b31a18',
            '42ef576a9d0a4b4cba442aced5289a1f',
        ],
        colors = {},
        sensitivity = 0;

    identity = { 'left': ids[0], 'right': ids[1] };
    this.readings = {};
    this.rawData ={};

    this.refresh_readings = function (callback) {

        self.rawData = {};
        self.readings = {};

        function success (data, status, index) {
            var tmpData, dataList, id, average, i;

            id = data.meterReadings[0].meterReading.meterAsset.mRID;

            if (id === identity['left'])
                index = 'left';
            else
                index = 'right';

            if (!GameData.points[index])
                GameData.points[index] = 0;

            tmpData = data.meterReadings[0].meterReading.readings;

            dataList = [];

            for (i = 0; i < tmpData.length; i++) {
                if (i === 0) {
                    dataList.push([i, 0]);
                }
                else {
                    usage = tmpData[i].value - tmpData[i-1].value;
                    change = usage - dataList[i-1][1];

                    if (Math.abs(change) > sensitivity)
                        dataList.push([i, usage]);
                    else
                       dataList.push([i, dataList[i-1][1]]);

                    
                }
                   
            }

            average = dataList.reduce(function(a, b) { return a + b[1]; }, 0) / dataList.length;
            console.log('Average: '+average);
            points = 0;

            for (i = 0; i < dataList.length; i++)
                points += Math.floor(Math.pow(Math.abs(dataList[i][1] - average),5) / 100);

            if (!colors[id]) {
                colors[id] = '#'+Math.floor(Math.random()*16777215).toString(16);
                if (colors[id].length < 7)
                    colors[id] += "0" * (7 - colors[id].length);

            }

            self.readings[index] = {
                id: id,
                data: dataList,
                color: colors[id],
                points: points,
                average: average,
                index: index
            };

            //self.refresh_latest(callback);

            callback();
        }

        function error (data, status) {
            callback(new Error("Request failed"));
        }

        for (var i = 0; i < ids.length; i++) {
            $http({
                method: 'GET',
                url: '/reading/'+ids[i],
            })
            .success(function(data, status) { success(data, status, i); })
            .error(error);
        }

        t = $timeout(function() {
            self.refresh_readings(callback);
        }, 1 * 10000);
        
    };

    this.refresh_latest = function (callback) {
        $http({
            method: 'GET',
            url: '/latest',
        })
        .success(function(data, status) {
            var tmpData, dataList;
            console.log(data);
            tmpData = data.meterReadings[0].meterReading.readings[0];
            console.log('Prev value: '+self.rawData[self.rawData.length-1].value);
            usage = tmpData.value - self.rawData[self.rawData.length-1].value;
            console.log('Usage: '+usage);
            change = usage - self.readings[self.readings.length-1][1];
            console.log('Change: '+change);
            if (Math.abs(change) > 30)
                self.readings.push([self.readings.length, usage]);
            else
               self.readings.push([self.readings.length, self.readings[self.readings.length-1][1]]);

            self.rawData.push(tmpData);
            callback();

            t = $timeout(function() {
                self.refresh_latest(callback);
            }, 1000);
        })
        .error(function(data, status) {
            callback(new Error("Request failed"));
        });
    };
})


.factory('GameData', function() {
    if (localStorage['powerHackData']) {
        return JSON.parse(localStorage['powerHackData']);
    }
    return {
        points: {},
        targets: []
    };
})

   
.controller('MainController', function($scope, Readings, GameData) {
    console.log("Main ctrl loaded");

    $scope.safeApply = function(fn) {
        var phase = this.$root.$$phase;
        if(phase == '$apply' || phase == '$digest') {
            if(fn && (typeof(fn) === 'function')) {
                fn();
            }
        } else {
            this.$apply(fn);
        }
    };

    $scope.readings = {};
    $scope.game = GameData;


    var update_readings = function(err) {
        
        $scope.safeApply(function() {
            console.log('Updated reading');
            $scope.readings = Readings.readings;
        });
        
    };

    Readings.refresh_readings(update_readings);


})



.directive('chart', function(Readings, GameData) {

    var colors = {};

    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {

            elem.css({
                width: $(window).width()-600,
                height: 400,
                display:'block'
            });


/*
            var chart = null,
                opts  = {
                    series: {
                        lines: { show: true },
                    },
                    grid: {
                        hoverable: true,
                        clickable: true
                    },
                    yaxis: {
                        label:'Usage',
                        labelPos:"high"
                    },
                    xaxis: {
                        min:1,
                        ticks:10,
                        label:'Minute',
                        labelPos:"high"
                    }
                },
                loaded = false;
*/

            scope.$watch(attrs.ngModel, function(v) {

                if (v['left'] && v['right']) {

                    $(elem).empty();

                    if (!v['left'] || !v['right']) return;

                    if (!GameData.points['left']) GameData.points['left'] = 0;
                    if (!GameData.points['right']) GameData.points['right'] = 0;

                    $("<div class=\"big-spark pull-left\"><div id=\"leftSpark\" class=\"chart\"></div></div>")
                    .appendTo(elem);

                    $("<div class=\"big-spark pull-left\"><div id=\"rightSpark\" class=\"chart\"></div></div>")
                    .appendTo(elem);

                    var max_width = $(window).width()-600;
                    
                    var left_percent = ((v['left'].points / (v['left'].points + v['right'].points)) + (GameData.points['left']-GameData.points['right'])/1000);
                    $("#leftSpark").sparkline(v['left'].data.slice(1,v['left'].data.length) , {
                        height:200,
                        width: Math.floor(max_width * left_percent),
                        chartRangeMin: 0,
                        lineColor:'0017ff',
                        negBarColor:"bf0000",
                        fillColor: 'transparent',
                        lineWidth: 3,
                    });

                    if (left_percent >= 1.0) {
                        alert('Stian vant!');
                    }

                    

                    console.log((v['left'].points / (v['left'].points + v['right'].points)));
                    var right_percent = ((v['right'].points / (v['left'].points + v['right'].points)) + (GameData.points['right']-GameData.points['left'])/1000);
                    $("#rightSpark").sparkline(v['right'].data.slice(1,v['left'].data.length) , {
                        height:200,
                        width: Math.floor(max_width * right_percent),
                        chartRangeMin: 0,
                        lineColor:'dc143c',
                        negBarColor:"bf0000",
                        fillColor: 'transparent',
                        lineWidth: 3,
                    });

                    GameData.points['left'] += +String(10 * (v['left'].points / (v['left'].points + v['right'].points))).split('.')[0];
                    GameData.points['right'] += +String(10 * (v['right'].points / (v['left'].points + v['right'].points))).split('.')[0];

                    console.log('Got data, drawing');

                    console.log('Left: '+GameData.points['left']);
                    console.log('Right: '+GameData.points['right']);

                    elem.show();
                }
                /*
                if (!chart) {
                    console.log('Chart not defined');
                    chart = $.plot(elem, [{
                            data: [],
                        }], opts);
                    elem.hide();
                    loaded = true;
                } else {

                    console.log('Got data, drawing');

                    chart.setData(v, opts);
                    chart.setupGrid();
                    chart.draw();

                    elem.show();
                }
                */
            }, true);
        }
    };
})





;

console.log("Loaded app");