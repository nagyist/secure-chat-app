'use strict';

/**
 * @ngdoc overview
 * @name SecureChatApp
 * @description
 * # Initializes main application and routing
 *
 * Main module of the application.
 */


angular.module('SecureChatApp', ['ionic', 'ngCordova', 'ngResource', 'firebase', 'ngStorage'])

  .run(function($ionicPlatform, $rootScope, $ionicHistory) {

    $ionicPlatform.ready(function() {
      // save to use plugins here
    });

    $rootScope.goBack = function () {
      $ionicHistory.goBack();
    };

    // add possible global event handlers here

  })

  .config(function($httpProvider, $stateProvider, $urlRouterProvider, $firebaseRefProvider) {
    // register $http interceptors, if any. e.g.
    // $httpProvider.interceptors.push('interceptor-name');

    $firebaseRefProvider.registerUrl('https://secure-chat-app.firebaseio.com/');

    // Application routing
    $stateProvider
      .state('app', {
        url: '/app',
        abstract: true,
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl',
        resolve: {
          user: function($firebaseAuthService) {
            return $firebaseAuthService.$waitForAuth();
          }
        }
      })
      .state('login', {
        url: '/login',
        cache: false,
        templateUrl: 'templates/login.html',
        controller: 'LoginCtrl'
      })
      .state('app.home', {
        url: '/home',
        cache: false,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })
      .state('app.newchat', {
        url: '/newchat',
        cache: false,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/newchat.html',
            controller: 'NewChatCtrl'
          }
        }
      })
      .state('app.newgroup', {
        url: '/newgroup',
        cache: false,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/newgroup.html',
            controller: 'NewGroupCtrl'
          }
        }
      })
      .state('app.chat', {
        url: '/chat',
        cache: false,
        views: {
          'viewContent': {
            templateUrl: 'templates/views/chat.html',
            controller: 'UserChatCtrl'
          }
        },
        params: {
          user: null,
          group: null
        },
        resolve: {
          'chatInfo' : function($stateParams, ChatInfo, $localStorage) {
            if($stateParams.user){
              return ChatInfo.get({
                chatFrom: $localStorage.userData.username,
                keyFrom: $localStorage.userData.PublicKeyString,
                chatTo: $stateParams.user.username,
                keyTo: $stateParams.user.PublicKeyString
              });
            }
            else
              return ChatInfo.get({
                groupKey: $stateParams.group.groupKey,
                groupName: $stateParams.group.groupName
              });
          }
        }
      })
      .state('app.settings', {
        url: '/settings',
        views: {
          'viewContent': {
            templateUrl: 'templates/views/settings.html',
            controller: 'SettingsCtrl'
          }
        }
      });


    // redirects to default route for undefined routes
    $urlRouterProvider.otherwise('/login');
  });


