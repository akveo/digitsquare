This Cordova plugin is to add Google Ads SDK to cordova project, as depency of other plugins.

# How to use? #

Write dependency entry in plugin.xml of other plugins:

```xml
	<dependency id="com.google.admobsdk"/>
```

Or, add it by hand:

    cordova plugin add com.google.admobsdk
    
# Version #

* Google Play Services, r19 (depends on plugin: com.google.playservices)
* Google AdMob SDK for iOS, v6.12.2
* Google AdMob SDK for WP8, v6.5.13

# ProGuard #

If you plan to run ProGuard on your APK before releasing your app, you will need to add the following to your proguard.cfg file:
```
-keep class * extends java.util.ListResourceBundle {
    protected Object[][] getContents();
}

-keep public class com.google.android.gms.common.internal.safeparcel.SafeParcelable {
    public static final *** NULL;
}

-keepnames @com.google.android.gms.common.annotation.KeepName class *
-keepclassmembernames class * {
    @com.google.android.gms.common.annotation.KeepName *;
}

-keepnames class * implements android.os.Parcelable {
    public static final ** CREATOR;
}
```