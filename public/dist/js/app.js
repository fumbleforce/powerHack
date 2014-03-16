/*
require('angular/angular');
require('angular-route/angular-route');
var mainctrl = require('./mainctrl');
*/


//Declare app level module and dependencies
angular.module('app', ['ngRoute'])


.config(['$routeProvider', '$httpProvider', function($routeProvider, $httpProvider) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    $routeProvider
        .when('/', {
            templateUrl: '../dist/templates/home.html',
            controller: 'MainController'
        })
        .otherwise(
            {
                redirectTo: '/'
            });
}])



.service('Readings', function($http) {
    this.get_readings = function (callback) {
        delete $http.defaults.headers.common['X-Requested-With'];
        $http({
            method: 'GET',
            url: '/readings',
        })
        .success(function(data, status) {
            callback(null, data);
        })
        .error(function(data, status) {
            callback(new Error("Request failed"));
        });
    };
})

   
.controller('MainController', function($scope, Readings) {
    console.log("Main ctrl");

    Readings.get_readings(function(err, data) {
        $scope.whatsup = data;
    });
   
})









;
