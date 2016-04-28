'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 */
angular.module('SecureChatApp')
  .controller('LoginCtrl', function($scope, Auth, $ionicLoading, Hash, FirebaseRef, $q, $state, $localStorage) {


    $scope.signin = function(user) {
      console.log('signin');

      $ionicLoading.show();

      var userHash = Hash(user.email);
      var passHash = Hash(user.password);
      var RSAkey = cryptico.generateRSAKey(user.password, 1024);

      FirebaseRef.child('users/'+userHash).once('value', function (snap) {
        console.log(snap.val());

        var userData = snap.val();

        if(userData === null){
          $ionicLoading.hide();
          alert('No such user');
        }
        else{

          if(passHash == userData.password){
            console.log('logged in as '+user.email);
            gotoHome(userData, RSAkey);
          }
          else{
            alert('Password incorrect');
            $ionicLoading.hide();
          }
        }
      });
    };

    $scope.signup = function (user) {
      console.log('signup');

      $ionicLoading.show();

      var userHash = Hash(user.email);
      var passHash = Hash(user.password);
      var RSAkey = cryptico.generateRSAKey(user.password, 1024);
      var PublicKeyString = cryptico.publicKeyString(RSAkey);

      FirebaseRef.child('users/'+userHash+'/active').once('value', function (snap) {
        console.log(snap.val());

        if(snap.val() === null){

          var userData = {
            active: true,
            PublicKeyString: PublicKeyString,
            password: passHash,
            name: user.name,
            username: user.email,
            img: 'https://api.adorable.io/avatars/100/'+user.email
          };

          FirebaseRef.child('users/'+userHash).update(userData , function (err) {

            if(!err){
              console.log('created account for '+user.email);
              gotoHome(userData, RSAkey);
            }
            else{
              $ionicLoading.hide();
              alert('Cannot create user');
            }

          });
        }
        else{
          $ionicLoading.hide();
          alert('User already exists');
        }

      });
    };

    function gotoHome(userData, RSAkey) {
      $localStorage.userData = userData;
      $localStorage.RSAkey = RSAkey;

      $ionicLoading.hide();
      $state.go('app.home');
    }

  });
