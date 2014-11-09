'use strict';

define([], function() {

    function setupAds() {
       var ad_units = {
            ios : {
                banner: 'ca-app-pub-4675194603106574/1411325040',
                interstitial: 'ca-app-pub-4675194603106574/1575788641'
            },
            android : {
                banner: 'ca-app-pub-4675194603106574/6522522247',
                interstitial: 'ca-app-pub-4675194603106574/9099055449'
            },
            wp8 : {
                banner: 'ca-app-pub-xxx/9375997559',
                interstitial: 'ca-app-pub-xxx/9099055449'
            }
        };
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
            isTesting: true, // receiving test ad
            autoShow: true // auto show interstitial ad when loaded
        });

        // display a banner at startup
        window.plugins.AdMob.createBannerView(); 
    }

    if (isPhoneGap()) {
        if (window.plugins && window.plugins.AdMob) {
            setupAds();
        } else {
            window.addEventListener('deviceready', setupAds);
        }
    }

});