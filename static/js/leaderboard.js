var app = angular.module('leaderboardApp', ['ngAnimate'])

var LEADERS_SHOWN = 3;
var SCORES_PER_PAGE = 5;

app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('[[');
  $interpolateProvider.endSymbol(']]');
});

function scoreSort(a, b) {
  if (a.total < b.total)
    return -1;
  if (a.total > b.total)
    return 1;
  return 0;
}

app.controller('LeaderboardCtrl', function($scope, $http) {
  $scope.test = "Hello World";

  $scope.competitions = [];
  $scope.currentComp = 0;
  $scope.compName = "";

  $scope.scores = [];
  $scope.visibleScores = [];
  $scope.leaders = [];
  $scope.startPos = LEADERS_SHOWN;
  $scope.endPos = LEADERS_SHOWN + SCORES_PER_PAGE;

  $scope.refresh = function() {
    $http.get('/scores')
      .success(function(data, status, headers, config) {
        $scope.competitions = data;
        $scope.loadCompetition();
      });
  };

  $scope.nextCompetition = function() {
    if ($scope.currentComp >= $scope.competitions.length) {
      $scope.currentComp = 0;
      $scope.refresh();
    } else {
      console.log($scope.competitions);
      $scope.currentComp += 1;
      $scope.loadCompetition();
    }
  };

  $scope.loadCompetition = function() {
    var comp = $scope.competitions[$scope.currentComp];

    if (!comp) {
      $scope.nextCompetition();
      return;
    }

    var scores = comp.scores;

    // Calculate totals
    for (var i = 0; i < scores.length; i++) {
      scores[i].total = scores[i].rounds.reduce(function(a, b){ return a + b; });
    }

    //scores.sort(scoreSort);

    for (var i = 0; i < scores.length; i++) {
      scores[i].position = i + 1;
    }

    $scope.compName = comp.name;
    $scope.scores = scores;
    $scope.buildPage();
  };

  $scope.nextPage = function() {
    $scope.startPos += SCORES_PER_PAGE;
    $scope.endPos = $scope.startPos + SCORES_PER_PAGE;

    if ($scope.endPos >= $scope.scores.length) {
      $scope.endPos = $scope.scores.length;
    }

    if ($scope.startPos >= $scope.scores.length) {
      $scope.startPos = LEADERS_SHOWN;
      $scope.endPos = LEADERS_SHOWN + SCORES_PER_PAGE;
      $scope.nextCompetition();
    } else {
      $scope.buildPage();
    }
  };

  $scope.buildPage = function() {
    $scope.leaders = $scope.scores.slice(0, LEADERS_SHOWN);
    $scope.visibleScores = $scope.scores.slice($scope.startPos, $scope.endPos);
  };

  setInterval(function() {
    $scope.nextPage();
    $scope.$apply();
  }, 5000);

  $scope.refresh();
});
