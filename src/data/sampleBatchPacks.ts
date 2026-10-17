export interface SampleBatchPack {
  id: string;
  name: string;
  description: string;
  icon: string;
  files: Array<{
    name: string;
    path: string;
    language: string;
    content: string;
  }>;
}

export const SAMPLE_BATCH_PACKS: SampleBatchPack[] = [
  {
    id: 'microservices-suite',
    name: 'Microservices & API Gateway Suite (5 Scripts)',
    description: 'ชุดสคริปต์สถาปัตยกรรม Microservices จำลองที่มีช่องโหว่ Command Injection, Hardcoded Secret, และ SSRF',
    icon: 'server',
    files: [
      {
        name: 'api-gateway.js',
        path: 'services/gateway/api-gateway.js',
        language: 'javascript',
        content: `const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Insecure CORS Wildcard
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  next();
});

// Hardcoded Master API Key
const MASTER_API_KEY = "sk-live-99f81a7b6c5d4e3f2a1b0c9d8e7f6a5b";

app.post('/api/dispatch', async (req, res) => {
  const { targetService, payload } = req.body;
  // SSRF Risk: calling user-controlled URL without whitelist
  try {
    const response = await axios.post(targetService, payload, {
      headers: { 'X-Admin-Secret': MASTER_API_KEY }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(8080);`,
      },
      {
        name: 'report-generator.py',
        path: 'services/reports/report-generator.py',
        language: 'python',
        content: `import os
import sys
import subprocess

def generate_pdf_report(template_name, user_params):
    # CRITICAL: Remote Command Injection via shell=True string concatenation
    cmd = f"wkhtmltopdf --template {template_name} {user_params} /tmp/output.pdf"
    print(f"Executing: {cmd}")
    # CWE-78: os.system / subprocess shell=True with unvalidated user_params
    subprocess.call(cmd, shell=True)
    return "/tmp/output.pdf"

if __name__ == "__main__":
    if len(sys.argv) > 2:
        generate_pdf_report(sys.argv[1], sys.argv[2])`,
      },
      {
        name: 'auth-validator.ts',
        path: 'services/auth/auth-validator.ts',
        language: 'typescript',
        content: `import crypto from 'crypto';

// Insecure Weak Hash Algorithm MD5 used for token fingerprinting
export function generateTokenFingerprint(token: string): string {
  return crypto.createHash('md5').update(token).digest('hex');
}

export function verifyAdminAccess(userRole: string, claims: Record<string, any>): boolean {
  // Prototype pollution inspection or insecure check
  if (userRole === 'admin' || claims['isAdmin'] === true) {
    return true;
  }
  return false;
}`,
      },
      {
        name: 'database-backup.sh',
        path: 'scripts/backup/database-backup.sh',
        language: 'shell',
        content: `#!/bin/bash
# Database automated backup job
DB_HOST="internal-db.corp.local"
DB_PASS="SuperSecretProdPassw0rd!2026"
BACKUP_DIR="/var/backups"

# Unsanitized backup tag parameter
TAG=$1

# Command injection risk if TAG contains ; or backticks
mysqldump -h $DB_HOST -u root -p$DB_PASS production_db > "$BACKUP_DIR/backup_$TAG.sql"

# Transfer backup to remote target
curl -X POST -F "file=@$BACKUP_DIR/backup_$TAG.sql" "http://backup-node:9000/upload"`,
      },
      {
        name: 'cache-evaluator.js',
        path: 'services/cache/cache-evaluator.js',
        language: 'javascript',
        content: `// Dynamic cache filter evaluation
function evaluateCustomFilter(filterExpression, dataItem) {
  try {
    // CRITICAL: Unsafe Code Execution via eval()
    const isMatched = eval("dataItem." + filterExpression);
    return Boolean(isMatched);
  } catch (e) {
    console.error("Filter evaluation error", e);
    return false;
  }
}

module.exports = { evaluateCustomFilter };`,
      },
    ],
  },
  {
    id: 'cloud-infrastructure',
    name: 'DevOps & Cloud Infrastructure Pack (4 Scripts)',
    description: 'ชุดสคริปต์สำหรับการ Deploy, ทำความสะอาด Container และจัดการ Webhook ในสภาพแวดล้อม Cloud',
    icon: 'cloud',
    files: [
      {
        name: 'deploy-cluster.sh',
        path: 'ci-cd/deploy-cluster.sh',
        language: 'shell',
        content: `#!/bin/bash
set -e
ENV_TARGET=$1
CLUSTER_NAME=$2

# Hardcoded AWS Secret Access Key
export AWS_ACCESS_KEY_ID="AKIAIOSFODNN7EXAMPLE"
export AWS_SECRET_ACCESS_KEY="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"

echo "Deploying to cluster $CLUSTER_NAME..."
# Command execution with variable interpolation
eval "kubectl config use-context $CLUSTER_NAME"
kubectl apply -f ./manifests/`,
      },
      {
        name: 'webhook-handler.py',
        path: 'monitoring/webhook-handler.py',
        language: 'python',
        content: `from flask import Flask, request
import requests
import json

app = Flask(__name__)

@app.route('/webhook', methods=['POST'])
def handle_webhook():
    payload = request.get_json(force=True)
    callback_url = payload.get('callback')
    
    # SSRF Risk: Triggering request to user provided callback URL
    if callback_url:
        resp = requests.post(callback_url, json={'status': 'acknowledged'})
        return resp.text
        
    return json.dumps({'ok': True})`,
      },
      {
        name: 'cleanup-containers.js',
        path: 'scripts/cleanup-containers.js',
        language: 'javascript',
        content: `const { execSync } = require('child_process');

function pruneDanglingImages(filterTag) {
  // Dangerous shell command execution
  const cmd = \`docker image prune -a --filter "label=\${filterTag}" --force\`;
  return execSync(cmd).toString();
}

module.exports = { pruneDanglingImages };`,
      },
      {
        name: 'vault-sync.py',
        path: 'security/vault-sync.py',
        language: 'python',
        content: `import os
import hashlib

# High-entropy Vault token
VAULT_TOKEN = "s.1m8Z98xQ2p4L0k7J5h3G1f9D"

def compute_checksum(data):
    # Weak hash MD5
    return hashlib.md5(data.encode('utf-8')).hexdigest()`,
      },
    ],
  },
  {
    id: 'hardened-enterprise',
    name: 'Hardened Enterprise Compliant Set (3 Scripts)',
    description: 'ชุดโค้ดต้นแบบที่ผ่านการ Hardening ปลอดภัยตามมาตรฐาน OWASP และ Clean Code Principles',
    icon: 'shield',
    files: [
      {
        name: 'secure-token-service.ts',
        path: 'src/security/secure-token-service.ts',
        language: 'typescript',
        content: `import crypto from 'crypto';

// Compliant: Environment-based secrets & Cryptographically strong PRNG
const TOKEN_SECRET = process.env.JWT_SIGNING_SECRET;
if (!TOKEN_SECRET) {
  throw new Error("FATAL: JWT_SIGNING_SECRET must be configured in environment");
}

export function generateSecureSessionToken(): string {
  // Uses crypto.randomBytes (CSPRNG)
  return crypto.randomBytes(32).toString('hex');
}

export function hashSensitiveIdentifier(id: string): string {
  // Uses SHA-256 instead of MD5
  return crypto.createHash('sha256').update(id).digest('hex');
}`,
      },
      {
        name: 'sanitized-storage-reader.js',
        path: 'src/storage/sanitized-storage-reader.js',
        language: 'javascript',
        content: `const path = require('path');
const fs = require('fs');

const ALLOWED_ROOT = path.resolve('/var/app/public_assets');

// Safe file reader: prevents Path Traversal (CWE-22)
function getSafePublicFile(userPath) {
  const safeBase = path.basename(userPath);
  const resolvedPath = path.resolve(ALLOWED_ROOT, safeBase);
  
  // Guard check: ensure resolved path stays strictly within ALLOWED_ROOT
  if (!resolvedPath.startsWith(ALLOWED_ROOT)) {
    throw new Error("Access Denied: Path traversal detected");
  }
  
  if (!fs.existsSync(resolvedPath)) {
    return null;
  }
  
  return fs.readFileSync(resolvedPath, 'utf8');
}

module.exports = { getSafePublicFile };`,
      },
      {
        name: 'parameterized-query-client.py',
        path: 'src/database/parameterized-query-client.py',
        language: 'python',
        content: `import sqlite3

def find_user_by_email(db_path: str, email: str):
    # Compliant: Parameterized query (Prepared Statement) prevents SQLi
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email FROM users WHERE email = ?", (email,))
    row = cursor.fetchone()
    conn.close()
    return row`,
      },
    ],
  },
];
