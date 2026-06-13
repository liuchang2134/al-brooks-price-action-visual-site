# Al Brooks Android App

这是现有可视化学习站的 Android 包装工程，使用 Capacitor 把 `../al_brooks_visual_site` 静态资源打进 Android WebView。

## 本机状态

当前电脑已经配置便携 JDK 21 和 Android SDK 命令行工具，可以直接生成 debug APK。

已验证：

- `npm.cmd install` 成功。
- `npx.cmd cap add android` 成功。
- `../al_brooks_visual_site` 已复制到 `android/app/src/main/assets/public`，大小约 9MB。
- `npm.cmd run build:android:local` 成功生成 debug APK。
- APK 包名：`com.liuchang.albrooks`。
- App 名称：`Al Brooks 学习站`。
- minSdk：23；targetSdk：35。

## 生成 / 同步 Android 工程

```powershell
cd al_brooks_android
npm.cmd install
npm.cmd run sync
```

## 编译 Debug APK

当前电脑可直接运行：

```powershell
cd al_brooks_android
npm.cmd run build:android:local
```

生成位置通常是：

```text
al_brooks_android/android/app/build/outputs/apk/debug/app-debug.apk
```

如果在另一台电脑构建，可以安装 Android Studio，确保 JDK 和 Android SDK 可用，然后运行：

```powershell
cd al_brooks_android
npm.cmd install
npm.cmd run sync
npm.cmd run build:android
```

Android SDK 至少需要 Platform、Build-Tools 和 Platform-Tools。当前工程使用 compileSdk / targetSdk 35。

## 设计取舍

- App 默认离线加载本地站点资源，阅读器和训练功能不依赖 GitHub Pages。
- 云端保存、Supabase SDK CDN 等能力仍需要网络。
- 当前 APK 是 debug 签名，适合本机安装测试；上架或企业分发前还需要正式签名、应用图标、隐私说明和真机测试。
