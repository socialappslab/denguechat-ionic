# gulp production &&
# cordova build --release android &&
# jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /Users/dmitri/.android/google-play-app-signing.jks platforms/android/build/outputs/apk/android-release-unsigned.apk GooglePlayAppSigningKey &&
# /Applications/adt-bundle-mac-x86_64-20140702/sdk/build-tools/25.0.0/zipalign -v 4 platforms/android/build/outputs/apk/android-release-unsigned.apk DengueChat.apk
# # Now, go to https://play.google.com/apps/publish

# gulp production &&
# cordova build --release android &&
# jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore /Users/dmitri/.android/google-play-app-signing.jks platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk GooglePlayAppSigningKey &&
# /Applications/adt-bundle-mac-x86_64-20140702/sdk/build-tools/25.0.0/zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk DengueChat-armv7.apk

gulp production &&
cordova build --release android &&
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore resources/android/google-play-app-signing.jks platforms/android/build/outputs/apk/android-x86-release-unsigned.apk GooglePlayAppSigningKey &&
zipalign -v 4 platforms/android/build/outputs/apk/android-x86-release-unsigned.apk DengueChat-x86.apk

gulp production &&
cordova build --release android &&
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore resources/android/google-play-app-signing.jks platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk GooglePlayAppSigningKey &&
zipalign -v 4 platforms/android/build/outputs/apk/android-armv7-release-unsigned.apk DengueChat-armv7.apk
