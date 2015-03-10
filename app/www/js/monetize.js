define(['angular', 'app/config', 'app/util'], function(angular) {
    'use strict';

    angular.module('app.monetize', ['app.config', 'app.util'])
            .run(MonetizeRun);


    MonetizeRun.$inject = ['appConfig', 'util', '$rootScope', '$routeParams', '$window', '$document'];
    function MonetizeRun(config, u, $rootScope, $routeParams, $window, $document) {
        if (config.ads.enabled) {
            $document.on('deviceready', setupAds);
        }

        function setupAds() {
            var admobid = u.getConfigSettingForPlatform(config.ads.units);
            var admobPlugin = $window.plugins.AdMob;

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
                admobPlugin.createBannerView();
            }

            (function initializeInterstitialAd() {

                var interstitialReady = false;
                var interstitialShowTimerAllowed = true;
                var firstTimeShowRequest = true;

                function createInterstitial(cb) {
                    admobPlugin.createInterstitialView({ publisherId: admobid.interstitial}, cb, function() {
                        setTimeout(function() {
                            createInterstitial(cb);
                        }, config.ads.timeouts.interstitialRequestTimeout);
                    });
                }
                function loadInterstitialInBackground(successCallback) {
                    admobPlugin.createInterstitialView({ isTesting: config.ads.isTesting }, successCallback, function() {
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
                        document.removeEventListener('onDismissInterstitialAd', interstitialClosedListener);
                        setTimeout(function() {
                            resetInterstitialTimerAllowance();
                            loadInterstitial();
                        }, 1000);
                    }
                    
                    $document.on('onDismissInterstitialAd', interstitialClosedListener); 
                    admobPlugin.showInterstitialAd();
                    interstitialShowTimerAllowed = false;
                    interstitialReady = false;
                }
                loadInterstitial();

                $rootScope.on('pageViewed', function(pageName) {
                    if (pageName === 'Game') {
                        if (firstTimeShowRequest) {
                            firstTimeShowRequest = false;
                            resetInterstitialTimerAllowance();
                        }
                        if (isPhoneGap() && interstitialReady && interstitialShowTimerAllowed && !$routeParams.skipAd) {
                            showInterstitialAd();
                        }
                    }
                });

                $rootScope.on('forceInterstitialAdShow', function() {
                    if (isPhoneGap()) {
                        showInterstitialAd();
                    }
                });

            })();
        }

    }

});