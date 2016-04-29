'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:UserChatCtrl
 * @description
 * # UserChatCtrl
 */
angular.module('SecureChatApp')
  .controller('UserChatCtrl', function($scope, $stateParams, $firebaseArray, $firebaseObject, Hash, FirebaseRef, $localStorage, chatInfo, $ionicScrollDelegate, $q, $ionicPlatform, $cordovaCamera, $ionicPopup) {

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
    };

    //Image Picker

    $scope.sendPicture = function () {

      $ionicPlatform.ready(function() {
        var options = {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
          targetWidth: 200,
          targetHeight: 200
        };

        $cordovaCamera.getPicture(options).then(function(imageData) {
          console.log('img', imageData);
//          $scope.imageData = "data:image/jpeg;base64,"+imageUri;


          var encryptedImg = sjcl.encrypt(chatInfo.symmetricKey, "data:image/jpeg;base64,"+imageData);

          var lastmsg = sjcl.encrypt(chatInfo.symmetricKey, 'Image');
          chatList.$add({
            sender: $localStorage.userData.username,
            img: encryptedImg,
            timestamp: Firebase.ServerValue.TIMESTAMP
          }).then(function (id) {
            console.log(id);

            if(chatInfo.key){
              $q.all([
                FirebaseRef.child('users/'+Hash($localStorage.userData.username)+'/chats/'+chatInfo.key).update({
                  lastmsg: lastmsg
                }),
                FirebaseRef.child('users/'+Hash($stateParams.user.username)+'/chats/'+chatInfo.key).update({
                  lastmsg: lastmsg
                })
              ]).then(function (resp) {
                console.log(resp);
              });
            }
            else{
              FirebaseRef.child('groupChats/'+chatInfo.groupKey+'/lastmsg').set(lastmsg);
            }

            $ionicScrollDelegate.scrollBottom(true);

          });

        }, function(err) {
          console.log(err);
        });

      });

    };

    $scope.toggleImage = function (chat) {
      console.log(chat);
      chat.isImageClicked = !chat.isImageClicked;
    }

    $scope.showImage = function(base64) {
      var alertPopup = $ionicPopup.alert({
        title: '',
        template: '<img src="'+base64+'"/>'
      });
      alertPopup.then(function(res) {
        console.log('Thank you for not eating my delicious ice cream cone');
      });
    };


  });
