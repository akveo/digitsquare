define(['angular', 'app/config', 'app/util'], function(angular) {
    'use strict';

    angular.module('app.analytics', ['app.config', 'app.util'])
            .run($AnalyticsRun);

    $AnalyticsRun.$inject = ['appConfig', 'util', '$document', '$window', '$rootScope'];
    function $AnalyticsRun(config, u, $document, $window, $rootScope) {
        if (config.analytics.enabled) {
            $document.on('deviceready', initializeAnalytics);
        }

        function initializeAnalytics() {
            var analytics = $window.navigator.analytics;
            if (!analytics)
                return;
            var trackerId = u.getConfigSettingForPlatform(config.analytics.gaId);
            
            analytics.setTrackingId(trackerId);
            analytics.set("&uid", window.device.uuid);
            try {
                analytics.enableAdvertisingIdCollection();
            } catch(e) {
                // Gotta catch them all
            }
            $rootScope.on('pageViewed', function(pageName) {
                analytics.sendAppView(pageName);
            });
            $rootScope.on('analyticsEvent', function(e) {
                analytics.sendEvent(e.category, e.action, e.label, e.value);
            });
        }
    }
});