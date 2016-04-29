'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:ChatsCtrl
 * @description
 * # ChatsCtrl
 */
angular.module('SecureChatApp')
  .controller('ChatsCtrl', function($scope, FirebaseRef, $firebaseArray, Hash, $localStorage, $state, $ionicLoading) {

    $scope.users = null;
    $scope.groups = null;

    FirebaseRef.child('users/'+Hash($localStorage.userData.username)+'/chats').once('value', function (snap) {
      $scope.users = snap.val();
      $scope.$apply('users');
      console.log('chats loaded');
    });

    FirebaseRef.child('users/'+Hash($localStorage.userData.username)+'/groups').once('value', function (snap) {
      $scope.groups = snap.val();
      $scope.$apply('groups');
      console.log('groups loaded');
    });

//    $scope.grpLastMsg = function (key) {
//      FirebaseRef.child('groupChats/'+key+'/lastmsg').once('value', function (snap) {
//        console.log(snap.val());
//        return snap.val();
//      })
//    };

    $scope.decrypt = function (key, msg) {
      return sjcl.decrypt(key, msg);
    };

    $scope.startChat = function (chatKey) {

      $ionicLoading.show({
        template: 'Initializing chat parameters <br><ion-spinner icon="crescent" class="spinner-assertive"></ion-spinner>'
      });
      var users = chatKey.split('_');
      console.log(users);

      var chatTo = null;
      if(users[0] == Hash($localStorage.userData.username)){
        chatTo = users[1];
      }
      else {
        chatTo = users[0];
      }

      FirebaseRef.child('users/'+chatTo).once('value', function (snap) {
        var user = snap.val();
        $ionicLoading.hide();
        console.log('loading hide');
        $state.go('app.chat', {user: user});
      });

    };

    $scope.startGroupChat = function (key, name) {
      var group = {
        groupKey: key,
        groupName: name
      };

      $state.go('app.chat', {group: group});
    }


  });
