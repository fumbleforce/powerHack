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

    var self = this;

    this.readings = {};

    this.refresh_readings = function (callback) {
        $http({
            method: 'GET',
            url: '/readings',
        })
        .success(function(data, status) {
            self.readings = data;
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









;

console.log("Loaded app");