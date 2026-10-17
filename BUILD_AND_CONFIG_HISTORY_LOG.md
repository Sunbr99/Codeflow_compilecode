# 📋 บันทึกประวัติการตั้งค่าและแก้ไขระบบ (Build & Configuration Audit Log)
**โครงการ:** MW CodeFlow Cyber Decompiler & Security Visualizer  
**วันที่บันทึก:** 17 ตุลาคม 2026  
**เวอร์ชันระบบ:** 2.4.0 (MW Cyber Edition)  
**สภาพแวดล้อมรองรับ:** Local PC (Windows/Mac/Linux), Android Termux (ARM64), GitHub Actions CI/CD, Android PWA

---

## 📌 สรุปรายการการตั้งค่าและแก้ไขทั้งหมด (Changelog Summary)

### 1. การปรับปรุงระบบส่งออกและดาวน์โหลดไฟล์ ZIP (ZIP Export Suite)
* **ไฟล์ที่เกี่ยวข้อง:** `server.ts`, `.gitignore`, `src/utils/exportZip.ts`
* **รายละเอียดการตั้งค่า:**
  - เพิ่มเงื่อนไขคัดแยกไฟล์นามสกุล `.zip` ในฟังก์ชัน `addDirectoryToZip` ใน `server.ts` เพื่อป้องกันการบีบอัดไฟล์ ZIP ซ้อนทับตัวเอง
  - เพิ่ม `*.zip` ลงใน `.gitignore` เพื่อไม่ให้ไฟล์ไบนารีขนาดใหญ่เข้าไปในประวัติ Git
  - อัปเดตการสร้างไฟล์ `public/codeflow-decompiler-app.zip` ให้มีทรัพยากรภาพ โลโก้ และสคริปต์รุ่นล่าสุดเสมอ

---

### 2. การแก้ปัญหา esbuild บน Termux (`outdir` & `ELF binary error`)
* **ไฟล์ที่เกี่ยวข้อง:** `package.json`, `build_apk_capacitor.sh`
* **ปัญหาเดิม:** 
  - `esbuild` บน Node.js v26 / Termux ARM64 แจ้งเตือน: `Must use "outdir" when there are multiple input files` และ `Unexpected "\x7f" ELF`
* **การแก้ไข:**
  - ปรับคำสั่งใน `package.json` จากเดิม `--outfile=dist/server.cjs` เป็น `--outdir=dist` และ `"start": "node dist/server.js"`
  - เพิ่มสคริปต์ `"build:web": "vite build"` สำหรับคอมไพล์เฉพาะไฟล์หน้าบ้านสำหรับใส่ใน APK โดยไม่ต้องเรียก esbuild
  - ปรับปรุง `build_apk_capacitor.sh` ให้เรียก `npx vite build` โดยตรง เพื่อให้การสร้าง APK ข้ามขั้นตอน Node.js Backend

---

### 3. การตั้งค่าระบบ Android Termux (Java 21, SDK 34, AAPT2)
* **ไฟล์ที่เกี่ยวข้อง:** `build_apk_capacitor.sh`, `TERMUX_ANDROID_GUIDE.md`
* **ปัญหาเดิม:** 
  - การพยายามตั้งค่า `daemonAapt2Executable` ใน `android/app/build.gradle` ทำให้ Gradle 8.11 แจ้งเตือน: `Could not set unknown property 'daemonAapt2Executable'`
* **การแก้ไข:**
  - สคริปต์ตรวจจับ `java` อัตโนมัติ (รองรับ OpenJDK 21)
  - กำหนดค่า `compileSdkVersion = 34` และ `targetSdkVersion = 34`
  - ย้ายการตั้งค่า `aapt2` สำหรับชิป ARM64 ของ Termux ไปไว้ใน `android/gradle.properties`:
    ```properties
    android.aapt2.override=/data/data/com.termux/files/usr/bin/aapt2
    ```
  - ทำความสะอาดคำสั่งเก่าออกจาก `android/app/build.gradle` อัตโนมัติ

---

### 4. การตั้งค่าอัตลักษณ์แบรนด์และธีม (MW CodeFlow Branding)
* **ไฟล์ที่เกี่ยวข้อง:** `capacitor.config.json`, `public/manifest.webmanifest`, `public/manifest.json`, `index.html`
* **รายละเอียดการตั้งค่า:**
  - **`capacitor.config.json`:**
    ```json
    {
      "appId": "com.mw.codeflow.cyber",
      "appName": "MW CodeFlow",
      "webDir": "dist",
      "android": {
        "backgroundColor": "#050814"
      }
    }
    ```
  - ตั้งค่าพื้นหลัง `#050814` (Deep Cyber Black) เพื่อป้องกัน White Flash ตอนเปิดแอป
  - อัปเดตไอคอน MW Cyber (`mw-logo.jpg`, `mw-app-icon.jpg`, `icon.svg`, `pwa-512x512.png`) เข้าสู่ Resources ของ Android และ PWA

---

### 5. การสร้างและแก้ไข GitHub Actions Workflow (`android-build.yml`)
* **ไฟล์ที่เกี่ยวข้อง:** `.github/workflows/android-build.yml`, `package-lock.json`
* **ปัญหาที่ 1:** 
  - `actions/setup-node@v4` แจ้งเตือน `Dependencies lock file is not found` เพราะติดคำสั่ง `cache: 'npm'`
  - **การแก้:** ตัด `cache: 'npm'` ออก และสร้างไฟล์ `package-lock.json` เข้าสู่คลังโค้ด
* **ปัญหาที่ 2:**
  - `android-actions/setup-android@v3` แจ้งเตือน `Warning: Failed to find package 'tools'`
  - **การแก้:** ตัดปลั๊กอินเก่าออก และสลับไปใช้ Android SDK 34 ที่ติดตั้งมาพร้อมกับเครื่องเซิร์ฟเวอร์ `ubuntu-latest` ของ GitHub Actions โดยตรง พร้อมสั่งตอบรับ License อัตโนมัติผ่าน `$ANDROID_HOME`
* **ผลลัพธ์:**
  - GitHub Actions สามารถรันการตรวจสอบ Lint, Build Web, และคอมไพล์ APK อัตโนมัติ
  - อัปโหลดไฟล์ติดตั้ง APK ไปไว้ในแท็บ **Actions > Artifacts** ภายใต้ชื่อ **`MW-CodeFlow-Cyber-debug-apk`** (เก็บไว้ 30 วัน)

---

### 6. ประวัติ Git Commits สำคัญ
1. `feat: complete CodeFlow MW Cyber suite with Android PWA and Termux support`
2. `chore: ensure export-project-zip excludes recursive archives and update gitignore`
3. `fix(build): resolve esbuild outdir error on Termux and use build:web for Capacitor`
4. `feat(branding): configure MW CodeFlow app title and dark cyber theme colors`
5. `fix(gradle): migrate aapt2 override to gradle.properties for AGP 8 compatibility`
6. `ci: replace build-apk.yml with android-build.yml workflow`
7. `fix(ci): remove cache npm requirement and include package-lock.json`
8. `ci: use GitHub runner pre-installed Android SDK to eliminate sdkmanager tools error`

---
*เอกสารนี้ถูกสร้างและจัดเก็บไว้ในโปรเจกต์เพื่อให้คุณและทีมงานใช้อ้างอิงการตั้งค่าทั้งหมดได้ตลอดเวลา*
