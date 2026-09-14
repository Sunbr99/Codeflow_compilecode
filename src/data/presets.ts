import { PresetScript } from '../types';

export const PRESET_SCRIPTS: PresetScript[] = [
  {
    id: 'js-obfuscated-string-array',
    title: '1. JS Obfuscated String Array & Unpacker',
    language: 'javascript',
    category: 'De-obfuscation',
    description: 'โค้ด JavaScript ที่ผ่านการ Obfuscate ด้วย String Array, Hex Escapes, และฟังก์ชันหมุนตำแหน่ง Array เพื่อซ่อน URL และพารามิเตอร์ลับ',
    defaultTargetLanguage: 'python',
    code: `// Obfuscated Script Sample: String Array & Hex Encoded Unpacker
(function (_0x1a8f, _0x3b21) {
  var _0x5c42 = function (_0x48d1) {
    while (--_0x48d1) {
      _0x1a8f['push'](_0x1a8f['shift']());
    }
  };
  _0x5c42(++_0x3b21);
}(_0x34a1, 0x1f4));

var _0x34a1 = [
  '\\x68\\x74\\x74\\x70\\x73\\x3a\\x2f\\x2f\\x61\\x70\\x69\\x2e\\x65\\x78\\x61\\x6d\\x70\\x6c\\x65\\x2e\\x63\\x6f\\x6d\\x2f\\x76\\x31\\x2f\\x61\\x75\\x74\\x68',
  '\\x50\\x4f\\x53\\x54',
  '\\x61\\x70\\x69\\x5f\\x6b\\x65\\x79',
  '\\x73\\x65\\x63\\x72\\x65\\x74\\x5f\\x74\\x6f\\x6b\\x65\\x6e\\x5f\\x39\\x39\\x38\\x38',
  '\\x73\\x75\\x63\\x63\\x65\\x73\\x73',
  '\\x63\\x6f\\x6e\\x6e\\x65\\x63\\x74\\x65\\x64'
];

function _0x21bb(_0x5472) {
  return _0x34a1[_0x5472];
}

function authenticateClient() {
  var targetEndpoint = _0x21bb(0x0);
  var httpMethod = _0x21bb(0x1);
  var authParam = _0x21bb(0x2);
  var secretToken = _0x21bb(0x3);

  console.log('[CLIENT] Initiating request to:', targetEndpoint);
  console.log('[CLIENT] Method:', httpMethod);

  var payload = {};
  payload[authParam] = secretToken;

  var status = _0x21bb(0x4);
  console.log('[AUTH STATUS]:', status, '-', _0x21bb(0x5));
  return { endpoint: targetEndpoint, payload: payload, status: status };
}

authenticateClient();`,
  },
  {
    id: 'transpiled-async-generator',
    title: '2. Transpiled Async/Await State Machine',
    language: 'javascript',
    category: 'Transpiled Code',
    description: 'โค้ด async/await ที่คอมไพเลอร์ (Babel/TypeScript ES5) แปลงค่ากลายเป็น State Machine switch-case แบบ low-level พร้อม context.prev/next',
    defaultTargetLanguage: 'python',
    code: `// Transpiled ES5 Async Generator State Machine (Babel _regeneratorRuntime)
function fetchUserData(userId) {
  var _context;
  var userProfile, userPermissions, finalResult;

  _context = { prev: 0, next: 0, sent: undefined };

  function stepExecution() {
    while (true) {
      switch (_context.prev = _context.next) {
        case 0:
          console.log('[STATE 0] Fetching initial user id:', userId);
          _context.next = 2;
          break;

        case 2:
          userProfile = { id: userId, username: 'dev_analyst', role: 'engineer' };
          console.log('[STATE 2] Profile retrieved:', userProfile.username);
          _context.next = 4;
          break;

        case 4:
          console.log('[STATE 4] Checking ACL permissions for role:', userProfile.role);
          if (userProfile.role === 'engineer') {
            userPermissions = ['READ_SRC', 'ANALYZE_AST', 'EXECUTE_SANDBOX'];
            _context.next = 8;
          } else {
            _context.next = 6;
          }
          break;

        case 6:
          userPermissions = ['READ_ONLY'];
          _context.next = 8;
          break;

        case 8:
          finalResult = { profile: userProfile, permissions: userPermissions };
          console.log('[STATE 8] Done! Permissions count:', userPermissions.length);
          return finalResult;
      }
    }
  }

  return stepExecution();
}

fetchUserData(1042);`,
  },
  {
    id: 'python-xor-cipher',
    title: '3. Python XOR Stream Cipher Decrypter',
    language: 'python',
    category: 'Crypto & Reverse Engineering',
    description: 'สคริปต์ภาษา Python ที่ซ่อน String สำคัญไว้ด้วย Bitwise XOR Stream Cipher และแกะค่าออกมาใน Runtime',
    defaultTargetLanguage: 'javascript',
    code: `# Obfuscated Python Stream Cipher Decrypter
def decrypt_stream(cipher_hex, key):
    # Convert hex payload into byte values
    raw_bytes = bytes.fromhex(cipher_hex)
    decoded_chars = []
    key_len = len(key)
    
    print("[INIT] Starting stream decryption, payload bytes:", len(raw_bytes))
    
    for i in range(len(raw_bytes)):
        # Apply cyclical key XOR operation
        key_char = key[i % key_len]
        key_byte = ord(key_char)
        cipher_byte = raw_bytes[i]
        
        # Bitwise XOR operation
        plain_byte = cipher_byte ^ key_byte
        plain_char = chr(plain_byte)
        
        decoded_chars.append(plain_char)
        
    result_text = "".join(decoded_chars)
    print("[SUCCESS] Decrypted string:", result_text)
    return result_text

# Obfuscated hidden payload and secret key
ENCRYPTED_PAYLOAD = "1c0b001a1d4710170a1a0153070b160100"
SECRET_KEY = "CYBERSEC"

revealed_config = decrypt_stream(ENCRYPTED_PAYLOAD, SECRET_KEY)
print("Final Config:", revealed_config)`,
  },
  {
    id: 'state-machine-tokenizer',
    title: '4. Lexer & Tokenizer State Machine',
    language: 'typescript',
    category: 'Compiler Logic',
    description: 'เครื่องมือแยกคำ (Lexical Scanner / Tokenizer) แปลง script text เป็น token สตรีมพร้อมสเตททรานซิชัน',
    defaultTargetLanguage: 'python',
    code: `// Lexer Tokenizer State Engine
enum State { IDLE, READING_IDENTIFIER, READING_NUMBER, READING_STRING }

interface Token {
  type: string;
  value: string;
  start: number;
}

function tokenize(input: string): Token[] {
  let state = State.IDLE;
  let buffer = '';
  let tokens: Token[] = [];
  let tokenStart = 0;

  for (let i = 0; i < input.length; i++) {
    const char = input[i];

    if (state === State.IDLE) {
      if (/[a-zA-Z_]/.test(char)) {
        state = State.READING_IDENTIFIER;
        buffer = char;
        tokenStart = i;
      } else if (/[0-9]/.test(char)) {
        state = State.READING_NUMBER;
        buffer = char;
        tokenStart = i;
      } else if (char === '"' || char === "'") {
        state = State.READING_STRING;
        buffer = '';
        tokenStart = i;
      }
    } else if (state === State.READING_IDENTIFIER) {
      if (/[a-zA-Z0-9_]/.test(char)) {
        buffer += char;
      } else {
        tokens.push({ type: 'IDENTIFIER', value: buffer, start: tokenStart });
        buffer = '';
        state = State.IDLE;
        i--; // Re-evaluate character in IDLE state
      }
    } else if (state === State.READING_NUMBER) {
      if (/[0-9]/.test(char)) {
        buffer += char;
      } else {
        tokens.push({ type: 'NUMBER', value: buffer, start: tokenStart });
        buffer = '';
        state = State.IDLE;
        i--;
      }
    }
  }

  if (buffer.length > 0) {
    tokens.push({ type: state === State.READING_IDENTIFIER ? 'IDENTIFIER' : 'NUMBER', value: buffer, start: tokenStart });
  }

  console.log('[TOKENIZER] Total tokens scanned:', tokens.length);
  return tokens;
}

const tokens = tokenize('let speed = 250');
console.log('Result Tokens:', JSON.stringify(tokens));`,
  },
  {
    id: 'php-shell-unpacker',
    title: '5. Web Payload Unpacker & Deobfuscator',
    language: 'php',
    category: 'Malware Analysis',
    description: 'ตัวอย่างโค้ดเลียนแบบแพตเทิร์น Obfuscation ยอดนิยม (Base64 + Rot13 + Variable Substitution) ที่พบบ่อยในการแกะโค้ดตรวจสอบช่องโหว่',
    defaultTargetLanguage: 'python',
    code: `<?php
// Simulated Web Payload Unpacker Pattern for Security Analysis
$mangled_func = 's' . 'y' . 's' . 't' . 'e' . 'm';
$encoded_command = 'd2hvYW1pOyB1bmFtZSAtYQ=='; // base64 for: whoami; uname -a

function unpack_and_inspect($payload_b64) {
    echo "[SECURITY AUDIT] Decoding suspected payload...\\n";
    $decoded_raw = base64_decode($payload_b64);
    
    echo "[AUDIT RESULT] Decoded command: " . $decoded_raw . "\\n";
    
    // Safety check: Intercept execution instead of running
    $is_safe = !preg_match('/rm|delete|wget|curl/', $decoded_raw);
    
    if ($is_safe) {
        echo "[STATUS] Command inspected and quarantined for review.\\n";
        return array('raw' => $payload_b64, 'plain' => $decoded_raw, 'safe' => true);
    } else {
        echo "[ALERT] Dangerous command pattern detected!\\n";
        return array('raw' => $payload_b64, 'plain' => $decoded_raw, 'safe' => false);
    }
}

$analysis = unpack_and_inspect($encoded_command);
print_r($analysis);
?>`,
  },
  {
    id: 'bash-downloader-obfuscated',
    title: '6. Bash Obfuscated Downloader Script',
    language: 'shell',
    category: 'Shell Script Analysis',
    description: 'สคริปต์ Bash/Linux Shell ที่ใช้ Hex Variable Concatenation เพื่อซ่อนคำสั่งดาวน์โหลดและพารามิเตอร์ลับ',
    defaultTargetLanguage: 'python',
    code: `#!/bin/bash
# Obfuscated Bash Payload Simulator
HEX_HOST="6170692e7365727665722e696f"
TARGET_PORT="8443"
AUTH_FLAG="0xdeadbeef"

# Function to decode hex strings into plain ASCII
decode_hex() {
  local hex_input=$1
  echo "$hex_input" | xxd -r -p
}

SERVER_HOST=$(decode_hex "$HEX_HOST")
echo "[LOG] Resolved Target Host: $SERVER_HOST"
echo "[LOG] Connecting to port: $TARGET_PORT"

REQUEST_URL="https://$SERVER_HOST:$TARGET_PORT/agent/heartbeat"
echo "[SHELL] Target Endpoint: $REQUEST_URL"

# Intercept and print payload configuration instead of executing
STATUS="INSPECTED_SAFELY"
echo "[COMPLETE] Deobfuscation status: $STATUS"`,
  },
  {
    id: 'go-byte-xor-pipeline',
    title: '7. Go / C Byte Array Decryption Pipeline',
    language: 'go',
    category: 'Compiled / Low-level Logic',
    description: 'สคริปต์ภาษา Go (Golang) ที่จำลองการถอดรหัส Byte Array ด้วย Dynamic XOR Masking สำหรับแกะเฟิร์มแวร์และไบนารี',
    defaultTargetLanguage: 'python',
    code: `package main

import (
	"fmt"
)

// DecodePayload processes raw byte buffer with dynamic rolling key
func DecodePayload(encrypted []byte, mask byte) string {
	decoded := make([]byte, len(encrypted))
	
	fmt.Printf("[INIT] Decoding %d encrypted bytes with mask: 0x%02x\\n", len(encrypted), mask)
	
	for i := 0; i < len(encrypted); i++ {
		// Apply rolling XOR mask transformation
		decoded[i] = encrypted[i] ^ (mask + byte(i%4))
	}
	
	result := string(decoded)
	fmt.Printf("[DECODE] Recovered plain string: %s\\n", result)
	return result
}

func main() {
	rawCipher := []byte{0x2b, 0x48, 0x57, 0x45, 0x47, 0x22, 0x56, 0x54, 0x47, 0x41}
	var masterKey byte = 0x24
	
	configString := DecodePayload(rawCipher, masterKey)
	fmt.Println("Result Payload:", configString)
}`,
  },
];
