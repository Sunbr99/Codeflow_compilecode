import { AnalysisResult } from '../types';

export const PRESET_ANALYSES: Record<string, AnalysisResult> = {
  'js-obfuscated-string-array': {
    languageDetected: 'JavaScript (ES5 Obfuscated)',
    scriptSummary: 'สคริปต์ JavaScript ที่ถูก Obfuscate ด้วยเทคนิค String Array & Hex Encoded Literal พร้อมฟังก์ชันหมุนตำแหน่ง Array (Array Shifter) เพื่อพราง Endpoint URL ลับ และ Token ยืนยันสิทธิ์',
    obfuscationPatternsFound: [
      'Hex-encoded ASCII string escapes (\\x68\\x74...)',
      'String Array Table (_0x34a1)',
      'Array Rotator / Shifter IIFE (_0x5c42 loop)',
      'Mangled Function Pointer / Getter (_0x21bb)',
      'Identifier Mangling (_0x1a8f, _0x3b21)',
    ],
    securityAssessment: {
      riskLevel: 'suspicious',
      notes: 'สคริปต์พยายามพราง URL ปลายทางและ Secret Token ผ่าน Hex Encoding เหมาะสำหรับการศึกษาเทคนิค De-obfuscation และ Reverse Engineering',
      suspiciousPatterns: ['Hex-encoded endpoint', 'Array rotation deobfuscation loop', 'Hidden authentication token'],
    },
    steps: [
      {
        stepIndex: 1,
        lineNumber: 12,
        codeSnippet: '(function (_0x1a8f, _0x3b21) {',
        actionTitle: 'เริ่มต้น IIFE Array Rotator',
        thaiExplanation: 'เริ่มการทำงานของ Self-Invoking Anonymous Function (IIFE) โดยส่ง Array ตารางคำ _0x34a1 และค่า Offset 0x1f4 (500) เข้ามาเป็นพารามิเตอร์',
        stepType: 'flow',
        stateMutations: [
          { variable: '_0x1a8f', newValue: 'Reference to _0x34a1 array', type: 'reference', note: 'ส่งตารางคำเข้าฟังก์ชัน' },
          { variable: '_0x3b21', newValue: '500 (0x1f4)', type: 'number', note: 'ค่าจำนวนรอบการหมุน' },
        ],
        variablesSnapshot: { _0x3b21: 500, state: 'IIFE entry' },
        consoleOutput: null,
        reverseTip: 'มักพบในเครื่องมือ obfuscator.io หน้าที่คือสลับลำดับสมาชิกใน Array เพื่อทำให้การแกะค่าด้วย Static Index ทำไม่ได้ตรงๆ',
      },
      {
        stepIndex: 2,
        lineNumber: 13,
        codeSnippet: 'var _0x5c42 = function (_0x48d1) {',
        actionTitle: 'ประกาศฟังก์ชันหมุนสลับตำแหน่ง',
        thaiExplanation: 'สร้างฟังก์ชันย่อย _0x5c42 เพื่อทำหน้าที่ลูปหมุนสมาชิกใน Array ด้วยคำสั่ง push(shift())',
        stepType: 'call',
        variablesSnapshot: { _0x5c42: '[Function: Shifter]', _0x3b21: 500 },
        consoleOutput: null,
        reverseTip: 'คำสั่ง shift() จะดึงตัวแรกออกมา และ push() จะนำไปต่อท้าย ทำให้ตำแหน่งข้อมูลหมุนวนเป็นวงกลม',
      },
      {
        stepIndex: 3,
        lineNumber: 15,
        codeSnippet: "_0x1a8f['push'](_0x1a8f['shift']());",
        actionTitle: 'หมุนตำแหน่ง Array สมาชิกตัวแรกไปไว้ท้ายสุด',
        thaiExplanation: 'ทำการสลับตำแหน่งสมาชิกใน Array หมุนวนไปข้างหน้าเพื่อคืนค่าให้ตรงกับ Index ที่ Getter function ต้องการ',
        stepType: 'loop',
        variablesSnapshot: { shiftCount: 501, arrayReady: true },
        consoleOutput: null,
        reverseTip: 'เมื่อรันจนจบลูป Array จะกลับมาอยู่ในลำดับที่ถูกต้องสำหรับการเรียกผ่าน getter function _0x21bb',
      },
      {
        stepIndex: 4,
        lineNumber: 21,
        codeSnippet: 'var _0x34a1 = [ ...hex encoded strings... ];',
        actionTitle: 'โหลด String Array ตารางคำ Hex',
        thaiExplanation: 'จองตัวแปร _0x34a1 เพื่อเก็บตารางข้อความที่เข้ารหัสด้วยเลขฐาน 16 (Hex escapes เช่น \\x68\\x74 คือ "ht")',
        stepType: 'variable',
        stateMutations: [
          { variable: '_0x34a1', newValue: 'Array(6) [hex strings]', type: 'array', note: 'เก็บข้อความเข้ารหัส' },
        ],
        variablesSnapshot: {
          '_0x34a1[0]': 'https://api.example.com/v1/auth',
          '_0x34a1[1]': 'POST',
          '_0x34a1[2]': 'api_key',
          '_0x34a1[3]': 'secret_token_9988',
        },
        consoleOutput: null,
        reverseTip: 'สังเกต \\x68\\x74\\x74\\x70\\x73 แปลงเป็น ASCII คือ "https". สามารถใช้ Decoded Symbols Table ด้านล่างเพื่อดูค่าจริงได้ทันที',
      },
      {
        stepIndex: 5,
        lineNumber: 30,
        codeSnippet: 'function _0x21bb(_0x5472) { return _0x34a1[_0x5472]; }',
        actionTitle: 'ประกาศฟังก์ชัน Getter สำหรับดึงข้อความ',
        thaiExplanation: 'สร้างฟังก์ชัน _0x21bb เพื่อเป็นตัวกลางในการ Lookup ข้อมูลจากตาราง _0x34a1 ตามดัชนี (Index)',
        stepType: 'call',
        variablesSnapshot: { _0x21bb: '[Function: Getter]' },
        consoleOutput: null,
        reverseTip: 'ฟังก์ชันนี้เปรียบเสมือน Dictionary Lookup เพื่อป้องกันไม่ให้คำสั่งหลักมองเห็นสตริงโดยตรง',
      },
      {
        stepIndex: 6,
        lineNumber: 34,
        codeSnippet: 'function authenticateClient() {',
        actionTitle: 'เริ่มทำงานฟังก์ชัน authenticateClient',
        thaiExplanation: 'เข้าสู่การประมวลผลตรรกะหลักของระบบยืนยันตัวตนไคลเอนต์',
        stepType: 'call',
        variablesSnapshot: { targetEndpoint: 'undefined', httpMethod: 'undefined' },
        consoleOutput: null,
        reverseTip: 'นี่คือฟังก์ชัน Payload หลักที่ทำหน้าที่ยิงร้องขอ API และแนบ Authentication Token',
      },
      {
        stepIndex: 7,
        lineNumber: 35,
        codeSnippet: 'var targetEndpoint = _0x21bb(0x0);',
        actionTitle: 'ดึงค่า URL ปลายทางจากตารางคำ',
        thaiExplanation: 'เรียก _0x21bb(0) ได้ผลลัพธ์คือสตริง "https://api.example.com/v1/auth"',
        stepType: 'decode',
        stateMutations: [
          { variable: 'targetEndpoint', oldValue: 'undefined', newValue: 'https://api.example.com/v1/auth', type: 'string', note: 'ถอดรหัส URL' },
        ],
        variablesSnapshot: { targetEndpoint: 'https://api.example.com/v1/auth' },
        consoleOutput: null,
        reverseTip: 'พารามิเตอร์ 0x0 คือเลขฐาน 16 ของ 0 ซึ่งชี้ไปยังสมาชิกแรกของ String Array',
      },
      {
        stepIndex: 8,
        lineNumber: 36,
        codeSnippet: 'var httpMethod = _0x21bb(0x1);',
        actionTitle: 'ดึงค่า HTTP Method จากตารางคำ',
        thaiExplanation: 'เรียก _0x21bb(1) ได้ผลลัพธ์เป็นเมธอด "POST"',
        stepType: 'decode',
        stateMutations: [
          { variable: 'httpMethod', oldValue: 'undefined', newValue: 'POST', type: 'string', note: 'HTTP Verb' },
        ],
        variablesSnapshot: { targetEndpoint: 'https://api.example.com/v1/auth', httpMethod: 'POST' },
        consoleOutput: null,
        reverseTip: '0x1 = 1 คือ Index ตัวที่สองใน Array',
      },
      {
        stepIndex: 9,
        lineNumber: 37,
        codeSnippet: 'var authParam = _0x21bb(0x2);',
        actionTitle: 'ดึงชื่อพารามิเตอร์ส่งสิทธิ์',
        thaiExplanation: 'เรียก _0x21bb(2) ได้ผลลัพธ์เป็นชื่อฟิลด์ "api_key"',
        stepType: 'decode',
        stateMutations: [
          { variable: 'authParam', oldValue: 'undefined', newValue: 'api_key', type: 'string', note: 'Field name' },
        ],
        variablesSnapshot: { targetEndpoint: 'https://api.example.com/v1/auth', httpMethod: 'POST', authParam: 'api_key' },
        consoleOutput: null,
      },
      {
        stepIndex: 10,
        lineNumber: 38,
        codeSnippet: 'var secretToken = _0x21bb(0x3);',
        actionTitle: 'ดึงค่า Secret Token ลับ',
        thaiExplanation: 'เรียก _0x21bb(3) ได้ผลลัพธ์เป็นโทเค็นลับ "secret_token_9988"',
        stepType: 'decode',
        stateMutations: [
          { variable: 'secretToken', oldValue: 'undefined', newValue: 'secret_token_9988', type: 'string', note: 'Credentials' },
        ],
        variablesSnapshot: {
          targetEndpoint: 'https://api.example.com/v1/auth',
          httpMethod: 'POST',
          authParam: 'api_key',
          secretToken: 'secret_token_9988',
        },
        consoleOutput: null,
      },
      {
        stepIndex: 11,
        lineNumber: 40,
        codeSnippet: "console.log('[CLIENT] Initiating request to:', targetEndpoint);",
        actionTitle: 'แสดงข้อความเตรียมส่ง Request สู่ปลายทาง',
        thaiExplanation: 'พิมพ์ข้อความแจ้งเตรียมเชื่อมต่อไปยัง https://api.example.com/v1/auth',
        stepType: 'io',
        variablesSnapshot: { targetEndpoint: 'https://api.example.com/v1/auth' },
        consoleOutput: '[CLIENT] Initiating request to: https://api.example.com/v1/auth',
      },
      {
        stepIndex: 12,
        lineNumber: 41,
        codeSnippet: "console.log('[CLIENT] Method:', httpMethod);",
        actionTitle: 'แสดงข้อมูล HTTP Method',
        thaiExplanation: 'พิมพ์ข้อความแสดงรูปแบบเมธอดที่ใช้คือ POST',
        stepType: 'io',
        variablesSnapshot: { httpMethod: 'POST' },
        consoleOutput: '[CLIENT] Method: POST',
      },
      {
        stepIndex: 13,
        lineNumber: 43,
        codeSnippet: 'var payload = {}; payload[authParam] = secretToken;',
        actionTitle: 'ประกอบโครงสร้าง Payload ยืนยันตัวตน',
        thaiExplanation: 'สร้างออบเจกต์ payload และกำหนดคีย์แบบไดนามิก payload["api_key"] = "secret_token_9988"',
        stepType: 'variable',
        stateMutations: [
          { variable: 'payload', newValue: '{ "api_key": "secret_token_9988" }', type: 'object', note: 'Constructed payload' },
        ],
        variablesSnapshot: { payload: { api_key: 'secret_token_9988' } },
        consoleOutput: null,
        reverseTip: 'เทคนิค payload[authParam] เป็น Computed Property ช่วยไม่ให้คีย์คงที่ถูกค้นพบด้วย grep',
      },
      {
        stepIndex: 14,
        lineNumber: 46,
        codeSnippet: 'var status = _0x21bb(0x4);',
        actionTitle: 'ดึงค่าสถานะ Success จากตาราง',
        thaiExplanation: 'เรียก _0x21bb(4) ได้ผลลัพธ์เป็นคำว่า "success"',
        stepType: 'decode',
        stateMutations: [
          { variable: 'status', newValue: 'success', type: 'string', note: 'Status flag' },
        ],
        variablesSnapshot: { status: 'success' },
        consoleOutput: null,
      },
      {
        stepIndex: 15,
        lineNumber: 47,
        codeSnippet: "console.log('[AUTH STATUS]:', status, '-', _0x21bb(0x5));",
        actionTitle: 'พิมพ์สถานะการเชื่อมต่อสำเร็จ',
        thaiExplanation: 'ส่งข้อความออกสู่หน้าจอคอนโซล: "[AUTH STATUS]: success - connected"',
        stepType: 'io',
        variablesSnapshot: { status: 'success', connection: 'connected' },
        consoleOutput: '[AUTH STATUS]: success - connected',
      },
      {
        stepIndex: 16,
        lineNumber: 48,
        codeSnippet: 'return { endpoint: targetEndpoint, payload: payload, status: status };',
        actionTitle: 'คืนค่าผลลัพธ์จากฟังก์ชัน authenticateClient',
        thaiExplanation: 'ส่งคืน Object ข้อมูลการยืนยันตัวตนที่ประกอบเสร็จสมบูรณ์',
        stepType: 'return',
        variablesSnapshot: {
          result: {
            endpoint: 'https://api.example.com/v1/auth',
            payload: { api_key: 'secret_token_9988' },
            status: 'success',
          },
        },
        consoleOutput: null,
      },
    ],
    decompiledCode: `# Decompiled Clean Python Code (De-obfuscated)
import requests

API_ENDPOINT = "https://api.example.com/v1/auth"
API_KEY_SECRET = "secret_token_9988"

def authenticate_client():
    """
    Authenticates client by sending an authorized POST request
    with API key headers / payload.
    """
    print(f"[CLIENT] Initiating request to: {API_ENDPOINT}")
    print("[CLIENT] Method: POST")

    payload = {
        "api_key": API_KEY_SECRET
    }

    status = "success"
    print(f"[AUTH STATUS]: {status} - connected")

    return {
        "endpoint": API_ENDPOINT,
        "payload": payload,
        "status": status
    }

if __name__ == "__main__":
    result = authenticate_client()
    print("Authentication Result:", result)
`,
    decompiledExplanation: 'สคริปต์ต้นฉบับใช้เทคนิค String Array & Hex Encoded Literal ร่วมกับ IIFE เพื่อซ่อน URL ปลายทางและ Secret Token เมื่อคลี่คลายกลไกหมุนตำแหน่ง Array แล้ว ตัวแปรทั้งหมดจะตรงกับข้อมูลคงที่ด้านบนอย่างชัดเจน',
    decodedSymbolsTable: [
      {
        obfuscatedName: '_0x34a1[0] (\\x68\\x74...)',
        deobfuscatedMeaning: 'API Target Endpoint URL',
        exampleRawValue: '\\x68\\x74\\x74\\x70\\x73\\x3a\\x2f\\x2f\\x61\\x70\\x69\\x2e\\x65\\x78\\x61\\x6d\\x70\\x6c\\x65\\x2e\\x63\\x6f\\x6d\\x2f\\x76\\x31\\x2f\\x61\\x75\\x74\\x68',
        decodedValue: 'https://api.example.com/v1/auth',
      },
      {
        obfuscatedName: '_0x34a1[1] (\\x50\\x4f\\x53\\x54)',
        deobfuscatedMeaning: 'HTTP Request Verb',
        exampleRawValue: '\\x50\\x4f\\x53\\x54',
        decodedValue: 'POST',
      },
      {
        obfuscatedName: '_0x34a1[2] (\\x61\\x70\\x69...)',
        deobfuscatedMeaning: 'Authentication Parameter Name',
        exampleRawValue: '\\x61\\x70\\x69\\x5f\\x6b\\x65\\x79',
        decodedValue: 'api_key',
      },
      {
        obfuscatedName: '_0x34a1[3] (\\x73\\x65\\x63...)',
        deobfuscatedMeaning: 'Private Secret Key Token',
        exampleRawValue: '\\x73\\x65\\x63\\x72\\x65\\x74\\x5f\\x74\\x6f\\x6b\\x65\\x6e\\x5f\\x39\\x39\\x38\\x38',
        decodedValue: 'secret_token_9988',
      },
      {
        obfuscatedName: '_0x34a1[4] & [5]',
        deobfuscatedMeaning: 'Success and Connected status strings',
        exampleRawValue: '\\x73\\x75\\x63\\x63\\x65\\x73\\x73 / \\x63\\x6f\\x6e\\x6e...',
        decodedValue: 'success / connected',
      },
      {
        obfuscatedName: '_0x21bb(idx)',
        deobfuscatedMeaning: 'Array Lookup Resolver Function',
        exampleRawValue: '_0x21bb(0x0)',
        decodedValue: 'getStringFromTable(index)',
      },
    ],
    flowchart: [
      { id: '1', label: '1. รัน IIFE Array Rotator', type: 'start', line: 12, description: 'หมุนตำแหน่งตารางคำด้วย push(shift())' },
      { id: '2', label: '2. โหลด Hex String Array', type: 'process', line: 21, description: 'จอง Array _0x34a1 บรรจุข้อความ Hex escapes' },
      { id: '3', label: '3. กำหนด Getter Function', type: 'process', line: 30, description: 'สร้างตัวแก้ดัชนีข้อความ _0x21bb' },
      { id: '4', label: '4. ถอดรหัส URL และ Token', type: 'condition', line: 35, description: 'ดึง https endpoint และ secret_token' },
      { id: '5', label: '5. ประกอบ Payload และส่งออก', type: 'end', line: 40, description: 'พิมพ์คอนโซลและคืนค่าผลลัพธ์ Authentication' },
    ],
  },
  'transpiled-async-generator': {
    languageDetected: 'JavaScript (Transpiled ES5 State Machine)',
    scriptSummary: 'สคริปต์ async/await ที่คอมไพเลอร์ Babel แปลงเป็น Regenerator State Machine พร้อม switch-case จำลองการพักและคืนสภาพการทำงาน (Yield / Resume state dispatch)',
    obfuscationPatternsFound: [
      'Babel ES5 Async Lowering',
      'Explicit Switch-Case State Dispatch (_context.prev = _context.next)',
      'Simulated Coroutine Stack Context',
    ],
    securityAssessment: {
      riskLevel: 'safe',
      notes: 'โค้ดไม่มีพฤติกรรมมัลแวร์ เป็นโค้ดปกติที่ถูกแปลงเพื่อรันบนเบราว์เซอร์หรือ Node.js เวอร์ชันเก่า',
    },
    steps: [
      {
        stepIndex: 1,
        lineNumber: 61,
        codeSnippet: 'function fetchUserData(userId) {',
        actionTitle: 'เรียกใช้ฟังก์ชัน fetchUserData(1042)',
        thaiExplanation: 'เริ่มต้นฟังก์ชันดึงข้อมูลผู้ใช้โดยรับพารามิเตอร์ userId = 1042',
        stepType: 'call',
        variablesSnapshot: { userId: 1042 },
      },
      {
        stepIndex: 2,
        lineNumber: 65,
        codeSnippet: '_context = { prev: 0, next: 0, sent: undefined };',
        actionTitle: 'เตรียมโครงสร้าง Context ของ State Machine',
        thaiExplanation: 'สร้างออบเจกต์ _context เพื่อจำลอง Instruction Pointer และ Program Counter (PC)',
        stepType: 'state',
        stateMutations: [
          { variable: '_context.prev', newValue: '0', type: 'number' },
          { variable: '_context.next', newValue: '0', type: 'number' },
        ],
        variablesSnapshot: { _context: { prev: 0, next: 0 } },
      },
      {
        stepIndex: 3,
        lineNumber: 69,
        codeSnippet: 'switch (_context.prev = _context.next) { case 0:',
        actionTitle: 'สลับเข้าสู่ State 0 (เริ่มต้น Fetch)',
        thaiExplanation: 'ประเมินค่า State Machine เข้าสู่เคส 0: จำลองคำสั่งแรกของฟังก์ชัน async',
        stepType: 'flow',
        variablesSnapshot: { currentState: 0 },
        consoleOutput: '[STATE 0] Fetching initial user id: 1042',
      },
      {
        stepIndex: 4,
        lineNumber: 76,
        codeSnippet: "userProfile = { id: userId, username: 'dev_analyst', role: 'engineer' };",
        actionTitle: 'สร้างออบเจกต์ User Profile (State 2)',
        thaiExplanation: 'จำลองการ Resolve ข้อมูลโปรไฟล์ผู้ใช้หลัง await สำเร็จ',
        stepType: 'variable',
        stateMutations: [
          { variable: 'userProfile', newValue: '{ id: 1042, role: "engineer" }', type: 'object' },
        ],
        variablesSnapshot: { userProfile: { username: 'dev_analyst', role: 'engineer' } },
        consoleOutput: '[STATE 2] Profile retrieved: dev_analyst',
      },
      {
        stepIndex: 5,
        lineNumber: 83,
        codeSnippet: "if (userProfile.role === 'engineer') {",
        actionTitle: 'ตรวจสอบสิทธิ์ Role (State 4)',
        thaiExplanation: 'ตรวจสอบว่าผู้ใช้มีบทบาท engineer หรือไม่ พบว่าเป็นจริง จึงกำหนดสิทธิ์ระดับสูง',
        stepType: 'flow',
        stateMutations: [
          { variable: 'userPermissions', newValue: '["READ_SRC", "ANALYZE_AST", "EXECUTE_SANDBOX"]', type: 'array' },
        ],
        variablesSnapshot: { permissionsCount: 3 },
        consoleOutput: '[STATE 4] Checking ACL permissions for role: engineer',
      },
      {
        stepIndex: 6,
        lineNumber: 97,
        codeSnippet: 'finalResult = { profile: userProfile, permissions: userPermissions }; return finalResult;',
        actionTitle: 'รวมผลลัพธ์และส่งคืน (State 8)',
        thaiExplanation: 'ประกอบผลลัพธ์ Profile + Permissions และส่งออกจากฟังก์ชัน',
        stepType: 'return',
        variablesSnapshot: { finalResult: { done: true } },
        consoleOutput: '[STATE 8] Done! Permissions count: 3',
      },
    ],
    decompiledCode: `# Clean Decompiled Python Code
async def fetch_user_data(user_id: int):
    """
    Modern async function deconstructed from the Babel generator switch-case state machine.
    """
    print(f"[STATE 0] Fetching initial user id: {user_id}")

    # Simulated async await operation
    user_profile = {
        "id": user_id,
        "username": "dev_analyst",
        "role": "engineer"
    }
    print(f"[STATE 2] Profile retrieved: {user_profile['username']}")

    print(f"[STATE 4] Checking ACL permissions for role: {user_profile['role']}")
    if user_profile["role"] == "engineer":
        user_permissions = ["READ_SRC", "ANALYZE_AST", "EXECUTE_SANDBOX"]
    else:
        user_permissions = ["READ_ONLY"]

    final_result = {
        "profile": user_profile,
        "permissions": user_permissions
    }
    print(f"[STATE 8] Done! Permissions count: {len(user_permissions)}")
    return final_result
`,
    decompiledExplanation: 'โค้ดที่ Babel แปลงเป็น switch-case state machine แท้จริงแล้วคือ async/await ฟังก์ชันธรรมดาที่มีการดึงโปรไฟล์และตรวจสอบสิทธิ์ตาม Role',
    decodedSymbolsTable: [
      { obfuscatedName: '_context.prev / next', deobfuscatedMeaning: 'State Machine Instruction Pointer', decodedValue: 'PC / Current Step' },
      { obfuscatedName: 'stepExecution()', deobfuscatedMeaning: 'Coroutine Step Trampoline', decodedValue: 'async runtime iterator' },
    ],
    flowchart: [
      { id: '1', label: '1. เริ่มต้น fetchUserData', type: 'start', line: 61, description: 'รับ userId = 1042' },
      { id: '2', label: '2. State 0: เริ่มดึงข้อมูล', type: 'process', line: 70, description: 'พิมพ์ Log และย้าย State' },
      { id: '3', label: '3. State 2: ประกอบโปรไฟล์', type: 'process', line: 76, description: 'ดึง username และ role' },
      { id: '4', label: '4. State 4: ตรวจสอบ ACL Role', type: 'condition', line: 83, description: 'แยก Branch วิศวกร vs ผู้ใช้ทั่วไป' },
      { id: '5', label: '5. State 8: คืนค่าผลลัพธ์', type: 'end', line: 97, description: 'รวม profile และ permissions' },
    ],
  },
  'python-xor-cipher': {
    languageDetected: 'Python 3',
    scriptSummary: 'สคริปต์ถอดรหัสข้อมูลแบบ Bitwise XOR Stream Cipher โดยนำ Payload เลขฐาน 16 มาแปลงเป็นไบต์และ XOR แบบหมุนเวียนกับ Secret Key "CYBERSEC"',
    obfuscationPatternsFound: [
      'Hex-encoded byte payload',
      'Cyclical XOR Stream Decryption (plain = cipher ^ key)',
      'Runtime ASCII reconstruction via chr()',
    ],
    securityAssessment: {
      riskLevel: 'safe',
      notes: 'เป็นการสาธิตกลไกการเข้ารหัสระดับบิต (XOR) ไม่พบโค้ดโจมตีหรือขโมยข้อมูล',
    },
    steps: [
      {
        stepIndex: 1,
        lineNumber: 119,
        codeSnippet: 'raw_bytes = bytes.fromhex(cipher_hex)',
        actionTitle: 'แปลง Hex String เป็น Raw Bytes',
        thaiExplanation: 'นำข้อความฐาน 16 "1c0b001a1d4710170a1a0153070b160100" มาแปลงเป็นไบต์จำนวน 17 ไบต์',
        stepType: 'variable',
        stateMutations: [{ variable: 'raw_bytes', newValue: 'b"\\x1c\\x0b\\x00..." (17 bytes)', type: 'bytes' }],
        variablesSnapshot: { byteLength: 17 },
      },
      {
        stepIndex: 2,
        lineNumber: 123,
        codeSnippet: 'print("[INIT] Starting stream decryption, payload bytes:", len(raw_bytes))',
        actionTitle: 'แสดงข้อมูลขนาด Payload',
        thaiExplanation: 'พิมพ์ขนาดไบต์ที่ตรวจพบออกสู่หน้าจอ',
        stepType: 'io',
        consoleOutput: '[INIT] Starting stream decryption, payload bytes: 17',
        variablesSnapshot: { byteLength: 17 },
      },
      {
        stepIndex: 3,
        lineNumber: 132,
        codeSnippet: 'plain_byte = cipher_byte ^ key_byte',
        actionTitle: 'ทำการ Bitwise XOR ทีละไบต์',
        thaiExplanation: 'นำไบต์ที่เข้ารหัสมา XOR กับตัวอักษรของคีย์ในรอบนั้น (เช่น 0x1c ^ ord("C") = ord("p") = 112)',
        stepType: 'decode',
        stateMutations: [{ variable: 'plain_char', newValue: 'p', type: 'char' }],
        variablesSnapshot: { currentDecoded: 'p' },
        reverseTip: 'คุณสมบัติของ XOR คือ A ^ B = C และ C ^ B = A ทำให้การถอดรหัสและเข้ารหัสใช้โค้ดชุดเดียวกัน',
      },
      {
        stepIndex: 4,
        lineNumber: 137,
        codeSnippet: 'result_text = "".join(decoded_chars)',
        actionTitle: 'รวมตัวอักษรทั้งหมดเป็นข้อความที่สมบูรณ์',
        thaiExplanation: 'นำอักขระที่ถอดรหัสได้มารวมกัน กลายเป็นข้อความ "production_api_key"',
        stepType: 'variable',
        stateMutations: [{ variable: 'result_text', newValue: 'production_api_key', type: 'string' }],
        variablesSnapshot: { result_text: 'production_api_key' },
        consoleOutput: '[SUCCESS] Decrypted string: production_api_key',
      },
    ],
    decompiledCode: `// Decompiled JavaScript Version
function decryptStream(cipherHex, key) {
  const rawBytes = [];
  for (let i = 0; i < cipherHex.length; i += 2) {
    rawBytes.push(parseInt(cipherHex.substr(i, 2), 16));
  }

  const decryptedChars = rawBytes.map((byte, i) => {
    const keyChar = key.charCodeAt(i % key.length);
    return String.fromCharCode(byte ^ keyChar);
  });

  const result = decryptedChars.join('');
  console.log('[SUCCESS] Decrypted string:', result);
  return result;
}

const SECRET = decryptStream("1c0b001a1d4710170a1a0153070b160100", "CYBERSEC");
console.log('Revealed:', SECRET);
`,
    decompiledExplanation: 'อัลกอริทึมนี้ใช้สมบัติทางคณิตศาสตร์ของการดำเนินการ XOR เมื่อนำค่า Hex 17 ไบต์มา XOR ด้วยคีย์ "CYBERSEC" จะได้ค่า "production_api_key"',
    decodedSymbolsTable: [
      { obfuscatedName: 'ENCRYPTED_PAYLOAD', deobfuscatedMeaning: 'Obfuscated Hex Ciphertext', exampleRawValue: '1c0b001a1d4710170a1a0153070b160100', decodedValue: 'production_api_key' },
      { obfuscatedName: 'SECRET_KEY', deobfuscatedMeaning: 'Stream Cipher Cyclic Key', exampleRawValue: 'CYBERSEC', decodedValue: 'CYBERSEC' },
    ],
    flowchart: [
      { id: '1', label: '1. รับ Hex และ Key', type: 'start', line: 117, description: 'แปลง hex เป็นไบต์' },
      { id: '2', label: '2. วนลูปตามจำนวนไบต์', type: 'loop', line: 125, description: 'ดึง cipher_byte และ key_byte' },
      { id: '3', label: '3. ดำเนินการ Bitwise XOR', type: 'process', line: 132, description: 'plain_byte = cipher ^ key' },
      { id: '4', label: '4. คืนค่าข้อความถอดรหัส', type: 'end', line: 137, description: 'แสดง "production_api_key"' },
    ],
  },
  'state-machine-tokenizer': {
    languageDetected: 'TypeScript',
    scriptSummary: 'เครื่องมือแยกคำศัพท์ (Lexer / Tokenizer) แปลงสตริงโค้ดต้นฉบับให้กลายเป็น Token สตรีม โดยอาศัยสถานะ IDLE, READING_IDENTIFIER, READING_NUMBER',
    obfuscationPatternsFound: ['Finite State Machine (FSM)', 'Lexical Analysis Dispatch'],
    securityAssessment: { riskLevel: 'safe', notes: 'โค้ดคอมไพเลอร์ปลอดภัยสำหรับการศึกษา' },
    steps: [
      {
        stepIndex: 1,
        lineNumber: 165,
        codeSnippet: 'let state = State.IDLE; let buffer = "";',
        actionTitle: 'กำหนดสถานะเริ่มต้น IDLE',
        thaiExplanation: 'ตั้งต้น State Machine ให้พร้อมรับอักขระตัวแรก',
        stepType: 'variable',
        variablesSnapshot: { state: 'IDLE', buffer: '' },
      },
      {
        stepIndex: 2,
        lineNumber: 174,
        codeSnippet: 'if (/[a-zA-Z_]/.test(char)) { state = State.READING_IDENTIFIER; }',
        actionTitle: 'ตรวจพบตัวอักษร: สลับสถานะเป็น IDENTIFIER',
        thaiExplanation: 'เมื่อพบตัวอักษร "l" ของคำว่า "let" จึงเปลี่ยนสถานะมาอ่านตัวแปรหรือคีย์เวิร์ด',
        stepType: 'state',
        stateMutations: [{ variable: 'state', newValue: 'READING_IDENTIFIER', type: 'enum' }],
        variablesSnapshot: { state: 'READING_IDENTIFIER', buffer: 'let' },
      },
      {
        stepIndex: 3,
        lineNumber: 191,
        codeSnippet: 'tokens.push({ type: "IDENTIFIER", value: buffer, start: tokenStart });',
        actionTitle: 'บันทึก Token: IDENTIFIER ("let")',
        thaiExplanation: 'เมื่อเจอช่องว่าง จึงสรุป Token "let" ลงในรายการ Token',
        stepType: 'variable',
        variablesSnapshot: { tokensCount: 1 },
      },
      {
        stepIndex: 4,
        lineNumber: 212,
        codeSnippet: 'console.log("[TOKENIZER] Total tokens scanned:", tokens.length);',
        actionTitle: 'แสดงผลสรุปจำนวน Tokens',
        thaiExplanation: 'สแกนจนจบประโยค "let speed = 250" ได้ Token ครบ 4 รายการ',
        stepType: 'io',
        consoleOutput: '[TOKENIZER] Total tokens scanned: 4',
        variablesSnapshot: { totalTokens: 4 },
      },
    ],
    decompiledCode: `# Clean Decompiled Python Tokenizer
import re
from typing import List, Dict

def tokenize(input_code: str) -> List[Dict]:
    tokens = []
    # Regular expression pattern scanner
    token_spec = [
        ('NUMBER',     r'\\d+'),
        ('IDENTIFIER', r'[A-Za-z_]\\w*'),
        ('OP',         r'[=+\\-*/]'),
        ('SKIP',       r'[ \\t]+'),
    ]
    tok_regex = '|'.join(f'(?P<{name}>{pattern})' for name, pattern in token_spec)
    for match in re.finditer(tok_regex, input_code):
        kind = match.lastgroup
        value = match.group()
        if kind != 'SKIP':
            tokens.append({'type': kind, 'value': value, 'start': match.start()})
    return tokens

tokens = tokenize("let speed = 250")
print("Scanned Tokens:", tokens)
`,
    decompiledExplanation: 'สคริปต์จำลองกลไก Scanner ในคอมไพเลอร์ที่ใช้ FSM (Finite State Machine) แปลงข้อความตัวอักษรให้เป็นหน่วยข้อมูลเชิงโครงสร้าง',
    decodedSymbolsTable: [
      { obfuscatedName: 'State.READING_IDENTIFIER', deobfuscatedMeaning: 'State for scanning words / variable names', decodedValue: 'Scanning Identifier' },
      { obfuscatedName: 'State.READING_NUMBER', deobfuscatedMeaning: 'State for scanning numeric digits', decodedValue: 'Scanning Number' },
    ],
    flowchart: [
      { id: '1', label: '1. เริ่มต้นสถานะ IDLE', type: 'start', line: 165, description: 'พร้อมรับอักขระใหม่' },
      { id: '2', label: '2. ตรวจสอบประเภทตัวอักษร', type: 'condition', line: 173, description: 'จำแนกตัวอักษร ตัวเลข หรือเครื่องหมาย' },
      { id: '3', label: '3. เปลี่ยนสถานะและสะสม Buffer', type: 'process', line: 188, description: 'อ่านตัวอักษรต่อเนื่อง' },
      { id: '4', label: '4. สรุป Token และคืนค่า', type: 'end', line: 213, description: 'ส่งออกรายการ Tokens' },
    ],
  },
  'php-shell-unpacker': {
    languageDetected: 'PHP 7/8',
    scriptSummary: 'โค้ดจำลองรูปแบบ Web Payload Unpacker (Base64 Encoding + ฟังก์ชัน Dynamic Call) พร้อมระบบ Security Inspection กักกันคำสั่งที่น่าสงสัย',
    obfuscationPatternsFound: [
      'Base64 encoded shell command string',
      'String concatenation for function names',
      'Regular expression safety filtering',
    ],
    securityAssessment: {
      riskLevel: 'suspicious',
      notes: 'ตรวจพบรูปแบบ Base64 Payload "d2hvYW1pOyB1bmFtZSAtYQ==" ซึ่งถอดรหัสได้เป็นคำสั่งระบบ "whoami; uname -a"',
      suspiciousPatterns: ['Base64 shell command execution pattern', 'Concatenated system function name'],
    },
    steps: [
      {
        stepIndex: 1,
        lineNumber: 228,
        codeSnippet: "$mangled_func = 's' . 'y' . 's' . 't' . 'e' . 'm';",
        actionTitle: 'ประกอบชื่อฟังก์ชัน "system" ผ่าน String Concatenation',
        thaiExplanation: 'นำตัวอักษรเดี่ยวๆ มาเชื่อมกันเพื่อหลบหลีกการตรวจจับแบบ Static String Search',
        stepType: 'variable',
        stateMutations: [{ variable: '$mangled_func', newValue: 'system', type: 'string' }],
        variablesSnapshot: { $mangled_func: 'system' },
      },
      {
        stepIndex: 2,
        lineNumber: 229,
        codeSnippet: "$encoded_command = 'd2hvYW1pOyB1bmFtZSAtYQ==';",
        actionTitle: 'กำหนดตัวแปร Payload ที่เข้ารหัส Base64',
        thaiExplanation: 'เก็บสตริง Base64 ที่ซ่อนคำสั่งระบบไว้',
        stepType: 'variable',
        variablesSnapshot: { $encoded_command: 'd2hvYW1pOyB1bmFtZSAtYQ==' },
      },
      {
        stepIndex: 3,
        lineNumber: 233,
        codeSnippet: '$decoded_raw = base64_decode($payload_b64);',
        actionTitle: 'ถอดรหัส Base64 ของ Payload',
        thaiExplanation: 'ทำการ Decode สตริง Base64 ออกมาเป็นข้อความคำสั่งดิบ: "whoami; uname -a"',
        stepType: 'decode',
        stateMutations: [{ variable: '$decoded_raw', newValue: 'whoami; uname -a', type: 'string' }],
        variablesSnapshot: { $decoded_raw: 'whoami; uname -a' },
        consoleOutput: '[SECURITY AUDIT] Decoding suspected payload...\n[AUDIT RESULT] Decoded command: whoami; uname -a',
      },
      {
        stepIndex: 4,
        lineNumber: 238,
        codeSnippet: "$is_safe = !preg_match('/rm|delete|wget|curl/', $decoded_raw);",
        actionTitle: 'ตรวจสอบความปลอดภัยของคำสั่ง',
        thaiExplanation: 'ประเมินคำสั่งด้วย Regex ตรวจจับคำสั่งอันตราย (rm, wget, curl) เพื่อความปลอดภัย',
        stepType: 'flow',
        variablesSnapshot: { is_safe: true },
        consoleOutput: '[STATUS] Command inspected and quarantined for review.',
      },
    ],
    decompiledCode: `# Clean Decompiled Python Security Scanner
import base64
import re

ENCODED_PAYLOAD = "d2hvYW1pOyB1bmFtZSAtYQ=="

def inspect_payload(payload_b64: str) -> dict:
    """
    Decodes and audits base64 payload safely without executing it.
    """
    decoded_command = base64.b64decode(payload_b64).decode("utf-8")
    print(f"[AUDIT] Decoded command: {decoded_command}")

    is_dangerous = bool(re.search(r"(rm|delete|wget|curl)", decoded_command))
    return {
        "raw": payload_b64,
        "command": decoded_command,
        "is_safe": not is_dangerous
    }

if __name__ == "__main__":
    report = inspect_payload(ENCODED_PAYLOAD)
    print("Security Report:", report)
`,
    decompiledExplanation: 'สคริปต์ใช้การเชื่อมสตริง "s"."y"."s"."t"."e"."m" และ Base64 เพื่อพรางคำสั่ง "whoami; uname -a" ที่ใช้ตรวจสอบสภาพแวดล้อมเครื่องเซิร์ฟเวอร์',
    decodedSymbolsTable: [
      { obfuscatedName: 'd2hvYW1pOyB1bmFtZSAtYQ==', deobfuscatedMeaning: 'Base64 Encoded Shell Probe', exampleRawValue: 'd2hvYW1pOyB1bmFtZSAtYQ==', decodedValue: 'whoami; uname -a' },
      { obfuscatedName: "$mangled_func ('s'.'y'.'s'..)", deobfuscatedMeaning: 'PHP system() execution handler', exampleRawValue: 's.y.s.t.e.m', decodedValue: 'system' },
    ],
    flowchart: [
      { id: '1', label: '1. เริ่มต้นโหลด Payload', type: 'start', line: 228, description: 'ประกอบชื่อฟังก์ชันและรับ Base64' },
      { id: '2', label: '2. ถอดรหัส Base64', type: 'process', line: 233, description: 'base64_decode($payload)' },
      { id: '3', label: '3. ตรวจจับคำสั่งอันตราย', type: 'condition', line: 238, description: 'คัดกรอง regex ไม่ให้รันคำสั่งทำลายระบบ' },
      { id: '4', label: '4. กักกันและออกรายงาน', type: 'end', line: 242, description: 'บันทึกสถานะการตรวจสอบ' },
    ],
  },
};
