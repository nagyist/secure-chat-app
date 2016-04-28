'use strict';

/**
 * @ngdoc function
 * @name SecureChatApp.controller:NewGroupCtrl
 * @description
 * # NewGroupCtrl
 */
angular.module('SecureChatApp')
  .controller('NewGroupCtrl', function($scope, Hash, $state, FirebaseRef, $localStorage, $ionicLoading, $q) {

    $scope.users = null;

    FirebaseRef.child('users/'+Hash($localStorage.userData.username)+'/chats').once('value', function (snap) {
      $scope.users = snap.val();
      $scope.$apply('users');
      console.log('users loaded');
    });

    $scope.selectedUsers = [];

    $scope.stateChanged = function(checked, user){
      if(checked){
        $scope.selectedUsers.push(user);
      }else{
        var index = $scope.selectedUsers.indexOf(user);
        $scope.selectedUsers.splice(index,1);
      }
    };

    $scope.createGroup = function (name) {
      $ionicLoading.show();

      var uniqueUsers = $scope.selectedUsers.filter(function(item, pos, self) {
        return self.indexOf(item) == pos;
      });
      uniqueUsers.push($localStorage.userData.username);

      var groupKey = name + '_' +uniqueUsers.join('_') +'_'+ Date.now();
      groupKey = Hash(groupKey);

      var promises = [];

      for(var i=0; i<uniqueUsers.length; i++){
        var user = uniqueUsers[i];
        var promise = FirebaseRef.child('users/'+Hash(user)+'/groups/'+groupKey).update({
          groupName: name,
          groupImg: 'https://api.adorable.io/avatars/100/'+groupKey
        });
        promises.push(promise);
      }

      promise = FirebaseRef.child('groupChats/'+groupKey).update({
        name: name,
        createdBy: $localStorage.userData.username,
        members: uniqueUsers
      });
      promises.push(promise);

      $q.all(promises)
        .then(function (res) {
          console.log(res);

          $ionicLoading.hide();

          var group = {
            groupKey: groupKey,
            groupName: name
          };

          $state.go('app.chat', {group: group});
        });


    }


  });
