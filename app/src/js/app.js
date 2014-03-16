/*
require('angular/angular');
require('angular-route/angular-route');
var mainctrl = require('./mainctrl');
*/


//Declare app level module and dependencies
angular.module('app', ['ngRoute'])


.config(['$routeProvider', function($routeProvider) {
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

   
.controller('MainController', function($scope) {
    console.log("Main ctrl");
    $scope.whatsup = "This app is dope";
})









;
