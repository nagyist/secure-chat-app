'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:UserChatCtrl
 * @description
 * # UserChatCtrl
 */
angular.module('SecureChatApp')
  .controller('UserChatCtrl', function($scope, $stateParams, $firebaseArray, $firebaseObject, Hash, FirebaseRef, $localStorage, chatInfo, $ionicScrollDelegate, $q) {

//    console.log($stateParams);
    $scope.isGroup = false;
    $scope.user = $stateParams.user || {};
    $scope.group = $stateParams.group || {};

    $scope.title = $scope.user.name || $scope.group.groupName || 'Chat';

    console.log(chatInfo);

    $scope.chatList = null;
    var chatList;

    if(chatInfo.key){
      $scope.isGroup = false;
      chatList = $firebaseArray(FirebaseRef.child('chats/'+chatInfo.key));
    }
    else if(chatInfo.groupKey){
      $scope.isGroup = true;
      chatList = $firebaseArray(FirebaseRef.child('groupChats/'+chatInfo.groupKey+'/chats'));
    }

    chatList.$loaded()
      .then(function (chatList) {
        $scope.chatList = chatList;
//        $scope.$apply('chatList');
//        console.log('chat initialized');
      })
      .catch(function (err) {
        console.log(err);
      });

    $scope.sendChat = function (message) {

      var encryptedMsg = sjcl.encrypt(chatInfo.symmetricKey, message);

      chatList.$add({
        sender: $localStorage.userData.username,
        message: encryptedMsg,
        timestamp: Firebase.ServerValue.TIMESTAMP
      }).then(function (id) {
        console.log(id);

        if(chatInfo.key){
          $q.all([
            FirebaseRef.child('users/'+Hash($localStorage.userData.username)+'/chats/'+chatInfo.key).update({
              lastmsg: encryptedMsg
            }),
            FirebaseRef.child('users/'+Hash($stateParams.user.username)+'/chats/'+chatInfo.key).update({
              lastmsg: encryptedMsg
            })
          ]).then(function (resp) {
            console.log(resp);
          });
        }
        else{
          FirebaseRef.child('groupChats/'+chatInfo.groupKey+'/lastmsg').set(message);
        }

      });
      $scope.message = null;
      $ionicScrollDelegate.scrollBottom(true);
    };

    chatList.$watch(function(event) {
      $ionicScrollDelegate.scrollBottom();
      // console.log(event);
    });

    $scope.decrypt = function (msg) {
      return sjcl.decrypt(chatInfo.symmetricKey, msg);
    };

    $scope.imageUrl = function (user) {
      if(user === $localStorage.userData.username){
        return chatInfo.senderImg;
      }
      else{
        return chatInfo.recipientImg;
      }
    };

    $scope.name = function (user) {
      if(user === $localStorage.userData.username){
        return chatInfo.senderName;
      }
      return chatInfo.recipientName;
    };

    $scope.avatarSide = function (user) {
      if(user === $localStorage.userData.username){
        return 'item-avatar-right item-stable text-rtl';
      }
      return 'item-avatar-left';
    };

    $scope.groupSide = function (user) {
      if(user === $localStorage.userData.username){
        return 'item-stable text-rtl';
      }
      return '';
    }



  });
