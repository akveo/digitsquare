define(['angular', 'app/config', 'app/util'], function(angular) {
    'use strict';

    angular.module('app.monetize', ['app.config', 'app.util'])
            .run(MonetizeRun);


    MonetizeRun.$inject = ['appConfig', 'util', '$rootScope', '$stateParams', '$window', 'cordovaEvent'];
    function MonetizeRun(config, u, $rootScope, $stateParams, $window, cordovaEvent) {
        if (config.ads.enabled) {
            cordovaEvent.on('deviceready', setupAds);
        }

        function setupAds() {
            var admobid = u.getConfigSettingForPlatform(config.ads.units);
            var admobPlugin = $window.AdMob;

            admobPlugin.setOptions( {
                publisherId: admobid.banner,
                interstitialAdId: admobid.interstitial,
                bannerAtTop: false, // set to true, to put banner at top
                overlap: false, // set to true, to allow banner overlap webview
                offsetTopBar: false, // set to true to avoid ios7 status bar overlap
                isTesting: config.ads.isTesting, // receiving test ad
                autoShow: false // auto show interstitial ad when loaded
            });

            if (config.ads.showBanner) {
                // display a banner at startup
                admobPlugin.createBanner();
            }

            (function initializeInterstitialAd() {

                var interstitialReady = false;
                var interstitialShowTimerAllowed = true;
                var firstTimeShowRequest = true;

                function createInterstitial(cb) {
                    admobPlugin.prepareInterstitial({ adId: admobid.interstitial}, cb, function() {
                        setTimeout(function() {
                            createInterstitial(cb);
                        }, config.ads.timeouts.interstitialRequestTimeout);
                    });
                }
                function loadInterstitialInBackground(successCallback) {
                    admobPlugin.prepareInterstitial({ isTesting: config.ads.isTesting }, successCallback, function() {
                        setTimeout(function() {
                            loadInterstitialInBackground(successCallback);
                        }, config.ads.timeouts.interstitialRequestTimeout);
                    }); 
                }
                function loadInterstitial() {
                    interstitialReady = false;
                    createInterstitial(function() {
                        loadInterstitialInBackground(function() {
                            interstitialReady = true;
                        });
                    });
                }
                function resetInterstitialTimerAllowance() {
                    interstitialShowTimerAllowed = false;
                    setTimeout(function() { interstitialShowTimerAllowed = true }, config.ads.timeouts.delayBetweenInterstitials);
                }
                function showInterstitialAd() {
                    function interstitialClosedListener() {
                        cordovaEvent.off('onDismissInterstitialAd', interstitialClosedListener);
                        setTimeout(function() {
                            resetInterstitialTimerAllowance();
                            loadInterstitial();
                        }, 1000);
                    }

                    cordovaEvent.on('onDismissInterstitialAd', interstitialClosedListener);
                    admobPlugin.showInterstitial();
                    interstitialShowTimerAllowed = false;
                    interstitialReady = false;
                }
                loadInterstitial();

                $rootScope.$on('pageViewed', function(event, pageName) {
                    if (pageName === 'Game') {
                        if (firstTimeShowRequest) {
                            firstTimeShowRequest = false;
                            resetInterstitialTimerAllowance();
                        }
                        if (isPhoneGap() && interstitialReady && interstitialShowTimerAllowed && !$stateParams.skipAd) {
                            showInterstitialAd();
                        }
                    }
                });

                $rootScope.$on('forceInterstitialAdShow', function() {
                    if (isPhoneGap()) {
                        showInterstitialAd();
                    }
                });

            })();
        }

    }

});