#!/usr/bin/env bash
# ==============================================================================
# CodeFlow Decompiler - Automated Setup & APK Build Script (Termux / Android)
# ==============================================================================
set -e

echo ""
echo "================================================================"
echo " 🚀 CodeFlow: เริ่มต้นกระบวนการตั้งค่าและสร้าง APK อัตโนมัติ"
echo "================================================================"
echo ""

# 1. Check Node.js and npm
echo "🔍 [1/6] ตรวจสอบสภาพแวดล้อม Node.js และ npm..."
node -v
npm -v

# 2. Clean stale node_modules and cache if needed
echo ""
echo "🧹 [2/6] เคลียร์แคชและติดตั้ง Dependencies ทั้งหมด..."
rm -rf node_modules/.vite
npm install --legacy-peer-deps --ignore-scripts=false

# 3. Build Web Application
echo ""
echo "🔨 [3/6] Build Web Bundle (Vite + React)..."
npm run build

# 4. Setup Capacitor Android Platform
echo ""
echo "📱 [4/6] ตั้งค่าและซิงค์ Capacitor Android..."
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

# 5. Fix Android SDK version in variables.gradle (SDK 34) & AAPT2 for Termux
echo ""
echo "⚙️ [5/6] ปรับแต่ง SDK Version เป็น 34 และตั้งค่า AAPT2 สำหรับ Termux..."
if [ -f "android/variables.gradle" ]; then
  sed -i 's/compileSdkVersion = 36/compileSdkVersion = 34/g' android/variables.gradle
  sed -i 's/targetSdkVersion = 36/targetSdkVersion = 34/g' android/variables.gradle
  echo "✅ ตั้งค่า compileSdkVersion และ targetSdkVersion เป็น 34 เรียบร้อย"
else
  echo "⚠️ ไม่พบไฟล์ android/variables.gradle"
fi

# Inject aapt2 fix for ARM64 Termux into app/build.gradle if not already present
if [ -f "android/app/build.gradle" ]; then
  if ! grep -q "daemonAapt2Executable" android/app/build.gradle; then
    echo "Adding aapt2 override for ARM64 in app/build.gradle..."
    cat << 'EOT' >> android/app/build.gradle

android {
    aaptOptions {
        if (System.getenv("ANDROID_HOME") != null) {
            def aapt2Path = file("${System.getenv("ANDROID_HOME")}/build-tools/34.0.0/aapt2")
            if (!aapt2Path.exists()) {
                aapt2Path = file("${System.getenv("ANDROID_HOME")}/build-tools/35.0.0/aapt2")
            }
            if (aapt2Path.exists()) {
                daemonAapt2Executable = aapt2Path.absolutePath
            }
        }
    }
}
EOT
  fi
fi

# 6. Build APK via Gradle
echo ""
echo "⚙️ [6/6] กำลังคอมไพล์ไฟล์ APK ด้วย Gradle..."
if [ -d "android" ]; then
  cd android
  if [ -f "gradlew" ]; then
    chmod +x gradlew
    ./gradlew --stop
    ./gradlew clean
    ./gradlew assembleDebug
    echo ""
    echo "================================================================"
    echo " 🎉 สร้างไฟล์ APK สำเร็จเรียบร้อยแล้ว!"
    echo "================================================================"
    echo "📍 ไฟล์ APK ของคุณอยู่ที่:"
    echo "   android/app/build/outputs/apk/debug/app-debug.apk"
    echo "================================================================"
  else
    echo "❌ ไม่พบไฟล์ gradlew ในโฟลเดอร์ android"
  fi
  cd ..
else
  echo "❌ ไม่พบโฟลเดอร์ android"
fi
