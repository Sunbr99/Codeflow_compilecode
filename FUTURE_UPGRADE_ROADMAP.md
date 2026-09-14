# แผนงานการอัปเกรดระบบในอนาคต (Future System Upgrade Roadmap)
**โครงการ:** CodeFlow Decompiler & Logic Visualizer  
**แผนกลยุทธ์พัฒนา:** Version 1.1 - Version 3.0 (2026 - 2027)

เอกสารนี้รวบรวมรายการความสามารถ, สถาปัตยกรรมทางเทคนิค, และฟีเจอร์ระดับสูงที่สามารถต่อยอดและอัปเกรดให้กับระบบในอนาคต เพื่อยกระดับให้เป็นเครื่องมือวิเคราะห์และแกะโค้ดระดับแนวหน้าของนักพัฒนาและนักวิจัยความปลอดภัย

---

## ตารางแผนการอัปเกรดระบบ (System Upgrade Roadmap Matrix)

| ระยะการพัฒนา (Phase) | โมดูลที่อัปเกรด (Target Module) | ความสามารถใหม่ที่จะเพิ่มเข้ามา (Features & Enhancements) | ประโยชน์ที่จะได้รับ (Business & Tech Value) | ระดับความสำคัญ (Priority) |
|---|---|---|---|---|
| **Phase 1: Q4 2026** <br>*(Core Engine & Decompiler)* | **Multi-File Project Ingestion** | • รองรับการอัปโหลดไฟล์ ZIP ของโปรเจกต์หลายไฟล์พร้อมกัน<br>• วิเคราะห์การ `import` / `require` ข้ามโมดูล<br>• Dependency Cross-Reference Graph | วิเคราะห์โค้ดที่เป็น Package หรือ Library ทั้งโฟลเดอร์ได้ ไม่จำกัดเฉพาะไฟล์เดี่ยว | 🟢 High |
| **Phase 1: Q4 2026** <br>*(Core Engine & Decompiler)* | **WebAssembly (WASM) Disassembler** | • เพิ่มตัวถอดรหัสไฟล์ `.wasm` ออกมาเป็นรูปแบบ Wasm Text Format (`.wat`)<br>• จำลอง Stack Machine ของ WASM ทีละสเต็ป | แกะโค้ดระดับ Low-level ที่คอมไพล์จาก C/C++/Rust ลงบนเว็บได้ | 🟡 Medium |
| **Phase 1: Q4 2026** <br>*(Core Engine & Decompiler)* | **Source Map De-minifier** | • รองรับการลากไฟล์ `.map` (Source Maps) เพื่อกู้คืนชื่อตัวแปรและโครงสร้างไฟล์เดิม 100% | ถอดรหัสโค้ด Minified/Bundled ใน Web Production ได้อย่างแม่นยำสูงสุด | 🟢 High |
| **Phase 2: Q1 2027** <br>*(Debugger & Visualizer)* | **Interactive Time-Travel Debugger** | • เพิ่มความสามารถ Time-Travel Scrubber ย้อนเวลาค่าตัวแปรไป-กลับแบบ Smooth Slider<br>• Bookmark สเต็ปสำคัญ (Savepoint States) | ผู้ใช้สามารถทดลองแก้ค่าตัวแปร ณ สเต็ปใดก็ได้ แล้วดูผลลัพธ์ที่เปลี่ยนไปทันที | 🟢 High |
| **Phase 2: Q1 2027** <br>*(Debugger & Visualizer)* | **AST 3D / Interactive Call Graph** | • กราฟความสัมพันธ์ของฟังก์ชันแบบ Interactive Force-Directed Graph ด้วย D3.js<br>• ไฮไลต์เส้นทาง Execution Path ที่ถูกใช้งานบ่อย (Heatmap) | มองเห็นภาพรวมของ Architecture สคริปต์ขนาดใหญ่ได้อย่างชัดเจนในมุมมองเดียว | 🟡 Medium |
| **Phase 2: Q1 2027** <br>*(Debugger & Visualizer)* | **Binary & Hex String Unpacker** | • Tool ถอดรหัส Hex/Unicode/Octal แบบเรียลไทม์ในตัว<br>• Interactive XOR Key Brute-forcer สำหรับแกะสคริปต์ Malicious | แกะโค้ดที่มีการเข้ารหัส XOR หลายชั้นได้ในคลิกเดียว | 🟢 High |
| **Phase 3: Q2 2027** <br>*(AI & Offline Autonomy)* | **In-Browser Local LLM (WebLLM / Wasm)** | • ฝังโมเดลขนาดเล็ก (เช่น Qwen-Coder / Phi-3 Mini) ผ่าน WebGPU รันในเบราว์เซอร์<br>• ใช้งาน AI แกะโค้ดได้แบบออฟไลน์ 100% โดยไม่ต้องพึ่งพา Cloud API Key | ปลอดภัยสำหรับข้อมูลที่มีความลับสูง (Zero Network Leakage) และฟรีตลอดการใช้งาน | 🟣 Innovation |
| **Phase 3: Q2 2027** <br>*(AI & Offline Autonomy)* | **Automated Vulnerability Patching** | • AI ตรวจพบช่องโหว่ความปลอดภัย (เช่น Command Injection, ReDoS, SQLi)<br>• ปุ่ม 1-Click "สร้างโค้ดแก้ไข (Auto-Patch Proposal)" | ช่วยแก้ไขโค้ดที่อันตรายให้กลายเป็นโค้ดที่ปลอดภัยได้ทันที | 🟢 High |
| **Phase 4: Q3 2027** <br>*(Android & Ecosystem)* | **Native Android APK Package** | • คอมไพล์ด้วย Capacitor / Trusted Web Activity (TWA) เป็นไฟล์ `.apk` ติดตั้งตรงไม่ต้องผ่านเบราว์เซอร์<br>• รองรับ Android Intents (คลิกเปิดไฟล์โค้ดจาก File Manager ตรงเข้าแอปได้ทันที) | มอบประสบการณ์ Native Android App แท้ๆ ให้แก่ผู้ใช้งาน | 🟢 High |
| **Phase 4: Q3 2027** <br>*(Android & Ecosystem)* | **Termux CLI Headless Daemon** | • เครื่องมือ CLI ในชื่อ `codeflow scan <file>` ผ่าน Termux โดยตรงโดยไม่ต้องเปิด UI<br>• ส่งผลสรุปออกมาเป็น Terminal ANSI Report หรือ JSON | สาย System Admin / DevOps สามารถใช้เขียนสคริปต์ตรวจสอบความปลอดภัยในมือถือได้ | 🟡 Medium |
| **Phase 5: Q4 2027** <br>*(DevSecOps & Cloud)* | **Git Repository Deep Scanner** | • วาง URL ของ GitHub / GitLab Repository เพื่อสแกนและจัดทำ Flowchart ทั้งโปรเจกต์<br>• เปรียบเทียบ Diff ระหว่าง Commit ว่าตรรกะส่วนใดถูกปรับเปลี่ยน | ตรวจสอบการลอบใส่ Backdoor หรือ Obfuscated Commit ใน Pull Request | 🟡 Medium |
| **Phase 5: Q4 2027** <br>*(DevSecOps & Cloud)* | **CI/CD GitHub Action Extension** | • ปลั๊กอิน GitHub Action ตรวจจับการ Obfuscate โค้ดที่น่าสงสัยก่อน Merge เข้าสู่ Production | ยกระดับสู่เครื่องมือตรวจสอบความปลอดภัยระดับองค์กร | 🟡 Medium |

---

## ข้อเสนอแนะเชิงเทคนิคสำหรับการเริ่มอัปเกรดในสเต็ปถัดไป (Immediate Next Action)

1. **การรวม WebAssembly (.wasm) Parser:** สามารถใช้ไลบรารี `wabt` หรือ `wasmparser` ฝั่ง Client-side เพื่อให้รองรับไฟล์ Binary ได้ทันทีโดยไม่ต้องเปลี่ยนโครงสร้าง Backend
2. **การอัปเกรด Time-Travel Simulation Slider:** นำ State History ใน `useSimulationPlayer.ts` มาทำเป็น Memory Timeline Bar ที่ผู้ใช้สามารถเลื่อน Slider ซ้าย-ขวาได้แบบ 60fps
3. **การสร้าง Termux Shortcut Widget:** เขียนสคริปต์ `termux-widget` สั้นๆ ให้ผู้ใช้แตะไอคอนบนหน้าจอโฮมของ Android แล้ว Termux จะเปิดรัน CodeFlow และเปิดเบราว์เซอร์ให้เองโดยไม่ต้องพิมพ์คำสั่งในคอนโซล
