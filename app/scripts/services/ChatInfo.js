'use strict';

/**
 * @ngdoc service
 * @name SecureChatApp.ChatInfo
 * @description
 * # ChatInfo
 * Gets chat info for two users
 *
 */
angular.module('SecureChatApp')
  .factory('ChatInfo', ['$localStorage', 'FirebaseRef', '$q', 'Hash',  function($localStorage, FirebaseRef, $q, Hash) {

    return {
      get: function (users) {

        console.log('in chatinfo');

        var info = {
          key: ''
        };
        if(users.chatFrom && users.chatTo){


          var chatFrom = Hash(users.chatFrom);
          var chatTo   = Hash(users.chatTo);
          var keyFrom = users.keyFrom;
          var keyTo = users.keyTo;

          //generate chatKey, which will be same for two users
          info.key = (chatFrom > chatTo) ? chatFrom +'_'+ chatTo : chatTo +'_'+ chatFrom;

//          var senderKey = cryptico.encrypt(info.key, keyFrom);
//          var recieverKey = cryptico.encrypt(info.key, keyTo);

          var RSAkey = cryptico.generateRSAKey(users.chatFrom, 512);
          var PublicKeyString = cryptico.publicKeyString(RSAkey);
          var symmetricKey = cryptico.encrypt(info.key, PublicKeyString);

          var dKey = cryptico.decrypt(symmetricKey.cipher, RSAkey);
          info.symmetricKey = dKey.plaintext;


          $q.all([
            FirebaseRef.child('users/'+chatTo+'/name').once('value'),
            FirebaseRef.child('users/'+chatTo+'/img').once('value') ,
            FirebaseRef.child('users/'+chatFrom+'/chats/'+info.key).once('value'),
            FirebaseRef.child('users/'+chatTo+'/chats/'+info.key).once('value')
          ])
          .then(function (val) {


            info.recipientName = val[0].val();
            info.recipientImg  = val[1].val();
            info.recipientUsername = users.chatTo;
            info.senderName    = $localStorage.userData.name;
            info.senderImg     = $localStorage.userData.img;
            info.senderUsername = $localStorage.userData.username;
            info.groupKey = null;

//            console.log('chat nodes ->', val[2].val(), val[3].val());
            if(val[2].val() === null && val[3].val() === null){

//              console.log('new chat');

              $localStorage.userChats           = $localStorage.userChats || {};
              $localStorage.userChats[info.key] = {};
              $localStorage.userChats[info.key] = {
                recipientName: info.recipientName,
                recipientImg: info.recipientImg
              };


              return $q.all([
                FirebaseRef.child('users/'+chatFrom+'/chats/'+info.key).update({
                  recipientName: info.recipientName,
                  recipientImg:  info.recipientImg,
                  recipientUsername: info.recipientUsername
                }),
                FirebaseRef.child('users/'+chatTo+'/chats/'+info.key).update({
                  recipientName: info.senderName,
                  recipientImg:  info.senderImg,
                  recipientUsername: info.senderUsername
                })
              ]);
            }
            return 'this is false ->';
          })
          .then(function (response) {
//            console.log(response, 'chatInfo added to user/chats');
//            return info;
          });

          return info;
        }
        else if(users.groupKey && users.groupName){

          info.groupKey = users.groupKey;
          info.groupName = users.groupName;
          info.symmetricKey = users.groupName;
          info.key = null;

          return info;

        }
      }
    };
  }]);
