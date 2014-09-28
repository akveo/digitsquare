'use strict';

define(['module', 'app/main'], function(module, main) {
    main.register.controller(ngCName(module, 'menuController'), ['$scope', 'levelsData', 'playerData', function($scope, levelsData, playerData) {
        $scope.fullOpacityClass = true;
    }]);
    main.register.controller(ngCName(module, 'levelsController'), ['$scope', '$routeParams', 'levelsData', 'playerData', 'combinedData', function($scope, $routeParams, levelsData, playerData, combinedData) {
        var chapterId = parseInt($routeParams.groupId);
        $scope.chapterId = chapterId;
        $scope.chapter = combinedData.getChapterExtendedWithUserData(chapterId);
        var chapters = $scope.chapters = levelsData.getReducedChapters().map(function(label, i) {
            return { label: label, selected: i == chapterId };
        });
        $scope.prevChapter = chapters[chapterId - 1] ? chapterId - 1 : false;
        $scope.nextChapter = chapters[chapterId + 1] ? chapterId + 1 : false;
    }]);
    main.register.directive('addASpaceBetween', [function () {
            return function (scope, element) {
                if(!scope.$last){
                    element.after('&nbsp;');
                }
            }
        }
    ])
});