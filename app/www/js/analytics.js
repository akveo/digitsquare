'use strict';

define(['app/config', 'app/util'], function(config, u) {
    var res = {};
    ['pageViewed', 'trackEvent'].forEach(function(funcName) {
        res[funcName] = function() {};
    });

    if (isPhoneGap() && config.analytics.enabled) {
        document.addEventListener('deviceready', function() {
            var analytics = navigator.analytics;
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
            res.pageViewed = function(pageName) {
                analytics.sendAppView(pageName);
            };
            res.trackEvent = function(category, action, label, value) {
                analytics.sendEvent(category, action, label, value);
            };
        }, false);
    }

    return res;
});