$ErrorActionPreference = "Stop"

$toolRoot = Join-Path $env:USERPROFILE ".cache\android-build-tools"
$javaHome = Join-Path $toolRoot "jdk-21\jdk-21.0.11+10"
$androidHome = Join-Path $toolRoot "android-sdk"
$javaExe = Join-Path $javaHome "bin\java.exe"
$sdkManager = Join-Path $androidHome "cmdline-tools\latest\bin\sdkmanager.bat"

if (-not (Test-Path $javaExe)) {
  throw "JDK not found at $javaHome. Install JDK 17+ or update this script."
}

if (-not (Test-Path $sdkManager)) {
  throw "Android SDK command line tools not found at $androidHome. Install Android SDK or update this script."
}

$env:JAVA_HOME = $javaHome
$env:ANDROID_HOME = $androidHome
$env:ANDROID_SDK_ROOT = $androidHome
$env:Path = "$javaHome\bin;$androidHome\cmdline-tools\latest\bin;$androidHome\platform-tools;$env:Path"

$localProperties = Join-Path $PSScriptRoot "android\local.properties"
$sdkForProperties = $androidHome -replace "\\", "/"
Set-Content -Encoding ASCII -Path $localProperties -Value "sdk.dir=$sdkForProperties"

npm.cmd run sync

Push-Location (Join-Path $PSScriptRoot "android")
try {
  .\gradlew.bat assembleDebug
}
finally {
  Pop-Location
}

$apkPath = Join-Path $PSScriptRoot "android\app\build\outputs\apk\debug\app-debug.apk"
Write-Host "Debug APK generated: $apkPath"
