'use strict';

define(["angular"], function(angular) {
    return angular.module('app.config', [])

.constant('appConfig', {ads:{enabled:false,units:{ios:{banner:'ca-app-pub-4675194603106574/1411325040',interstitial:'ca-app-pub-4675194603106574/1575788641'},android:{banner:'ca-app-pub-4675194603106574/6522522247',interstitial:'ca-app-pub-4675194603106574/9099055449'},wp8:{banner:'ca-app-pub-xxx/9375997559',interstitial:'ca-app-pub-xxx/9099055449'}},isTesting:true,showBanner:false,timeouts:{interstitialRequestTimeout:10000,delayBetweenInterstitials:150000}},analytics:{enabled:true,gaId:{ios:'UA-56704032-2',android:'UA-56704032-3',wp8:'UA-56704032-4',desktop:'UA-56704032-2'}},db:{name:'DigitSquare.db'}})

;

});