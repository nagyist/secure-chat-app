'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:MainCtrl
 * @description
 * # MainCtrl
 */
angular.module('SecureChatApp')
  .controller('MainCtrl', function($scope, $state, $localStorage) {

    $scope.logout = function () {
      delete $localStorage.userData;
      delete $localStorage.RSAkey;
      $state.go('login');
    }

  });
