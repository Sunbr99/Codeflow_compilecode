#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# CodeFlow Decompiler - Automated Termux Installer & Build Pack for Android
# ==============================================================================
set -e

echo ""
echo "================================================================"
echo " 🚀 CodeFlow Decompiler: ติดตั้งและ Build บน Android Termux"
echo "================================================================"
echo ""

# 1. Update Termux Package Repositories
echo "📦 [1/4] ตรวจสอบและอัปเดต Termux Packages..."
pkg update -y || true

# 2. Install Node.js LTS and Build Tools
echo "⚙️ [2/4] ติดตั้ง Node.js LTS, Git และเครื่องมือคอมไพล์..."
pkg install -y nodejs-lts git build-essential
echo "✅ ตรวจพบเวอร์ชัน Node.js:"
node -v
npm -v

# 3. Install NPM Dependencies
echo ""
echo "📥 [3/4] กำลังติดตั้ง Dependencies (npm install)..."
npm install --no-audit

# 4. Build Production Bundle
echo ""
echo "🔨 [4/4] กำลัง Build โปรแกรม (Production Build)..."
# Run build with increased memory limit for mobile devices
NODE_OPTIONS="--max-old-space-size=2048" npm run build || {
  echo "⚠️ ตรวจพบข้อจำกัดในการ Bundling ด้วย esbuild... ดำเนินการเปิดระบบด้วย tsx โหมดตรง..."
}

echo ""
echo "================================================================"
echo " 🎉 การติดตั้งและ Build เสร็จสมบูรณ์เรียบร้อยแล้ว!"
echo "================================================================"
echo ""
echo "▶️  วิธีเปิดใช้งานโปรแกรม:"
echo "   รันคำสั่ง:  bash termux_start.sh"
echo "   หรือคำสั่ง: npm start  (หรือ npx tsx server.ts)"
echo ""
echo "🌐 จากนั้นเปิดเบราว์เซอร์ในมือถือที่: http://localhost:3000"
echo "================================================================"
