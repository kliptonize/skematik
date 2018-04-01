//Feedback factory
skematikFactories.factory('FeedbackFactory',["$resource", "$location", function($resource, $location) {
  return $resource($location.protocol() + '://api.' + $location.host().replace("www.", "") + '/feedback', {}, {
    sendFeedback: {
      method: 'POST',
      isArray: false
    }
  });
}]);