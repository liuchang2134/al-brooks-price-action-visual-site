# Al Brooks Android App

这是现有可视化学习站的 Android 包装工程，使用 Capacitor 把 `../al_brooks_visual_site` 静态资源打进 Android WebView。

## 本机状态

当前电脑缺少 Java JDK、Gradle 和 Android SDK，所以这里可以生成 Android 工程，但不能在本机直接编译 APK。

已验证：

- `npm.cmd install` 成功。
- `npx.cmd cap add android` 成功。
- `../al_brooks_visual_site` 已复制到 `android/app/src/main/assets/public`，大小约 9MB。
- `npm.cmd run build:android` 已触达 Gradle wrapper，但因缺少 `JAVA_HOME` / `java` 停止。

## 生成 / 同步 Android 工程

```powershell
cd al_brooks_android
npm.cmd install
npm.cmd run sync
```

## 编译 Debug APK

安装 Android Studio 后，确保 JDK 和 Android SDK 可用，然后运行：

```powershell
cd al_brooks_android
npm.cmd run build:android
```

生成位置通常是：

```text
al_brooks_android/android/app/build/outputs/apk/debug/app-debug.apk
```

如果只安装便携 JDK，需要先在 PowerShell 设置类似：

```powershell
$env:JAVA_HOME="C:\Path\To\jdk"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
java -version
```

Android SDK 仍建议通过 Android Studio 安装，至少需要 Android SDK Platform、Build-Tools 和 Platform-Tools。

## 设计取舍

- App 默认离线加载本地站点资源，阅读器和训练功能不依赖 GitHub Pages。
- 云端保存、Supabase SDK CDN 等能力仍需要网络。
- 这是第一版可行性原型；上架或企业分发前还需要应用图标、签名、隐私说明和真机测试。
