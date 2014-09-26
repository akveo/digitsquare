'use strict';

define(['module', 'app/main'], function(module, main) {
    main.register.controller(ngCName(module, 'menuController'), ['$scope', function($scope) {
        $scope.fullOpacityClass = true;
    }]);
    main.register.controller(ngCName(module, 'levelsController'), ['$scope', function($scope) {
        var res = [];
        for (var i = 0; i < 20; i++) {
            res.push({ id: i + 1 });
        }
        $scope.levels = res;
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