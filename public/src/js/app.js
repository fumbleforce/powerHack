/*
require('angular/angular');
require('angular-route/angular-route');
var mainctrl = require('./mainctrl');
*/


//Declare app level module and dependencies
angular.module('app', ['ngRoute'])


.config(['$routeProvider', '$httpProvider', function($routeProvider) {

    $routeProvider
        .when('/', {
            templateUrl: '../dist/templates/home.html',
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


.service('Game', function() {
    var self = this;

    this.


})

   
.controller('MainController', function($scope, Readings) {
    console.log("Main ctrl");

    $scope.readings = {};

    Readings.refresh_readings(function(err) {
        $scope.readings = Readings.readings;
    });
   
})









;
