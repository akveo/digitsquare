'use strict';

define(['module', 'app/main', 'angular'], function(module, main, angular) {
    main.register
            .controller(ngCName(module, 'gameController'), function($scope, $route) {
                var initialState = [1,2,3,4,5,6,7,8,9],
                    sideSize = Math.sqrt(initialState.length);
                $scope.reloadLevel = function() {
                    return $route.reload();
                }
                if (Math.round(sideSize) === sideSize) {
                    $scope.matrixData = {
                        initialState: initialState,
                        sideSize: sideSize,
                        sideSizePercent: (100 / sideSize) + '%'
                    };
                    $scope.Math = window.Math;
                } else {
                    throw Error('Not valid matrix initial state!');
                }
            });
    main.register.directive('swipeCell', function() {
                return {
                    restrict: 'A',
                    controller: function ($scope, $element, $attrs) {
                        $element.bind('touchstart', onTouchStart);

                        function onTouchStart(event) {
                            event.preventDefault();

                            $scope.startX = event.touches[0].pageX;
                            $scope.startY = event.touches[0].pageY;
                            $scope.parent = $element.parent()[0];
                            $element.bind('touchmove', onTouchMove);
                            $element.bind('touchend', onTouchEnd);
                        }

                        function removeAnimatedClasses() {
                            [].slice.call($scope.parent.querySelectorAll('div'), 0).forEach(function(el) {
                                angular.element(el).removeClass($scope.animClass);
                            });
                        }

                        function moveNodes() {
                            switch ($scope.animClass) {
                                case 'moveUp':
                                    $scope.elementsArray.forEach(function(el) {
                                        var $el = angular.element(el),
                                            row = parseInt($el.attr('data-row')),
                                            newRow = row - 1;
                                        $el.attr('data-row', newRow < 0 ? $scope.elementsArray.length - 1 : newRow);
                                    });
                                    break;
                                case 'moveDown': 
                                    $scope.elementsArray.forEach(function(el) {
                                        var $el = angular.element(el),
                                            row = parseInt($el.attr('data-row')),
                                            newRow = row + 1;
                                        console.log(newRow);
                                        $el.attr('data-row', newRow > $scope.elementsArray.length - 1 ? 0 : newRow);
                                    });
                                    break;
                                case 'moveLeft':
                                    $scope.elementsArray.forEach(function(el) {
                                        var $el = angular.element(el),
                                            col = parseInt($el.attr('data-col')),
                                            newCol = col - 1;
                                        $el.attr('data-col', newCol < 0 ? $scope.elementsArray.length - 1 : newCol);
                                    });
                                    break;
                                case 'moveRight':
                                    $scope.elementsArray.forEach(function(el) {
                                        var $el = angular.element(el),
                                            col = parseInt($el.attr('data-col')),
                                            newCol = col + 1;
                                        $el.attr('data-col', newCol > $scope.elementsArray.length - 1 ? 0 : newCol);
                                    });
                                    break;
                            }
                        }

                        function onTouchMove(event) {
                            event.preventDefault();
                            var direction = '',
                                deltaX = event.changedTouches[0].pageX - $scope.startX,
                                deltaY = event.changedTouches[0].pageY - $scope.startY,
                                absDeltaX = Math.abs(deltaX),
                                absDeltaY = Math.abs(deltaY),
                                $elements;

                            if (absDeltaY || absDeltaX) {
                                if (absDeltaY > absDeltaX) {
                                    $elements = $scope.parent.querySelectorAll('[data-col="' + $attrs.col + '"]');
                                    direction = deltaY > 0 ? 'moveDown' : 'moveUp';
                                } else {
                                    $elements = $scope.parent.querySelectorAll('[data-row="' + $attrs.row + '"]');
                                    direction = deltaX > 0 ? 'moveRight' : 'moveLeft';
                                }
                                $elements = [].slice.call($elements, 0);
                            }
                            
                            if ($scope.animClass && $scope.animClass != direction) {
                                removeAnimatedClasses();
                            }
                            $elements.forEach(function(el) {
                                angular.element(el).addClass(direction);
                            });
                            $scope.animClass = direction;
                            $scope.elementsArray = $elements;
                        }

                        // Unbinds methods when touch interaction ends
                        function onTouchEnd(event) {
                            event.preventDefault();

                            removeAnimatedClasses();
                            moveNodes();
                            $element.unbind('touchmove', onTouchMove);
                            $element.unbind('touchend', onTouchEnd);
                        }
                    }
                }
            });
});