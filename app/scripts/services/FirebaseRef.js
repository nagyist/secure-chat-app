'use strict';

/**
 * @ngdoc service
 * @name SecureChatApp.FirebaseRef
 * @description
 * # FirebaseRef
 * Retrieves the list of books against search terms.
 *
 */
angular.module('SecureChatApp')
  .factory('FirebaseRef', ['$firebaseRef', function($firebaseRef) {

    return $firebaseRef.default;

  }]);
