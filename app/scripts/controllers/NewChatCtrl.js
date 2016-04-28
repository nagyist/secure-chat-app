'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:NewChatCtrl
 * @description
 * # NewChatCtrl
 */
angular.module('SecureChatApp')
  .controller('NewChatCtrl', function($scope, Hash, $state, FirebaseRef) {

    $scope.user = {};

    $scope.submit = function (email) {
      console.log(email);

      var userHash = Hash(email);

      FirebaseRef.child('users/'+userHash).once('value', function (snap) {

//        console.log(snap.val());

        if(snap.val() !== null){
          $scope.user = snap.val();
          $scope.$apply('user');
//          console.log($scope.user);
        }
      });
    };

    $scope.startChat = function (user) {
      $state.go('app.chat', {user: user});
    };

    $scope.goHome = function () {
      $state.go('app.home');
    };

  });
