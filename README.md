# Digit Square puzzle game
Hybrid mobile application (puzzle game) written using Cordova/Phonegap, AngularJS, RequireJS and other trending tools :)

Application is live. You can download it from marketplaces:
* [Apple store](https://itunes.apple.com/us/app/digit-square-puzzle-game/id959622726)
* [Android market](https://play.google.com/store/apps/details?id=com.flatlogic.digitsquare)
* Windows 8 - TBD
* [Desktop version](http://digitsquare.mobi)

## Features
#### Gameplay
* 100 different levels. (If you think the first 20 is too easy, yeah it's true. Go straight to the 4-th and 5-th chapter and let's see how long would it take for you to finish them :) ).
* Neat UI
* Responsive design
* Autosave feature

I didn't add bootstrap, because I think it's overwhelming for such small project

#### Technical stuff
* AngularJS
* Cordova/Phonegap
* Sass
* RequireJS
* Google analytics integrated
* Admob integrated
* Sqlite storage for mobiles and localstorage for desktop
* Hardware accelerated CSS3 animations
* Nice levels gallery with swipe support
* Ability to use generated configs

## Setup
1. Install node and bower dependencies: `npm install`
2. Build configs, styles etc.: `grunt buildAssets`
3. Add some platform, for example iOS: `cordova platform add ios`
4. Either open the project in the xCode or type `cordova run ios`

Please refer to [Apache Cordova documentation](http://cordova.apache.org/docs/en/4.0.0/) for additional info.
