'use strict';

define([], function() {
    return {
        ads: {
            units: {
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
            },
            isTesting: false,
            showBanner: false,
            timeouts: {
                interstitialRequestTimeout: 10000,
                delayBetweenInterstitials: 150000
            }
        }
    };
});