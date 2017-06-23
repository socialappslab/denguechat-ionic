Ionic App Base
=====================

A starting project for Ionic that optionally supports using custom SCSS.

## Using this project

We recommend using the [Ionic CLI](https://github.com/driftyco/ionic-cli) to create new Ionic projects that are based on this project but use a ready-made starter template.

For example, to start a new Ionic project with the default tabs interface, make sure the `ionic` utility is installed:

```bash
$ npm install -g ionic
```

Then run:

```bash
$ ionic start myProject tabs
```

More info on this can be found on the Ionic [Getting Started](http://ionicframework.com/getting-started) page and the [Ionic CLI](https://github.com/driftyco/ionic-cli) repo.

## Issues
Issues have been disabled on this repo, if you do find an issue or have a question consider posting it on the [Ionic Forum](http://forum.ionicframework.com/).  Or else if there is truly an error, follow our guidelines for [submitting an issue](http://ionicframework.com/submit-issue/) to the main Ionic repository.




## Certificates for Push Notifications
1. Super simple using Android and Firebase
2. iOS is more complicated. Make sure to follow: https://docs.ionic.io/services/profiles/#ios-push-certificate


## Binary deploys to App Store and Play Store
Binary Update: When your app is updated through the app store. Binary Updates are still necessary for binary changes such as changing your Cordova platform version or adding a Cordova plugin or native library.

See for more: https://docs.ionic.io/services/deploy/

## Testing the app

1. Click this link: https://play.google.com/apps/testing/com.onpoint.onpoint
2. (sign in with personal credentials if necessary)
3. Click "BECOME A TESTER"
4. You will be presented with instructions. Click the link to go to app in Play Store.

Use Ionic View for iOS.


## Uploading to Play Store
To generate a new .jks key:
```
keytool -genkey -v -keystore /Users/dmitri/.android/google-play-app-signing.jks -alias GooglePlayAppSigningKey -keyalg RSA -keysize 2048 -validity 10000
```
See: https://docs.ionic.io/services/profiles/#android-app-keystore

or if you're using Android Studio: https://developer.android.com/studio/publish/app-signing.html


### Releasing a single APK
Make sure to release a single APK: http://stackoverflow.com/questions/32535551/building-combined-armv7-x86-apk-after-crosswalk-integration-in-an-ionic-project

### Setting version codes in config.xml
For Android:
```
versionCode = MAJOR * 10000 + MINOR * 100 + PATCH
```
(https://cordova.apache.org/docs/en/latest/guide/platforms/android/index.html#setting-the-version-code)

For iOS: major.minor.patch
(https://developer.apple.com/library/content/documentation/General/Reference/InfoPlistKeyReference/Articles/CoreFoundationKeys.html#//apple_ref/doc/uid/20001431-102364)

Then cordova build --release android


### Deep instructions
Instructions: http://ionicframework.com/docs/guide/publishing.html

cordova plugin rm cordova-plugin-console

cordova build --release android

jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /Users/dmitri/.android/release.jks platforms/android/build/outputs/apk/android-release-unsigned.apk DSAndroidKey


/Applications/adt-bundle-mac-x86_64-20140702/sdk/build-tools/25.0.0/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk OnPoint.apk


## Logging in android
Run ./logandroid.sh


## Installing packages
```
ionic plugin list
ionic plugin add cordova-plugin-camera@2.4.1 --save
ionic platform add ios@4.3.1 --save
ionic platform add android@6.1.0 --save
```
