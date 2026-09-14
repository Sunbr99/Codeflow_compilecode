# คู่มือการติดตั้งและใช้งาน CodeFlow Decompiler บน Android (Termux & PWA)

คุณสามารถนำโปรแกรม **CodeFlow Decompiler & Logic Visualizer** ไปใช้งานบนโทรศัพท์หรือแท็บเล็ต Android ได้ **2 วิธีหลัก** ตามความสะดวกของคุณ:

---

## วิธีที่ 1: ติดตั้งเป็นแอป Android ทันที (PWA - ไม่ต้องใช้ Termux ไม่ต้องพิมพ์โค้ด) ⭐ แนะนำสำหรับผู้ใช้ทั่วไป

ระบบของโปรแกรมนี้รองรับ **Progressive Web App (PWA)** เต็มรูปแบบ ซึ่ง Android จะสร้างตัวแอปพลิเคชันที่มีไอคอนบนหน้าจอหลัก (Home Screen / App Drawer) และทำงานแบบ Standalone เหมือนแอปทั่วไป

### ขั้นตอน:
1. เปิดลิงก์ของโปรแกรมบนเบราว์เซอร์ **Google Chrome**, **Samsung Internet**, **Brave** หรือ **Edge** บนมือถือ Android ของคุณ
2. คุณจะเห็นปุ่ม **"ติดตั้งลงเครื่อง Android"** (Install App) บนแถบเมนูของแอป หรือ:
   - แตะที่จุด 3 จุด (⋮) มุมขวาบนของเบราว์เซอร์
   - เลือก **"ติดตั้งแอปพลิเคชัน"** (Install App) หรือ **"เพิ่มลงในหน้าจอหลัก"** (Add to Home screen)
3. กดยืนยัน **"ติดตั้ง" (Install)**
4. ระบบ Android จะสร้างไอคอน **CodeFlow** ลงในหน้าจอหลักของโทรศัพท์ สามารถเปิดใช้งานแบบเต็มหน้าจอ (Standalone) ได้ทันที

---

## วิธีที่ 2: รันและ Build ผ่าน Termux บน Android (สำหรับสาย Dev / ออฟไลน์ 100%)

วิธีนี้เหมาะสำหรับการรันเซิร์ฟเวอร์แบบ Local บน Android โดยไม่ต้องต่ออินเทอร์เน็ต และสามารถแก้ไขโค้ดได้โดยตรง

### สิ่งที่ต้องเตรียม:
- ติดตั้ง **Termux** จาก **F-Droid** (แนะนำ เพราะเวอร์ชันบน Google Play Store หยุดอัปเดตแล้ว): [ดาวน์โหลด Termux บน F-Droid](https://f-droid.org/en/packages/com.termux/)

### ขั้นตอนการติดตั้งและรัน:
1. แตกไฟล์ ZIP `codeflow-decompiler-app.zip` ลงในหน่วยความจำเครื่อง หรือในโฟลเดอร์ `Download`
2. เปิดแอป **Termux**
3. อนุญาตให้ Termux เข้าถึงไฟล์ในเครื่อง (หากยังไม่ได้ทำ):
   ```bash
   termux-setup-storage
   ```
4. ย้ายเข้าไปที่โฟลเดอร์ของโปรแกรม (ตัวอย่างเช่น อยู่ใน Download):
   ```bash
   cd ~/storage/downloads/codeflow-decompiler-app
   ```
   *(หรือแตกไฟล์ ZIP ใน Home directory ของ Termux โดยตรง)*
5. รันสคริปต์ติดตั้งอัตโนมัติ (ติดตั้ง Node.js LTS, Git และ Dependencies พร้อม Build):
   ```bash
   bash termux_install.sh
   ```
6. เมื่อติดตั้งเสร็จ ให้เริ่มรันโปรแกรม:
   ```bash
   bash termux_start.sh
   ```
7. ระบบจะเปิดเบราว์เซอร์ขึ้นมาที่ **http://localhost:3000** ให้คุณใช้งานได้ทันที!

---

### การสร้างทางลัด Widget แตะครั้งเดียวเปิดแอป (Termux:Widget)
หากต้องการให้แตะไอคอนบนหน้าจอมือถือแล้วเปิดเซิร์ฟเวอร์อัตโนมัติ:
1. ติดตั้งแอปเสริม **Termux:Widget** จาก F-Droid
2. ใน Termux รันคำสั่ง:
   ```bash
   mkdir -p ~/.shortcuts
   ln -s ~/storage/downloads/codeflow-decompiler-app/termux_start.sh ~/.shortcuts/CodeFlow
   ```
3. เพิ่ม Widget ของ Termux ไว้ที่หน้าจอหลัก เมื่อแตะจะเปิดเซิร์ฟเวอร์ขึ้นมาทันที!
