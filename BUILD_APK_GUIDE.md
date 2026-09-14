# 📦 คู่มือการ Build ไฟล์ Android APK (.apk) สำหรับ CodeFlow Decompiler

คู่มือฉบับนี้รวบรวมวิธีสร้างไฟล์ติดตั้ง Android APK แท้จริง (`.apk`) สำหรับนำไปติดตั้งลงสมาร์ตโฟนหรือแท็บเล็ต Android ได้ทุกรุ่น

---

## 🌟 ทางเลือกที่ 1: ติดตั้งเป็น Native App ทันทีผ่าน PWA (เร็วที่สุด ไม่ต้องมีคอมพิวเตอร์)
หากต้องการใช้งานเป็นแอปบนมือถือทันทีโดยไม่ต้องติดตั้ง Android SDK:
1. รันโปรแกรมบน Termux: `bash termux_start.sh`
2. เปิด Google Chrome ไปที่: `http://localhost:3000`
3. กดปุ่ม **⋮ (3 จุด)** ที่มุมขวาบนของเบราว์เซอร์
4. กดเลือก **"เพิ่มลงในหน้าจอหลัก" (Add to Home Screen)** หรือ **"ติดตั้งแอป" (Install App)**
5. คุณจะได้แอปพลิเคชันไอคอนสีน้ำเงินเข้ม สวยงาม ทำงานแบบ Standalone เต็มจอ ไม่มีแถบ URL เหมือนโหลดจาก Play Store ทันที

---

## 🛠️ ทางเลือกที่ 2: Build เป็นไฟล์ `.apk` ด้วย Capacitor (แนะนำสำหรับมีคอมพิวเตอร์)

วิธีนี้จะนำ Frontend และ Assets ทั้งหมดไปแปลงเป็น Native Android Project พร้อม Gradle:

### สิ่งที่ต้องเตรียม (Prerequisites):
* คอมพิวเตอร์ (Windows, macOS หรือ Linux)
* Node.js LTS (v18 ขึ้นไป)
* Java JDK 17 หรือ 21
* Android Studio (หรือ Android SDK Command-line Tools)

### ขั้นตอนการ Build:
1. แตกไฟล์ ZIP ของโปรเจกต์ลงในคอมพิวเตอร์
2. เปิด Terminal หรือ PowerShell ในโฟลเดอร์โปรเจกต์
3. รันคำสั่งคอมไพล์อัตโนมัติ:
   ```bash
   bash build_apk_capacitor.sh
   ```
   *หรือพิมพ์คำสั่งทีละขั้น:*
   ```bash
   # 1. Build Web Assets
   npm run build

   # 2. ติดตั้ง Capacitor
   npm install @capacitor/core @capacitor/android
   npm install -D @capacitor/cli

   # 3. สร้าง Android Native Project
   npx cap add android
   npx cap sync android

   # 4. คอมไพล์ APK ผ่าน Gradle
   cd android
   ./gradlew assembleDebug
   ```

4. **ตำแหน่งไฟล์ APK ที่ได้:**
   ```
   android/app/build/outputs/apk/debug/app-debug.apk
   ```
   คุณสามารถคัดลอกไฟล์ `app-debug.apk` นี้ไปติดตั้งบนเครื่อง Android ได้ทันที!

---

## 📱 ทางเลือกที่ 3: เปิดใน Android Studio เพื่อ Sign Release APK (สำหรับแจกจ่าย)
1. หลังจากรัน `npx cap add android` เรียบร้อยแล้ว
2. เปิดโปรแกรม **Android Studio**
3. เลือก **Open an Existing Project** ➜ เลือกโฟลเดอร์ `android` ในโปรเจกต์นี้
4. รอ Gradle ซิงค์เสร็จ จากนั้นไปที่เมนูด้านบน:
   * **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**
5. Android Studio จะขึ้นแจ้งเตือนที่มุมขวาล่างว่า **APK(s) generated successfully** พร้อมปุ่ม **locate** เพื่อเปิดโฟลเดอร์ที่เก็บไฟล์ APK

---

## ⚙️ ข้อมูล App Package Identity
* **App Name:** CodeFlow Decompiler
* **Package ID:** `com.codeflow.decompiler`
* **Supported Architecture:** ARM64-v8a, ARMEABI-v7a, x86_64
* **Min Android SDK:** Android 7.0 (API Level 24) ขึ้นไป
* **Target Android SDK:** Android 14 (API Level 34)
