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
npx vite build

# 4. Setup Capacitor Android Platform
echo ""
echo "📱 [4/6] ตั้งค่าและซิงค์ Capacitor Android..."
if [ ! -d "android" ]; then
  npx cap add android
fi
npx cap sync android

# Update Android Launcher Icons with the new Cyber Emblem
echo "🎨 กำลังติดตั้งไอคอนแอพพลิเคชัน CodeFlow Cyber ลงในโฟลเดอร์ mipmap ของ Android..."
for res_dir in android/app/src/main/res/mipmap-*; do
  if [ -d "$res_dir" ]; then
    cp public/pwa-512x512.png "$res_dir/ic_launcher.png" 2>/dev/null || true
    cp public/pwa-512x512.png "$res_dir/ic_launcher_round.png" 2>/dev/null || true
    cp public/pwa-512x512.png "$res_dir/ic_launcher_foreground.png" 2>/dev/null || true
  fi
done

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

# Clean up any legacy daemonAapt2Executable from app/build.gradle (removed in AGP 8+)
if [ -f "android/app/build.gradle" ]; then
  sed -i '/daemonAapt2Executable/d' android/app/build.gradle 2>/dev/null || true
fi

# Configure modern AGP 8 AAPT2 override via gradle.properties if native Termux aapt2 exists
if [ -f "android/gradle.properties" ]; then
  if [ -f "/data/data/com.termux/files/usr/bin/aapt2" ]; then
    if ! grep -q "android.aapt2.override" android/gradle.properties; then
      echo "" >> android/gradle.properties
      echo "# Native AAPT2 binary for Termux ARM64" >> android/gradle.properties
      echo "android.aapt2.override=/data/data/com.termux/files/usr/bin/aapt2" >> android/gradle.properties
    fi
  fi
fi

# 6. Build APK via Gradle
echo ""
echo "⚙️ [6/6] กำลังคอมไพล์ไฟล์ APK ด้วย Gradle..."
if [ -d "android" ]; then
  cd android
  if [ -f "gradlew" ]; then
    chmod +x gradlew
    if ! command -v java >/dev/null 2>&1; then
      echo "⚠️ ไม่พบ Java (JDK) ในระบบ กรุณาติดตั้งด้วยคำสั่ง: pkg install openjdk-21 -y"
      echo "   หรือหากต้องการใช้แอปทันที สามารถเปิดเบราว์เซอร์แล้วกด 'ติดตั้งแอป' (PWA) ได้เลยครับ"
      exit 1
    fi
    ./gradlew --stop 2>/dev/null || true
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
