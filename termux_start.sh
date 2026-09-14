#!/data/data/com.termux/files/usr/bin/bash
# ==============================================================================
# CodeFlow Decompiler - Automated Termux Launcher for Android
# ==============================================================================

PORT=3000

echo ""
echo "================================================================"
echo " 🚀 กำลังเริ่มระบบ CodeFlow Decompiler บน Android..."
echo "================================================================"

# Check if production build exists
if [ -f "dist/server.cjs" ]; then
  SERVER_CMD="node dist/server.cjs"
elif [ -f "dist/index.html" ]; then
  # If Vite build succeeded, run server via tsx
  SERVER_CMD="npx tsx server.ts"
else
  echo "⚠️ ไม่พบไฟล์ Build กำลังทำการ Build โปรเจกต์ก่อน..."
  NODE_OPTIONS="--max-old-space-size=2048" npm run build || true
  if [ -f "dist/server.cjs" ]; then
    SERVER_CMD="node dist/server.cjs"
  else
    SERVER_CMD="npx tsx server.ts"
  fi
fi

echo "🌐 กำลังรันเซิร์ฟเวอร์ที่พอร์ต 3000..."
echo "📱 เซิร์ฟเวอร์จะพร้อมทำงานที่: http://localhost:3000"
echo "กด CTRL+C เพื่อหยุดการทำงานของเซิร์ฟเวอร์"
echo "----------------------------------------------------------------"

# Try opening the Android browser automatically in background
(
  sleep 2
  if command -v termux-open-url >/dev/null 2>&1; then
    termux-open-url "http://localhost:3000"
  elif command -v am >/dev/null 2>&1; then
    am start -a android.intent.action.VIEW -d "http://localhost:3000" >/dev/null 2>&1 || true
  fi
) &

# Start server
echo "⚡ กำลังเริ่มรันเซิร์ฟเวอร์ด้วยคำสั่ง: $SERVER_CMD"
$SERVER_CMD