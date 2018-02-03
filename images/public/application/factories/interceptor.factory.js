skematikFactories.factory('resourceInterceptor', ["$rootScope", function ($rootScope) {
  return {
    request: function (config) {
      //Intercept all calls to api
      if(system.logApi){
        if(config.url.indexOf(":3000") !== -1){
          console.log("Started loading: " + config.url);
        }
      }
      
      //Return config
      return config;
    },
    response: function (response) {
      //Intercept all calls to api
      if(response.config.url.indexOf(":3000") !== -1){
        if(system.logApi){
          console.log("Done loading: " + response.config.url + " with code: " + response.status + ":" + response.statusText);
        }
        response.data.$status = response.status;
      }

      //Return response
      return response;
    },
    responseError: function (error) {
      $rootScope.$broadcast("request.error", {error: error});

      return error;
    }
  };
}]);

