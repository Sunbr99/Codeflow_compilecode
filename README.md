# CodeFlow Decompiler & Logic Visualizer 🛡️⚡

> **วิเคราะห์การทำงานของ script source code ทีละบรรทัด จำลองสเต็ปการประมวลผล ตรวจสอบค่าตัวแปร แกะโค้ด Obfuscated พร้อมระบบตรวจสอบความปลอดภัยทั้งชุด (Batch Security Audit) และ Syntax-Aware Diff Highlighting**

[![Build Android APK](https://github.com/your-username/codeflow-decompiler/actions/workflows/build-apk.yml/badge.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1-38bdf8.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## ✨ คุณสมบัติเด่น (Key Features)

### 1. 🔍 Syntax-Aware Decompiled Diff Highlighting
- เปรียบเทียบโค้ดต้นฉบับกับโค้ดที่ผ่านการแกะ (Decompiled Code) บรรทัดต่อบรรทัด
- ไฮไลต์โค้ดตามประเภท Syntax พร้อมแสดงสถานะการเปลี่ยนแปลง:
  - 🟢 **Added (เพิ่มใหม่)**
  - 🔴 **Removed (ตัดทิ้ง / Obfuscation Cleaned)**
  - 🟡 **Modified (ปรับปรุงโครงสร้างโค้ด)**
- รองรับทั้งโหมด **Side-by-Side (เคียงข้าง)** และ **Unified Diff (รวมสาย)**
- มีตัวกรองดูเฉพาะบรรทัดที่มีการเปลี่ยนแปลง (Show Only Changed Lines) และระบบค้นหาแบบ Real-time
- สามารถคัดลอกและดาวน์โหลดไฟล์ `.diff` patch มาตรฐานได้ทันที

### 2. 📦 Collective Batch Security Audit (ตรวจความปลอดภัยทั้งชุด)
- อัปโหลดทั้งโฟลเดอร์ (Folder Upload) หรือไฟล์ ZIP หรือเลือกหลายไฟล์พร้อมกัน
- รองรับการวิเคราะห์ช่องโหว่ความปลอดภัยเปรียบเทียบทุกสคริปต์ในชุด:
  - **Comparative Vulnerability Matrix**: ตารางสรุปความเสี่ยงและประเภทช่องโหว่ของแต่ละไฟล์
  - **Cross-Script Attack Surface Chains**: แผนผังวิเคราะห์การเชื่อมโยงความเสี่ยงข้ามไฟล์
  - **Security Deep Dive**: ตรวจสอบรายละเอียดบรรทัดที่มีช่องโหว่ คำแนะนำวิธีแก้ไข (Remediation)
  - **Export Collective Reports**: ส่งออกรายงานสรุปความปลอดภัยได้ทั้งรูปแบบ Markdown (.md), JSON และ CSV
  - มีชุดทดสอบตัวอย่าง (Sample Packs) ให้ทดลองรันได้ทันทีโดยไม่ต้องอัปโหลดไฟล์จริง

### 3. 🎬 Interactive Execution Simulator & Flow Diagram
- จำลองการรันทีละสเต็ป (Step-by-Step Execution Simulator)
- แสดงค่าตัวแปร (Variables Inspector), Console Output, และ Call Stack
- แผนภาพ Logic Flow Diagram แบบ Interactive ปรับขนาดและส่งออกได้

### 4. 📱 Full Android Support (Termux & Capacitor APK)
- รองรับการรันเซิร์ฟเวอร์แบบ Native ในมือถือผ่าน **Termux** ด้วย One-Click Script
- มี **Termux Diagnostics & Error Doctor** ในตัว ช่วยตรวจหาปัญหาและสร้างคำสั่งแก้ไขอัตโนมัติ
- รองรับการแปลงเป็น **Android APK** ผ่าน Capacitor พร้อม GitHub Actions CI/CD workflow

---

## 🚀 วิธีการติดตั้งและรันบนเครื่องคอมพิวเตอร์ (Local Setup)

### ข้อกำหนดเบื้องต้น (Prerequisites):
- [Node.js](https://nodejs.org) (v18 หรือใหม่กว่า)
- [npm](https://npmjs.com) หรือ [bun](https://bun.sh)

### ขั้นตอนการรัน:
1. โคลนคลังโค้ดนี้:
   ```bash
   git clone https://github.com/your-username/codeflow-decompiler.git
   cd codeflow-decompiler
   ```
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. (ทางเลือก) ตั้งค่า Gemini API Key:
   ```bash
   cp .env.example .env
   ```
   *หากไม่ระบุ API Key ระบบจะใช้ Local Static Analysis และ Preset Engine ทำงานได้ 100%*
4. เริ่มต้นเซิร์ฟเวอร์สำหรับการพัฒนา:
   ```bash
   npm run dev
   ```
5. เปิดเบราว์เซอร์ไปที่: **http://localhost:3000**

---

## 📱 วิธีการรันบน Android ผ่าน Termux

1. เปิดแอป **Termux** ในโทรศัพท์
2. ติดตั้งและเริ่มระบบอัตโนมัติ:
   ```bash
   bash termux_install.sh
   bash termux_start.sh
   ```
3. ดูคู่มืออย่างละเอียดใน [TERMUX_ANDROID_GUIDE.md](./TERMUX_ANDROID_GUIDE.md)

---

## 🤖 วิธีการ Build ไฟล์ APK บน Android (Capacitor)

1. รันสคริปต์ Build อัตโนมัติ:
   ```bash
   bash build_apk_capacitor.sh
   ```
2. หรือใช้ GitHub Actions อัตโนมัติผ่านไฟล์ `.github/workflows/build-apk.yml`
3. ดูคู่มือฉบับสมบูรณ์ใน [BUILD_APK_GUIDE.md](./BUILD_APK_GUIDE.md)

---

## 📤 วิธี Push โค้ดขึ้น GitHub

หากคุณต้องการนำโปรเจกต์นี้ขึ้น GitHub Repository ของคุณเอง:

```bash
# 1. เพิ่ม Remote URL ของ Repository ของคุณ
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY>.git

# 2. ตั้งชื่อกิ่งเป็น main
git branch -M main

# 3. Push โค้ดขึ้น GitHub
git push -u origin main
```
