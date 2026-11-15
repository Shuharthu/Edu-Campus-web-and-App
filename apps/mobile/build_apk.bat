@echo off
set GRADLE_USER_HOME=D:\tools\.gradle
set TEMP=D:\tools\temp
set TMP=D:\tools\temp
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set ANDROID_HOME=C:\Users\UESR\AppData\Local\Android\Sdk
set PATH=D:\tools\flutter\bin;C:\Program Files\Android\Android Studio\jbr\bin;%PATH%

cd /d "d:\Shuharthu_Tapash_Barua_Portfolio (1)\Smart Edu App\apps\mobile"
call "D:\tools\flutter\bin\flutter.bat" build apk --release

if exist "build\app\outputs\flutter-apk\app-release.apk" (
    if not exist "..\..\release" mkdir "..\..\release"
    copy /y "build\app\outputs\flutter-apk\app-release.apk" "..\..\release\smart-edu-v0.1.0.apk"
    echo APK successfully copied to release\smart-edu-v0.1.0.apk
)
