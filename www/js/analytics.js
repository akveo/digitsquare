define(['angular', 'app/config', 'app/util'], function(angular) {
    'use strict';

    angular.module('app.analytics', ['app.config', 'app.util'])
            .run($AnalyticsRun);

    $AnalyticsRun.$inject = ['appConfig', 'util', 'cordovaEvent', '$window', '$rootScope', 'device'];
    function $AnalyticsRun(config, u, cordovaEvent, $window, $rootScope, device) {
        if (config.analytics.enabled) {
            cordovaEvent.on('deviceready', initializeAnalytics);
        }

        function initializeAnalytics() {
            var analytics = $window.navigator.analytics;
            if (!analytics) {
                return;
            }
            var trackerId = u.getConfigSettingForPlatform(config.analytics.gaId);
            analytics.setTrackingId(trackerId);

            analytics.set("&uid", device.uuid);

            try {
                analytics.enableAdvertisingIdCollection();
            } catch(e) {
                // Gotta catch them all
            }
            $rootScope.$on('pageViewed', function(event, pageName) {
                analytics.sendAppView(pageName);
            });
            $rootScope.$on('analyticsEvent', function(event, arg) {
                analytics.sendEvent(arg.category, arg.action, arg.label, arg.value);
            });
        }
    }
});