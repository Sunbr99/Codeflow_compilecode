#!/usr/bin/env bash
# ==============================================================================
# CodeFlow Decompiler - Automated APK Build Script (Capacitor)
# ==============================================================================
set -e

echo ""
echo "================================================================"
echo " 📦 CodeFlow: สคริปต์คอมไพล์ไฟล์ Android APK (.apk)"
echo "================================================================"
echo ""

# 1. Check Node.js and npm
echo "🔍 [1/5] ตรวจสอบสภาพแวดล้อม Node.js..."
node -v
npm -v

# 2. Build Web Application
echo ""
echo "🔨 [2/5] Build Web Bundle (HTML / CSS / JS)..."
npm run build

# 3. Install Capacitor Core & CLI if not present
echo ""
echo "📥 [3/5] ตรวจสอบและติดตั้ง Capacitor CLI..."
if [ ! -d "node_modules/@capacitor/core" ]; then
  npm install --save @capacitor/core @capacitor/android
  npm install --save-dev @capacitor/cli
fi

# 4. Initialize Android Platform
echo ""
echo "📱 [4/5] สร้างและซิงค์โปรเจกต์ Android..."
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

# 5. Build APK via Gradle
echo ""
echo "⚙️ [5/5] กำลังคอมไพล์ไฟล์ APK ด้วย Gradle..."
if [ -d "android" ]; then
  cd android
  if [ -f "gradlew" ]; then
    chmod +x gradlew
    ./gradlew assembleDebug
    echo ""
    echo "================================================================"
    echo " 🎉 สร้างไฟล์ APK สำเร็จเรียบร้อยแล้ว!"
    echo "================================================================"
    echo "📍 ไฟล์ APK ของคุณอยู่ที่:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo "================================================================"
  else
    echo "ℹ️ กรุณาเปิดโฟลเดอร์ 'android' ด้วย Android Studio เพื่อกด Build > Build APK"
  fi
  cd ..
fi
