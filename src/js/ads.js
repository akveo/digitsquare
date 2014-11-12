'use strict';

define(['app/config'], function(config) {

    var rv = {
        tryShowInterstitialAd: function() {}
    };

    function setupAds() {
        var ad_units = config.ads.units;
        var admobid = "";
        if( /(android)/i.test(navigator.userAgent) ) {
            admobid = ad_units.android;
        } else if(/(iphone|ipad)/i.test(navigator.userAgent)) {
            admobid = ad_units.ios;
        } else {
            admobid = ad_units.wp8;
        }

        window.plugins.AdMob.setOptions( {
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
            window.plugins.AdMob.createBannerView();
        }

        (function initializeIntrstitialAd() {

            var interstitialReady = false,
                interstitialShowTimerAllowed = true;

            function createInterstitial(cb) {
                window.plugins.AdMob.createInterstitialView({ publisherId: admobid.interstitial}, cb, function() {
                    setTimeout(function() {
                        createInterstitial(cb);
                    }, config.ads.timeouts.interstitialRequestTimeout);
                });
            }
            function loadInterstitialInBackground(successCallback) {
                window.plugins.AdMob.createInterstitialView({ isTesting: true }, successCallback, function() {
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
                
                document.addEventListener('onDismissInterstitialAd', interstitialClosedListener); 
                window.plugins.AdMob.showInterstitialAd();
                interstitialShowTimerAllowed = false;
                interstitialReady = false;
            }
            loadInterstitial();

            // Inject the method
            rv.tryShowInterstitialAd = function() {
                if (isPhoneGap() && interstitialReady && interstitialShowTimerAllowed) {
                    showInterstitialAd();
                }
            }
        })();

    }

    if (isPhoneGap()) {
        if (window.plugins && window.plugins.AdMob) {
            setupAds();
        } else {
            window.addEventListener('deviceready', setupAds);
        }
    }

    return rv;
});