'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:ActivateAccountCtrl
 * @description
 * # ActivateAccountCtrl
 */
angular.module('SecureChatApp')
  .controller('ActivateAccountCtrl', function($scope, Hash, FirebaseRef, $localStorage, $state, $stateParams) {

    $scope.user = {};
    $scope.user.email = $stateParams.email;


    $scope.activate = function (input) {
      var email = input.email,
          token = input.token,
          password = input.password;

      FirebaseRef.changePassword({
        email: email,
        oldPassword: token,
        newPassword: password
      }, function(error) {
        if (error) {
          switch (error.code) {
            case "INVALID_PASSWORD":
              alert("The specified token is incorrect.");
              break;
            case "INVALID_USER":
              console.log("The specified email does not exist.");
              break;
            default:
              console.log("Error changing password:", error);
          }
        } else {
          console.log("User password changed successfully!");

          FirebaseRef.child('users').orderByChild('email').equalTo(email).limitToFirst(1).once('value', function (snap) {

            var users = snap.val();
            console.log(users);

            var user;
            for (var prop in users) {
              if(!users.hasOwnProperty(prop))
                continue;
              user = users[prop];
              break;
            }

            user.password = Hash(password);

            var RSAKey = cryptico.generateRSAKey(user.username, 1024);

            FirebaseRef.child('users/'+Hash(user.username)).update(user, function (err) {
              if(!err){
                gotoHome(user, RSAKey);
              }
            });
          });

        }
      });

    };

    function gotoHome(userData, RSAkey) {
      $localStorage.userData = userData;
      $localStorage.RSAkey = RSAkey;

//      $ionicLoading.hide();
      $state.go('app.home');
    }

  });
