//Initiate all config settings!
var base_url = "application/components/";

skematik.config(["$stateProvider", "$urlRouterProvider", "$locationProvider", "$httpProvider", function($stateProvider, $urlRouterProvider, $locationProvider, $httpProvider) {
	// Crazy prefixes
	$locationProvider.html5Mode(true).hashPrefix('!');

	// Now set up the states
	$stateProvider
	.state('fe', {
		url: '',
		views: {
			"navigation":{
				templateUrl: base_url + "../core/header/header.view.html",
				controller: "HeaderController"
			}
		}
	})
	.state('fe.scheme', {
		url: "/id/:tableId",
		views: {
			"pageContent@": {
				templateUrl: base_url + "scheme/scheme.view.html",
				controller: "SchemeController",
			}
		}
	})
	.state('fe.entry', {
		url: "/",
		views: {
			"pageContent@": {
				templateUrl: base_url + "entry/entry.view.html",
				controller: "EntryController",
			}
		}
	});

    $httpProvider.interceptors.push('resourceInterceptor');
}]);

skematik.run(["$rootScope", "$state", "$stateParams", function($rootScope, $state, $stateParams){	
    $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
    	//End loading screen
    	console.log("View loaded");
    });
}]);