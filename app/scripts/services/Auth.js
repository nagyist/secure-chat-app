'use strict';

/**
 * @ngdoc service
 * @name SecureChatApp.Auth
 * @description
 * # Auth
 *
 */
angular.module('SecureChatApp')
  .factory('Auth', ['$firebaseAuth', '$firebaseRef', function($firebaseAuth, $firebaseRef) {
    return $firebaseAuth($firebaseRef.default);
  }]);
