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



.service('Readings', function($http) {

    var self = this, usage, change;

    this.readings = [];

    this.refresh_readings = function (callback) {
        $http({
            method: 'GET',
            url: '/readings',
        })
        .success(function(data, status) {
            var tmpData, dataList;

            tmpData = data[0].meterReadings[0].meterReading.readings;
            self.readings = [];

            for (var i = 0; i < tmpData.length; i++) {
                if (i === 0)
                    self.readings.push([i, 0]);
                else {
                    usage = tmpData[i].value - tmpData[i-1].value;
                    change = usage - self.readings[i-1][1];
                    if (Math.abs(change) > 30)
                        self.readings.push([i, usage]);
                    else
                       self.readings.push([i, self.readings[i-1][1]]);
                }
                   
            }

            callback();
        })
        .error(function(data, status) {
            callback(new Error("Request failed"));
        });
    };

    this.refresh_latest = function (callback) {
        $http({
            method: 'GET',
            url: '/latest',
        })
        .success(function(data, status) {
            var tmpData, dataList;

            tmpData = data[0].meterReadings[0].meterReading.readings[0];
            self.readings.push([]);

            usage = tmpData[i].value - tmpData[i-1].value;
                    change = usage - self.readings[i-1][1];
                    if (Math.abs(change) > 30)
                        self.readings.push([i, usage]);
                    else
                       self.readings.push([i, self.readings[i-1][1]]);
            callback();
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
        points: 0,
        targets: []
    };
})

   
.controller('MainController', function($scope, Readings, GameData) {
    console.log("Main ctrl loaded");

    $scope.readings = {};
    $scope.game = GameData;

    Readings.refresh_readings(function(err) {
        $scope.readings = Readings.readings;
    });
   
})



.directive('chart', function(Readings) {
    return {
        restrict: 'E',
        link: function(scope, elem, attrs) {

            elem.css({
                width: $(window).width()-100,
                height: 400,
                display:'block'
            });

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
                        ticks:10,
                        label:'Minute',
                        labelPos:"high"
                    }
                },
                loaded = false;


            scope.$watch(attrs.ngModel, function(v) {
                if (!chart) {
                    chart = $.plot(elem, [{
                            data: [],
                        }], opts);
                    elem.hide();
                    loaded = true;
                } else {

                    console.log('Got data, drawing');

                    chart.setData([{
                        data:v,
                    }], opts);
                    chart.setupGrid();
                    chart.draw();

                    elem.show();
                }
            });
        }
    };
})





;

console.log("Loaded app");