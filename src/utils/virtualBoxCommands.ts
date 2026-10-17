export interface CommandResult {
  lines: {
    type: 'input' | 'output' | 'error' | 'success' | 'system';
    text: string;
  }[];
  newDir?: string;
  openAst?: {
    filename?: string;
    code?: string;
  };
}

export interface CommandCategoryItem {
  cmd: string;
  category: 'se' | 'fullstack' | 'infra' | 'sec' | 'system';
  description: string;
}

export const SUGGESTED_COMMANDS: CommandCategoryItem[] = [
  // Software Engineering
  { cmd: 'git status', category: 'se', description: 'Git working tree status' },
  { cmd: 'git log --oneline -n 5', category: 'se', description: 'Recent commit history' },
  { cmd: 'npm run build', category: 'se', description: 'Build production bundle (Vite + esbuild)' },
  { cmd: 'pnpm test', category: 'se', description: 'Run test suites (Vitest / Jest)' },
  { cmd: 'cargo check', category: 'se', description: 'Rust compiler verification' },
  { cmd: 'go test ./...', category: 'se', description: 'Go package tests' },
  { cmd: 'npx eslint .', category: 'se', description: 'Run code linter' },
  { cmd: 'ast algorithm.ts', category: 'se', description: 'Visual AST & Time-Travel Debugger' },

  // Full-Stack Developer
  { cmd: 'curl http://localhost:3000/api/health', category: 'fullstack', description: 'Inspect API endpoints' },
  { cmd: 'docker ps', category: 'fullstack', description: 'List active Docker containers' },
  { cmd: 'docker compose up -d', category: 'fullstack', description: 'Boot fullstack microservices' },
  { cmd: 'npx prisma studio', category: 'fullstack', description: 'Interactive Database GUI' },
  { cmd: 'psql -U postgres -c "\\dt"', category: 'fullstack', description: 'PostgreSQL database relations' },
  { cmd: 'redis-cli ping', category: 'fullstack', description: 'Test In-Memory Redis Cache' },
  { cmd: 'pm2 status', category: 'fullstack', description: 'Node.js Process Manager cluster' },
  { cmd: 'nginx -t', category: 'fullstack', description: 'Test Reverse Proxy config' },

  // Infrastructure & DevOps / SRE
  { cmd: 'kubectl get pods -A', category: 'infra', description: 'List all Kubernetes cluster pods' },
  { cmd: 'kubectl get svc', category: 'infra', description: 'K8s Ingress and Services' },
  { cmd: 'terraform plan', category: 'infra', description: 'Terraform IaC execution plan' },
  { cmd: 'helm list -A', category: 'infra', description: 'Helm chart releases' },
  { cmd: 'ansible all -m ping', category: 'infra', description: 'Test fleet server connection' },
  { cmd: 'aws s3 ls', category: 'infra', description: 'List AWS Cloud S3 buckets' },
  { cmd: 'gcloud compute instances list', category: 'infra', description: 'List GCP Compute instances' },
  { cmd: 'ss -tulpn', category: 'infra', description: 'Show listening TCP/UDP ports' },
  { cmd: 'systemctl status app', category: 'infra', description: 'Systemd service unit health' },
  { cmd: 'htop', category: 'infra', description: 'CPU & memory resource monitor' },
  { cmd: 'df -h', category: 'infra', description: 'Disk space filesystem usage' },

  // Security & Reverse Engineering
  { cmd: 'decompile', category: 'sec', description: 'Run polyglot decompiler engine' },
  { cmd: 'sec-audit', category: 'sec', description: 'Run full anti-remote attack & sandbox audit' },
  { cmd: 'ufw status', category: 'sec', description: 'Check Termux Sandbox Firewall status' },
  { cmd: 'sshd-guard', category: 'sec', description: 'Inspect & harden SSH / Telnet remote access' },
  { cmd: 'check-tunnel', category: 'sec', description: 'Detect unauthorized Ngrok / Frp / Cloudflare tunnels' },
  { cmd: 'apktool d app.apk', category: 'sec', description: 'Decompile APK & Smali bytecode' },
  { cmd: 'jadx -d out app.apk', category: 'sec', description: 'Extract Java source code' },
  { cmd: 'adb devices', category: 'sec', description: 'Check attached Android devices' },
  { cmd: 'nmap -sV localhost', category: 'sec', description: 'Port scanning & banner audit' }
];

export function executeVirtualBoxCommand(rawCmd: string, currentDir: string, currentUsername: string = 'u0_a248', currentHostname: string = 'localhost'): CommandResult {
  const trimmed = rawCmd.trim();
  const lower = trimmed.toLowerCase();
  const tokens = trimmed.split(/\s+/);
  const root = tokens[0]?.toLowerCase();
  const sub = tokens[1]?.toLowerCase();
  const rest = tokens.slice(1).join(' ');

  // 0. CRITICAL SECURITY SHIELD: Intercept & Block Dangerous Remote Access & Exploits
  // Detect reverse shells, remote tunnels, unauthorized open ports, and data exfiltration
  const isReverseShell = lower.includes('/dev/tcp') || 
                         (lower.includes('nc ') && (lower.includes('-e') || lower.includes('-c') || lower.includes('/bin/sh') || lower.includes('/bin/bash'))) ||
                         (lower.includes('bash -i') && lower.includes('&')) ||
                         (lower.includes('sh -i') && lower.includes('&')) ||
                         lower.includes('socat exec') ||
                         lower.includes('mkfifo /tmp/') ||
                         lower.includes('python -c "import socket');

  const isDangerousTunnel = (lower.startsWith('ngrok') && !lower.includes('help')) || 
                            (lower.startsWith('frp') && !lower.includes('help')) ||
                            (lower.startsWith('bore') && !lower.includes('help')) ||
                            (lower.includes('localhost.run') || lower.includes('serveo.net') || lower.includes('teleconsole')) ||
                            (lower.startsWith('cloudflared tunnel --url') && lower.includes('0.0.0.0'));

  const isRemoteRCEPayload = lower.includes('curl ') && (lower.includes('| bash') || lower.includes('| sh') || lower.includes('| zsh')) && !lower.includes('localhost');

  if (isReverseShell) {
    return {
      lines: [
        { type: 'error', text: '🚨 [SECURITY SHIELD ACTIVATED]: BLOCKED MALICIOUS REVERSE SHELL ATTEMPT!' },
        { type: 'error', text: `Threat Signature: Unauthorized Outbound Interactive Shell Payload` },
        { type: 'output', text: '• Remote Hacker Backdoor Prevention: Blocked connection to external socket listener.' },
        { type: 'output', text: '• Sandbox Integrity: Environment running in zero-trust isolated WebContainer/Browser VM.' },
        { type: 'success', text: '✔ Status: Host system and user session protected from remote takeover.' }
      ]
    };
  }

  if (isDangerousTunnel) {
    return {
      lines: [
        { type: 'error', text: '🛡️ [SECURITY INTERCEPT]: UNAUTHORIZED REMOTE TUNNEL BLOCKED!' },
        { type: 'output', text: '• Detection: Attempted to expose internal Termux / VirtualBox ports to public internet.' },
        { type: 'output', text: '• Risk Assessment: Public ingress tunnels (Ngrok/Frp/Serveo) allow remote hackers to bypass firewalls.' },
        { type: 'success', text: '• Defense Rule: Strict Localhost Only (127.0.0.1) policy enforced. External tunnels denied.' }
      ]
    };
  }

  if (isRemoteRCEPayload) {
    return {
      lines: [
        { type: 'error', text: '⚠️ [SECURITY WARNING]: UNTRUSTED REMOTE SCRIPT PIPING BLOCKED (curl | sh)!' },
        { type: 'output', text: '• Piping raw external scripts directly into bash/sh allows Remote Code Execution (RCE).' },
        { type: 'output', text: '• Safe Practice: Download the script, inspect the source code, verify hashes, then run.' },
        { type: 'success', text: '✔ Prevented potential arbitrary malware execution on your Termux session.' }
      ]
    };
  }

  // 1. HELP & OVERVIEW
  if (root === 'help') {
    if (sub === 'se' || sub === 'dev') {
      return {
        lines: [
          { type: 'system', text: '═══ [SOFTWARE ENGINEERING COMMANDS] ═══' },
          { type: 'output', text: '  git status | log | diff | branch | commit | push | pull' },
          { type: 'output', text: '  npm | pnpm | yarn | bun (install, run build, test, audit)' },
          { type: 'output', text: '  cargo (build, run, test, check) - Rust toolchain' },
          { type: 'output', text: '  go (build, run, test, mod tidy) - Go runtime' },
          { type: 'output', text: '  python / pip / poetry (install, run, test)' },
          { type: 'output', text: '  jest / vitest / pytest / test - Unit test runners' },
          { type: 'output', text: '  eslint / prettier / ruff - Code quality & formatting' }
        ]
      };
    }
    if (sub === 'fullstack' || sub === 'web') {
      return {
        lines: [
          { type: 'system', text: '═══ [FULL-STACK DEVELOPER COMMANDS] ═══' },
          { type: 'output', text: '  curl [-I / -X POST] <url> - REST / GraphQL API tests' },
          { type: 'output', text: '  node / tsx <file> - Server-side JavaScript/TypeScript execution' },
          { type: 'output', text: '  docker (ps, images, build, run, stop, logs)' },
          { type: 'output', text: '  docker compose (up -d, down, logs -f, restart)' },
          { type: 'output', text: '  prisma / drizzle-kit (migrate dev, studio, db push)' },
          { type: 'output', text: '  psql / mysql / sqlite3 / redis-cli / mongosh' },
          { type: 'output', text: '  nginx -t | nginx -s reload - Reverse proxy & SSL manager' },
          { type: 'output', text: '  pm2 (list, status, restart, logs, monit)' },
          { type: 'output', text: '  env / export - Environment configuration & secret auditing' }
        ]
      };
    }
    if (sub === 'infra' || sub === 'devops' || sub === 'sre') {
      return {
        lines: [
          { type: 'system', text: '═══ [INFRASTRUCTURE & DEVOPS / SRE COMMANDS] ═══' },
          { type: 'output', text: '  kubectl / k8s (get pods, get svc, describe, logs, apply)' },
          { type: 'output', text: '  helm (list, install, upgrade, repo add)' },
          { type: 'output', text: '  terraform / tf (init, plan, apply, destroy, output)' },
          { type: 'output', text: '  ansible (all -m ping, playbook.yml)' },
          { type: 'output', text: '  aws / gcloud / az - Cloud CLI suites' },
          { type: 'output', text: '  ss -tulpn / netstat -plnt / lsof -i - Port and socket inspectors' },
          { type: 'output', text: '  ping / traceroute / dig / nslookup / ip a - Network stack' },
          { type: 'output', text: '  systemctl / journalctl - Linux systemd service orchestration' },
          { type: 'output', text: '  htop / top / free -m / df -h / uptime - Telemetry & metrics' }
        ]
      };
    }

    return {
      lines: [
        { type: 'system', text: '╔════════════════════════════════════════════════════════════════════════════╗' },
        { type: 'system', text: '║     Virtual Box & Termux Enterprise Command Console (Fullstack / Infra)    ║' },
        { type: 'system', text: '╚════════════════════════════════════════════════════════════════════════════╝' },
        { type: 'output', text: 'Type "help se"       - ดูคำสั่งสำหรับ Software Engineering (Git, Node, Rust, Go, Tests)' },
        { type: 'output', text: 'Type "help fullstack" - ดูคำสั่งสำหรับ Full-Stack (Docker, Postgres, Redis, Curl, Nginx)' },
        { type: 'output', text: 'Type "help infra"     - ดูคำสั่งสำหรับ Infra & DevOps (Kubernetes, Terraform, AWS, Helm)' },
        { type: 'success', text: '─ Quick Command Examples ─' },
        { type: 'output', text: '  • git status           • npm run build       • curl http://localhost:3000/api/health' },
        { type: 'output', text: '  • docker ps            • kubectl get pods -A • terraform plan' },
        { type: 'output', text: '  • psql -c "\\dt"        • redis-cli ping      • ss -tulpn' },
        { type: 'output', text: '  • decompile            • apktool d app.apk   • htop / df -h' },
        { type: 'output', text: '  • clear                • whoami              • uname -a' }
      ]
    };
  }

  // 2. GIT (Software Engineering)
  if (root === 'git') {
    if (sub === 'status' || !sub) {
      return {
        lines: [
          { type: 'output', text: 'On branch main' },
          { type: 'output', text: 'Your branch is up to date with "origin/main".' },
          { type: 'success', text: 'Changes to be committed:' },
          { type: 'success', text: '  modified:   src/components/VirtualBoxTerminalModal.tsx' },
          { type: 'success', text: '  new file:   src/utils/virtualBoxCommands.ts' },
          { type: 'output', text: 'Untracked files:' },
          { type: 'output', text: '  dist/ (ignored by .gitignore)' },
          { type: 'system', text: 'no changes added to commit (use "git add" to track)' }
        ]
      };
    }
    if (sub === 'log') {
      return {
        lines: [
          { type: 'output', text: 'commit 7b4a2f89 (HEAD -> main, origin/main)' },
          { type: 'output', text: 'Author: Lead Fullstack & Infra Engineer <engineer@hk-bridge9.internal>' },
          { type: 'output', text: 'Date:   Sat Sep 19 01:20:00 2026 +0700' },
          { type: 'system', text: '    feat(infra): integrate VirtualBox terminal with K8s, Docker & Cloud tooling' },
          { type: 'output', text: '' },
          { type: 'output', text: 'commit 3e189c44' },
          { type: 'system', text: '    feat(polyglot): expand AST bytecode decompilation and security heuristics' },
          { type: 'output', text: '' },
          { type: 'output', text: 'commit 1a09d57b' },
          { type: 'system', text: '    chore: setup Capacitor Android packaging and native build pipeline' }
        ]
      };
    }
    if (sub === 'branch') {
      return {
        lines: [
          { type: 'success', text: '* main' },
          { type: 'output', text: '  feature/k8s-infra-observability' },
          { type: 'output', text: '  feature/polyglot-decompiler-v2' },
          { type: 'output', text: '  release/v10.4-termux-arm64' }
        ]
      };
    }
    if (sub === 'diff') {
      return {
        lines: [
          { type: 'system', text: 'diff --git a/src/components/VirtualBoxTerminalModal.tsx b/src/components/VirtualBoxTerminalModal.tsx' },
          { type: 'output', text: '--- a/src/components/VirtualBoxTerminalModal.tsx' },
          { type: 'output', text: '+++ b/src/components/VirtualBoxTerminalModal.tsx' },
          { type: 'success', text: '+ import { executeVirtualBoxCommand } from "../utils/virtualBoxCommands";' },
          { type: 'success', text: '+ // Enabled fullstack & infrastructure terminal command matrix' }
        ]
      };
    }
    if (sub === 'push' || sub === 'pull') {
      return {
        lines: [
          { type: 'system', text: 'Fetching origin/main...' },
          { type: 'success', text: 'Everything up-to-date. Secure SSH tunnel established.' }
        ]
      };
    }
    if (sub === 'commit') {
      return {
        lines: [
          { type: 'success', text: '[main a104c99] commit synced: codebase formatted & verified.' },
          { type: 'output', text: ' 2 files changed, 240 insertions(+)' }
        ]
      };
    }
    return {
      lines: [
        { type: 'output', text: `git: "${sub}" is supported. Working tree clean.` }
      ]
    };
  }

  // 3. PACKAGE MANAGERS & BUILDS (Software Engineering)
  if (root === 'npm' || root === 'pnpm' || root === 'yarn' || root === 'bun') {
    if (sub === 'run' && tokens[2] === 'build') {
      return {
        lines: [
          { type: 'system', text: `> ${root} run build` },
          { type: 'output', text: 'vite v5.4.19 building for production...' },
          { type: 'output', text: 'transforming (184 modules)...' },
          { type: 'success', text: '✓ 184 modules transformed.' },
          { type: 'output', text: 'dist/index.html                   1.42 kB │ gzip:  0.64 kB' },
          { type: 'output', text: 'dist/assets/index-Dk8aL1q.css     38.12 kB │ gzip:  7.80 kB' },
          { type: 'output', text: 'dist/assets/index-B19fM3k.js    312.44 kB │ gzip: 94.20 kB' },
          { type: 'success', text: '✓ built in 410ms. Output directory ready at dist/' }
        ]
      };
    }
    if (sub === 'test' || tokens[2] === 'test') {
      return {
        lines: [
          { type: 'system', text: `> ${root} test (Vitest v1.6.0)` },
          { type: 'success', text: '✓ test/polyglot.test.ts (8 tests passed)' },
          { type: 'success', text: '✓ test/decompile.test.ts (14 tests passed)' },
          { type: 'success', text: '✓ test/security_badge.test.ts (6 tests passed)' },
          { type: 'success', text: '✓ test/virtual_box_commands.test.ts (12 tests passed)' },
          { type: 'success', text: 'Test Files  4 passed (4)' },
          { type: 'success', text: 'Tests       40 passed (40) | Duration: 620ms' }
        ]
      };
    }
    if (sub === 'install' || sub === 'i') {
      return {
        lines: [
          { type: 'system', text: `${root} install: resolving dependencies...` },
          { type: 'output', text: 'Packages: +24' },
          { type: 'success', text: '✓ Installed 24 packages in 1.1s. All 0 vulnerabilities found.' }
        ]
      };
    }
    if (sub === 'audit') {
      return {
        lines: [
          { type: 'success', text: 'found 0 vulnerabilities across 612 scanned packages' }
        ]
      };
    }
    return {
      lines: [
        { type: 'success', text: `${root} ${rest || 'version 10.4.0'} executed successfully.` }
      ]
    };
  }

  // 4. TESTING & LINTERS
  if (root === 'jest' || root === 'vitest' || root === 'pytest' || root === 'test') {
    return {
      lines: [
        { type: 'system', text: `Running ${root} unit & integration test suites...` },
        { type: 'success', text: 'PASS src/tests/ast_parser.spec.ts' },
        { type: 'success', text: 'PASS src/tests/infra_health.spec.ts' },
        { type: 'success', text: 'PASS src/tests/auth_middleware.spec.ts' },
        { type: 'output', text: 'Test Suites: 3 passed, 3 total' },
        { type: 'output', text: 'Tests:       28 passed, 28 total' },
        { type: 'success', text: 'Snapshots:   0 total | Time: 1.04s' }
      ]
    };
  }

  if (root === 'eslint' || root === 'lint' || (root === 'npx' && sub === 'eslint')) {
    return {
      lines: [
        { type: 'system', text: 'Checking codebase with ESLint & TypeScript compiler...' },
        { type: 'success', text: '✔ No linting errors or style warnings detected.' }
      ]
    };
  }

  // 5. RUST & GOLANG (Systems / SE)
  if (root === 'cargo') {
    return {
      lines: [
        { type: 'system', text: `   Compiling hk-bridge9-core v1.0.0 (/workspace/native)` },
        { type: 'output', text: '   Checking syn v2.0.48' },
        { type: 'output', text: '   Checking quote v1.0.35' },
        { type: 'success', text: '    Finished dev [unoptimized + debuginfo] target(s) in 1.45s' }
      ]
    };
  }

  if (root === 'go') {
    return {
      lines: [
        { type: 'system', text: `go ${rest}: go module verify active` },
        { type: 'success', text: 'ok  	hk-bridge9/pkg/analyzer	0.182s' },
        { type: 'success', text: 'ok  	hk-bridge9/pkg/proxy	0.094s' }
      ]
    };
  }

  // 6. CURL & API TESTING (Full-Stack)
  if (root === 'curl') {
    const url = tokens.find(t => t.startsWith('http') || t.startsWith('/')) || 'http://localhost:3000/api/health';
    return {
      lines: [
        { type: 'system', text: `HTTP/1.1 200 OK` },
        { type: 'output', text: 'Date: Sat, 19 Sep 2026 01:20:00 GMT' },
        { type: 'output', text: 'Content-Type: application/json; charset=utf-8' },
        { type: 'output', text: 'Connection: keep-alive' },
        { type: 'output', text: 'X-Powered-By: Express' },
        { type: 'output', text: '' },
        { type: 'success', text: JSON.stringify({
          status: "healthy",
          uptime: "99.98%",
          service: "hk-bridge9-fullstack-gateway",
          database: "connected (PostgreSQL 16)",
          redisCache: "online",
          k8sCluster: "ready",
          requestUrl: url
        }, null, 2) }
      ]
    };
  }

  // 7. DOCKER & CONTAINERS (Full-Stack & DevOps)
  if (root === 'docker') {
    if (sub === 'ps') {
      return {
        lines: [
          { type: 'system', text: 'CONTAINER ID   IMAGE                 COMMAND                  CREATED         STATUS         PORTS                    NAMES' },
          { type: 'output', text: '9a4f102c8e11   hkbridge9/web:latest  "node server.ts"         2 hours ago     Up 2 hours     0.0.0.0:3000->3000/tcp   hkbridge9_app' },
          { type: 'output', text: '7c8d92b34a10   postgres:16-alpine    "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:5432->5432/tcp   hkbridge9_postgres' },
          { type: 'output', text: '3f210a44e998   redis:7.2-alpine      "docker-entrypoint.s…"   2 hours ago     Up 2 hours     0.0.0.0:6379->6379/tcp   hkbridge9_redis' },
          { type: 'output', text: '1b89ef32a412   nginx:alpine          "/docker-entrypoint.…"   2 hours ago     Up 2 hours     0.0.0.0:80->80/tcp       hkbridge9_nginx_proxy' }
        ]
      };
    }
    if (sub === 'images') {
      return {
        lines: [
          { type: 'system', text: 'REPOSITORY              TAG       IMAGE ID       CREATED        SIZE' },
          { type: 'output', text: 'hkbridge9/web           latest    4f92b10a48ec   2 hours ago    184MB' },
          { type: 'output', text: 'postgres                16-alpine 91cd4a88019f   3 weeks ago    89MB' },
          { type: 'output', text: 'redis                   7.2-alpine e4108f9214b1   1 month ago    38MB' },
          { type: 'output', text: 'nginx                   alpine    8d20f92b1031   2 weeks ago    44MB' }
        ]
      };
    }
    if (sub === 'compose' || sub === 'docker-compose') {
      return {
        lines: [
          { type: 'system', text: `[+] Running 4/4` },
          { type: 'success', text: ' ✔ Network hkbridge9_default         Created' },
          { type: 'success', text: ' ✔ Container hkbridge9_postgres      Started' },
          { type: 'success', text: ' ✔ Container hkbridge9_redis         Started' },
          { type: 'success', text: ' ✔ Container hkbridge9_app           Started' },
          { type: 'output', text: 'Attaching to hkbridge9_app, hkbridge9_postgres, hkbridge9_redis...' }
        ]
      };
    }
    return {
      lines: [
        { type: 'success', text: `Docker daemon v24.0.7 running. Subcommand "${sub || 'info'}" executed successfully.` }
      ]
    };
  }

  if (root === 'docker-compose') {
    return {
      lines: [
        { type: 'system', text: `[+] Running 3/3` },
        { type: 'success', text: ' ✔ Service web            Started' },
        { type: 'success', text: ' ✔ Service db             Healthy' },
        { type: 'success', text: ' ✔ Service redis          Healthy' }
      ]
    };
  }

  // 8. DATABASES & PRISMA (Full-Stack)
  if (root === 'psql') {
    return {
      lines: [
        { type: 'system', text: 'psql (16.2 (Debian 16.2-1.pgdg120+1), server 16.2)' },
        { type: 'output', text: 'SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384)' },
        { type: 'output', text: 'Schema | Name                   | Type  | Owner' },
        { type: 'output', text: '-------+------------------------+-------+----------' },
        { type: 'output', text: 'public | users                  | table | postgres' },
        { type: 'output', text: 'public | decompiled_sessions    | table | postgres' },
        { type: 'output', text: 'public | security_audit_logs    | table | postgres' },
        { type: 'output', text: 'public | ast_signatures         | table | postgres' },
        { type: 'success', text: '(4 rows) Query execution time: 1.42ms' }
      ]
    };
  }

  if (root === 'redis-cli') {
    return {
      lines: [
        { type: 'success', text: 'PONG' },
        { type: 'output', text: 'redis-server: 7.2.4 (uptime: 14 days, memory used: 42.1M, connected_clients: 8)' }
      ]
    };
  }

  if (root === 'prisma' || (root === 'npx' && sub === 'prisma')) {
    return {
      lines: [
        { type: 'system', text: 'Environment variables loaded from .env' },
        { type: 'system', text: 'Prisma schema loaded from prisma/schema.prisma' },
        { type: 'success', text: '✔ Generated Prisma Client (v5.12.0) to ./node_modules/@prisma/client in 128ms' },
        { type: 'success', text: 'Prisma Studio is running at http://localhost:5555' }
      ]
    };
  }

  if (root === 'drizzle-kit') {
    return {
      lines: [
        { type: 'system', text: 'drizzle-kit: schema check against PostgreSQL database' },
        { type: 'success', text: '✔ 0 schema migrations needed. Database schema in sync with src/db/schema.ts' }
      ]
    };
  }

  // 9. NGINX & PM2 (Full-Stack & Infra)
  if (root === 'nginx') {
    return {
      lines: [
        { type: 'output', text: 'nginx: the configuration file /etc/nginx/nginx.conf syntax is ok' },
        { type: 'success', text: 'nginx: configuration file /etc/nginx/nginx.conf test is successful' }
      ]
    };
  }

  if (root === 'pm2') {
    return {
      lines: [
        { type: 'system', text: '┌─────┬──────────────────────┬─────────┬─────────┬──────┬────────┬────────┐' },
        { type: 'system', text: '│ id  │ name                 │ mode    │ status  │ cpu  │ memory │ uptime │' },
        { type: 'system', text: '├─────┼──────────────────────┼─────────┼─────────┼──────┼────────┼────────┤' },
        { type: 'output', text: '│ 0   │ hkbridge-api         │ cluster │ online  │ 0.8% │ 64.2MB │ 4d 12h │' },
        { type: 'output', text: '│ 1   │ hkbridge-worker      │ fork    │ online  │ 0.1% │ 38.1MB │ 4d 12h │' },
        { type: 'system', text: '└─────┴──────────────────────┴─────────┴─────────┴──────┴────────┴────────┘' }
      ]
    };
  }

  // 10. KUBERNETES & HELM (Infrastructure & DevOps)
  if (root === 'kubectl' || root === 'k8s') {
    if (sub === 'get' && tokens[2] === 'pods') {
      return {
        lines: [
          { type: 'system', text: 'NAMESPACE     NAME                               READY   STATUS    RESTARTS   AGE' },
          { type: 'output', text: 'production    hkbridge-web-74b86574f8-c99xl      1/1     Running   0          3d' },
          { type: 'output', text: 'production    hkbridge-web-74b86574f8-d42pt      1/1     Running   0          3d' },
          { type: 'output', text: 'production    hkbridge-api-68f44d877b-k28za      2/2     Running   0          3d' },
          { type: 'output', text: 'production    hkbridge-postgres-cluster-0        1/1     Running   0          18d' },
          { type: 'output', text: 'production    hkbridge-redis-sentinel-0          1/1     Running   0          18d' },
          { type: 'output', text: 'ingress-nginx ingress-nginx-controller-7bf89d   1/1     Running   0          30d' }
        ]
      };
    }
    if (sub === 'get' && tokens[2] === 'svc') {
      return {
        lines: [
          { type: 'system', text: 'NAME                 TYPE           CLUSTER-IP       EXTERNAL-IP     PORT(S)                      AGE' },
          { type: 'output', text: 'kubernetes           ClusterIP      10.96.0.1        <none>          443/TCP                      45d' },
          { type: 'output', text: 'hkbridge-web-svc     ClusterIP      10.96.142.88     <none>          3000/TCP                     12d' },
          { type: 'output', text: 'hkbridge-api-svc     ClusterIP      10.96.198.12     <none>          8080/TCP                     12d' },
          { type: 'output', text: 'ingress-controller   LoadBalancer   10.96.220.40     34.80.12.190    80:31280/TCP,443:32443/TCP   30d' }
        ]
      };
    }
    if (sub === 'top') {
      return {
        lines: [
          { type: 'system', text: 'NAME                               CPU(cores)   MEMORY(bytes)' },
          { type: 'output', text: 'hkbridge-web-74b86574f8-c99xl      24m          118Mi' },
          { type: 'output', text: 'hkbridge-api-68f44d877b-k28za      48m          240Mi' },
          { type: 'output', text: 'hkbridge-postgres-cluster-0        85m          512Mi' }
        ]
      };
    }
    return {
      lines: [
        { type: 'success', text: `kubectl context: prod-asia-east1-cluster (Kubernetes v1.29.3)` },
        { type: 'output', text: `Cluster reachable and healthy. Command "${rest}" processed.` }
      ]
    };
  }

  if (root === 'helm') {
    return {
      lines: [
        { type: 'system', text: 'NAME                 NAMESPACE    REVISION  UPDATED                               STATUS    CHART                 APP VERSION' },
        { type: 'output', text: 'hkbridge-core        production   4         2026-09-15 10:24:18.490124 +0700 ICT  deployed  hkbridge-stack-1.4.0  10.4.0' },
        { type: 'output', text: 'cert-manager         cert-system  2         2026-08-10 14:02:11.890142 +0700 ICT  deployed  cert-manager-v1.14.4  v1.14.4' },
        { type: 'output', text: 'ingress-nginx        ingress      3         2026-08-10 14:05:32.124110 +0700 ICT  deployed  ingress-nginx-4.9.1   1.9.6' }
      ]
    };
  }

  // 11. TERRAFORM & ANSIBLE (Infrastructure as Code)
  if (root === 'terraform' || root === 'tf') {
    if (sub === 'plan') {
      return {
        lines: [
          { type: 'system', text: 'Terraform used the selected providers to generate the following execution plan:' },
          { type: 'output', text: '  # google_compute_instance.hkbridge_edge will be updated in-place' },
          { type: 'output', text: '  ~ machine_type = "e2-medium" -> "e2-standard-4"' },
          { type: 'output', text: '  # google_storage_bucket.app_artifacts will be created' },
          { type: 'success', text: 'Plan: 1 to add, 1 to change, 0 to destroy.' },
          { type: 'system', text: '─────────────────────────────────────────────────────────────────────────────' },
          { type: 'success', text: 'Note: You didn\'t use the -out option to save this plan.' }
        ]
      };
    }
    if (sub === 'apply') {
      return {
        lines: [
          { type: 'system', text: 'google_storage_bucket.app_artifacts: Creating...' },
          { type: 'success', text: 'google_storage_bucket.app_artifacts: Creation complete after 3s' },
          { type: 'success', text: 'Apply complete! Resources: 1 added, 1 changed, 0 destroyed.' }
        ]
      };
    }
    return {
      lines: [
        { type: 'success', text: 'Terraform v1.7.5 on linux_arm64. IaC backend initialized: GCS / S3.' }
      ]
    };
  }

  if (root === 'ansible') {
    return {
      lines: [
        { type: 'success', text: 'node-edge-01 | SUCCESS => { "changed": false, "ping": "pong" }' },
        { type: 'success', text: 'node-edge-02 | SUCCESS => { "changed": false, "ping": "pong" }' },
        { type: 'success', text: 'node-database-01 | SUCCESS => { "changed": false, "ping": "pong" }' }
      ]
    };
  }

  // 12. CLOUD CLIS (AWS / GCP / AZURE)
  if (root === 'aws') {
    return {
      lines: [
        { type: 'system', text: 'AWS CLI v2.15.28 (Region: ap-southeast-1)' },
        { type: 'output', text: '2026-08-14 09:12:44 s3://hkbridge-apk-builds' },
        { type: 'output', text: '2026-08-14 09:15:10 s3://hkbridge-prod-backups' },
        { type: 'success', text: 'Caller Identity: arn:aws:iam::855600453103:user/devops-engineer' }
      ]
    };
  }

  if (root === 'gcloud') {
    return {
      lines: [
        { type: 'system', text: 'NAME                 ZONE            MACHINE_TYPE   PREEMPTIBLE  INTERNAL_IP    EXTERNAL_IP    STATUS' },
        { type: 'output', text: 'hkbridge-k8s-node-1  asia-east1-a    e2-standard-4               10.140.0.4     34.80.12.190   RUNNING' },
        { type: 'output', text: 'hkbridge-k8s-node-2  asia-east1-b    e2-standard-4               10.140.0.5     34.80.14.221   RUNNING' },
        { type: 'success', text: 'Project: ais-dev-7wzlvwgphydgv6xkiq5m4s (Active)' }
      ]
    };
  }

  // 13. NETWORK DIAGNOSTICS & PORTS (Infra / SRE)
  if (root === 'ss' || root === 'netstat' || root === 'lsof') {
    return {
      lines: [
        { type: 'system', text: 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process' },
        { type: 'output', text: 'tcp    LISTEN  0       511            0.0.0.0:3000          0.0.0.0:*      users:(("node",pid=1,fd=18))' },
        { type: 'output', text: 'tcp    LISTEN  0       128            0.0.0.0:5432          0.0.0.0:*      users:(("postgres",pid=42,fd=6))' },
        { type: 'output', text: 'tcp    LISTEN  0       511            0.0.0.0:6379          0.0.0.0:*      users:(("redis-server",pid=84,fd=7))' },
        { type: 'output', text: 'tcp    LISTEN  0       511            0.0.0.0:80            0.0.0.0:*      users:(("nginx",pid=102,fd=8))' },
        { type: 'output', text: 'tcp    LISTEN  0       128            0.0.0.0:22            0.0.0.0:*      users:(("sshd",pid=12,fd=3))' }
      ]
    };
  }

  if (root === 'ping') {
    const target = tokens[1] || '8.8.8.8';
    return {
      lines: [
        { type: 'system', text: `PING ${target} (${target}) 56(84) bytes of data.` },
        { type: 'output', text: `64 bytes from ${target}: icmp_seq=1 ttl=118 time=8.42 ms` },
        { type: 'output', text: `64 bytes from ${target}: icmp_seq=2 ttl=118 time=8.14 ms` },
        { type: 'output', text: `64 bytes from ${target}: icmp_seq=3 ttl=118 time=8.30 ms` },
        { type: 'success', text: `--- ${target} ping statistics ---` },
        { type: 'success', text: '3 packets transmitted, 3 received, 0% packet loss, time 2003ms rtt avg 8.286 ms' }
      ]
    };
  }

  if (root === 'dig' || root === 'nslookup') {
    return {
      lines: [
        { type: 'system', text: '; <<>> DiG 9.18.18-0ubuntu0.22.04.1-Ubuntu <<>> api.github.com' },
        { type: 'output', text: ';; ANSWER SECTION:' },
        { type: 'output', text: 'api.github.com.		60	IN	A	20.205.243.168' },
        { type: 'success', text: ';; Query time: 12 msec | SERVER: 127.0.0.53#53(127.0.0.53) | MSG SIZE: 59' }
      ]
    };
  }

  if (root === 'systemctl' || root === 'journalctl') {
    return {
      lines: [
        { type: 'system', text: '● hkbridge.service - Enterprise Microservice Gateway' },
        { type: 'output', text: '     Loaded: loaded (/etc/systemd/system/hkbridge.service; enabled; vendor preset: enabled)' },
        { type: 'success', text: '     Active: active (running) since Thu 2026-09-17 08:00:12 ICT; 2 days ago' },
        { type: 'output', text: '   Main PID: 1 (node)' },
        { type: 'output', text: '      Tasks: 18 (limit: 9412)' },
        { type: 'output', text: '     Memory: 68.4M (limit: 1.0G)' },
        { type: 'output', text: '     CGroup: /system.slice/hkbridge.service' }
      ]
    };
  }

  // 14. LINUX SYSTEM MONITORING (Infra)
  if (root === 'htop' || root === 'top') {
    return {
      lines: [
        { type: 'system', text: '  CPU[||||||||||||||||||                  28.4%]   Tasks: 42, 126 thr; 1 running' },
        { type: 'system', text: '  Mem[|||||||||||||||||||||||      1.84G/8.00G]   Uptime: 18 days, 04:12:08' },
        { type: 'system', text: '  Swp[                                 0K/2.00G]   Load average: 0.24 0.18 0.12' },
        { type: 'output', text: '  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command' },
        { type: 'success', text: '    1 root       20   0  742M  128M  18.4M S  2.4  1.6  14:20 node server.ts' },
        { type: 'output', text: '   42 postgres   20   0  512M  240M  42.0M S  1.1  3.0  08:14 postgres: cluster' },
        { type: 'output', text: '   84 redis      20   0  128M   42M  12.0M S  0.4  0.5  02:40 redis-server' },
        { type: 'output', text: '  102 nginx      20   0  184M   18M   8.4M S  0.2  0.2  01:10 nginx: worker' }
      ]
    };
  }

  if (root === 'df' || root === 'df -h') {
    return {
      lines: [
        { type: 'system', text: 'Filesystem      Size  Used Avail Use% Mounted on' },
        { type: 'output', text: '/dev/root        98G   24G   70G  26% /' },
        { type: 'output', text: 'tmpfs           4.0G     0  4.0G   0% /dev/shm' },
        { type: 'output', text: '/dev/sda1       250G   84G  154G  36% /workspace' },
        { type: 'success', text: 'All storage partitions nominal and healthy.' }
      ]
    };
  }

  if (root === 'free' || root === 'free -m') {
    return {
      lines: [
        { type: 'system', text: '               total        used        free      shared  buff/cache   available' },
        { type: 'output', text: 'Mem:            8192        1840        4820          48        1532        6304' },
        { type: 'output', text: 'Swap:           2048           0        2048' },
        { type: 'success', text: 'Memory headroom: 76.9% available for high-throughput concurrency.' }
      ]
    };
  }

  if (root === 'uptime') {
    return {
      lines: [
        { type: 'output', text: ' 01:20:00 up 18 days, 4:12,  1 user,  load average: 0.18, 0.22, 0.15' }
      ]
    };
  }

  // 15. VISUAL AST & TIME-TRAVEL DEBUGGER BRIDGE
  if (root === 'ast' || root === 'debug' || root === 'timetravel' || root === 'trace' || root === 'visualize') {
    const targetFile = sub || 'algorithm.ts';
    let sampleCode = undefined;
    if (targetFile.endsWith('.py')) {
      sampleCode = `# Python Source Tracing
def process_pipeline():
    accumulator = 1
    multiplier = 2
    for index in range(1, 5):
        accumulator = accumulator * multiplier + index
        print(f"Index {index} -> Acc: {accumulator}")
    return accumulator`;
    } else if (targetFile.endsWith('.m') || targetFile.endsWith('.c')) {
      sampleCode = `// NeXTSTEP Objective-C
int main() {
    int counter = 0;
    for (int i = 0; i < 5; i++) {
        counter += i * 2;
        printf("Step %d: Value = %d\\n", i, counter);
    }
    return 0;
}`;
    }

    return {
      lines: [
        { type: 'system', text: `[Visual AST & Time-Travel Engine Initialized]` },
        { type: 'output', text: `Parsing AST Tree for target: ${targetFile}` },
        { type: 'success', text: `Opening NeXTSTEP Visual AST & Time-Travel Debugger window...` }
      ],
      openAst: {
        filename: targetFile,
        code: sampleCode
      }
    };
  }

  // 16. LINUX SHELL BASICS
  if (root === 'pwd') {
    return {
      lines: [{ type: 'output', text: currentDir }]
    };
  }

  if (root === 'ls' || root === 'll') {
    return {
      lines: [
        { type: 'system', text: 'total 112' },
        { type: 'output', text: 'drwxr-xr-x 12 root termux  4096 Sep 19 01:20 .' },
        { type: 'output', text: 'drwxr-xr-x  4 root termux  4096 Sep 19 00:00 ..' },
        { type: 'success', text: 'drwxr-xr-x  2 root termux  4096 Sep 19 00:53 .git' },
        { type: 'success', text: 'drwxr-xr-x  3 root termux  4096 Sep 19 00:53 android' },
        { type: 'success', text: 'drwxr-xr-x  5 root termux  4096 Sep 19 01:20 src' },
        { type: 'output', text: '-rw-r--r--  1 root termux  1420 Sep 19 00:53 package.json' },
        { type: 'output', text: '-rw-r--r--  1 root termux  2390 Sep 19 00:53 server.ts' },
        { type: 'output', text: '-rw-r--r--  1 root termux   840 Sep 19 00:00 tsconfig.json' },
        { type: 'output', text: '-rw-r--r--  1 root termux   620 Sep 19 00:00 vite.config.ts' },
        { type: 'output', text: '-rw-r--r--  1 root termux  1240 Sep 19 00:00 docker-compose.yml' },
        { type: 'output', text: '-rw-r--r--  1 root termux   980 Sep 19 00:00 Dockerfile' },
        { type: 'success', text: '-rwxr-xr-x  1 root termux  1840 Sep 19 00:53 build_apk_capacitor.sh' },
        { type: 'success', text: '-rwxr-xr-x  1 root termux  2410 Sep 19 00:00 termux_install.sh' }
      ]
    };
  }

  if (root === 'cd') {
    const target = sub;
    if (!target || target === '~') {
      return {
        lines: [{ type: 'output', text: 'Navigated to home directory (~)' }],
        newDir: '~'
      };
    }
    if (target === '..' || target === '/') {
      return {
        lines: [{ type: 'output', text: 'Navigated to home directory (~)' }],
        newDir: '~'
      };
    }
    const cleanTarget = target.replace(/^\/+/, '');
    const nextDir = currentDir === '~' ? `~/${cleanTarget}` : `${currentDir}/${cleanTarget}`;
    return {
      lines: [{ type: 'output', text: `Changed directory to ${nextDir}` }],
      newDir: nextDir
    };
  }

  if (root === 'cat') {
    const file = sub || 'package.json';
    if (file.includes('package.json')) {
      return {
        lines: [
          { type: 'system', text: '{' },
          { type: 'output', text: '  "name": "hk-bridge9-polyglot-platform",' },
          { type: 'output', text: '  "version": "10.4.0",' },
          { type: 'output', text: '  "type": "module",' },
          { type: 'output', text: '  "scripts": {' },
          { type: 'success', text: '    "dev": "tsx server.ts",' },
          { type: 'success', text: '    "build": "vite build && esbuild server.ts --bundle --platform=node ...",' },
          { type: 'success', text: '    "test": "vitest run"' },
          { type: 'output', text: '  }' },
          { type: 'system', text: '}' }
        ]
      };
    }
    return {
      lines: [
        { type: 'output', text: `[Content of ${file}]: Verified clean UTF-8 text file.` }
      ]
    };
  }

  if (root === 'whoami') {
    return {
      lines: [
        { type: 'success', text: `${currentUsername} (uid=10248(${currentUsername}) gid=10248(${currentUsername}) groups=10248(${currentUsername}),3003(inet),9997(everybody)) [Authentic Termux Android Shell]` }
      ]
    };
  }

  if (root === 'id') {
    return {
      lines: [
        { type: 'success', text: `uid=10248(${currentUsername}) gid=10248(${currentUsername}) groups=10248(${currentUsername}),3003(inet),9997(everybody),50248(all_a248) context=u:r:untrusted_app_27:s0:c248,c256,c512,c768` }
      ]
    };
  }

  if (root === 'uname') {
    return {
      lines: [
        { type: 'output', text: `Linux ${currentHostname} 6.5.0-generic-arm64 #1 SMP PREEMPT Android Termux aarch64 GNU/Linux` }
      ]
    };
  }

  if (root === 'env') {
    return {
      lines: [
        { type: 'system', text: 'NODE_ENV=production' },
        { type: 'output', text: 'PORT=3000' },
        { type: 'output', text: 'TERM=xterm-256color' },
        { type: 'output', text: 'SHELL=/data/data/com.termux/files/usr/bin/bash' },
        { type: 'output', text: `USER=${currentUsername}` },
        { type: 'output', text: `HOSTNAME=${currentHostname}` },
        { type: 'output', text: 'PREFIX=/data/data/com.termux/files/usr' },
        { type: 'output', text: 'HOME=/data/data/com.termux/files/home' },
        { type: 'output', text: 'KUBECONFIG=/data/data/com.termux/files/home/.kube/config' },
        { type: 'output', text: 'DOCKER_HOST=unix:///var/run/docker.sock' },
        { type: 'success', text: 'GEMINI_API_KEY=[PROTECTED_SERVER_SECRET]' }
      ]
    };
  }

  // 16. DECOMPILE & SECURITY & MOBILE
  if (root === 'decompile') {
    return {
      lines: [
        { type: 'system', text: 'Initializing Universal Polyglot Decompiler Engine v10.4...' },
        { type: 'output', text: '[+] Extracting control flow graph & abstract syntax tree (AST)...' },
        { type: 'output', text: '[+] Cross-matching bytecode patterns (Python, Java, C++, JS, Rust)...' },
        { type: 'success', text: '[✔] Successfully disassembled 42 functions, 14 classes, and 128 AST nodes.' },
        { type: 'success', text: '[✔] Static Security Audit Score: 96/100 (Pass AA standard).' }
      ]
    };
  }

  if (root === 'apktool') {
    return {
      lines: [
        { type: 'system', text: 'I: Using Apktool 2.9.3 on app.apk' },
        { type: 'output', text: 'I: Loading resource table...' },
        { type: 'output', text: 'I: Decoding AndroidManifest.xml with resources...' },
        { type: 'output', text: 'I: Copying assets and native libs (arm64-v8a)...' },
        { type: 'success', text: 'I: Baksmaling classes.dex -> smali/... SUCCESS.' }
      ]
    };
  }

  if (root === 'jadx') {
    return {
      lines: [
        { type: 'system', text: 'INFO: starting jadx decompiler v1.4.7' },
        { type: 'output', text: '[1/3] loading app.apk' },
        { type: 'output', text: '[2/3] parsing dex classes' },
        { type: 'success', text: '[3/3] decompiled 84 classes into Java source files -> /workspace/hk-bridge9/out' }
      ]
    };
  }

  if (root === 'adb') {
    return {
      lines: [
        { type: 'output', text: 'List of devices attached' },
        { type: 'success', text: 'emulator-5554	device (Android 14.0, AARCH64 VirtualBox)' },
        { type: 'output', text: '192.168.1.104:5555	device (Physical Termux Host)' }
      ]
    };
  }

  if (root === 'nmap') {
    return {
      lines: [
        { type: 'system', text: 'Starting Nmap 7.94 ( https://nmap.org ) at 2026-09-19 01:20 ICT' },
        { type: 'output', text: 'Nmap scan report for localhost (127.0.0.1)' },
        { type: 'output', text: 'PORT     STATE SERVICE VERSION' },
        { type: 'output', text: '80/tcp   open  http    nginx 1.25.4' },
        { type: 'output', text: '3000/tcp open  http    Node.js Express framework' },
        { type: 'output', text: '5432/tcp open  pgsql   PostgreSQL DB 16.2' },
        { type: 'output', text: '6379/tcp open  redis   Redis key-value store 7.2.4' },
        { type: 'success', text: 'Service detection performed. 4 open ports found. 0 exploits accessible.' }
      ]
    };
  }

  if (root === 'python' || root === 'python3') {
    return {
      lines: [
        { type: 'output', text: 'Python 3.11.7 (main, Dec 15 2023, 12:00:00) [GCC 13.2.0 on linux]' },
        { type: 'output', text: 'Type "help", "copyright", "credits" or "license" for more information.' },
        { type: 'success', text: '>>> import os, sys; print(f"Python 3.11 VirtualBox Sandbox: {sys.platform}"); exit()' }
      ]
    };
  }

  if (root === 'node') {
    return {
      lines: [
        { type: 'output', text: 'Welcome to Node.js v20.10.0.' },
        { type: 'success', text: '> console.log("Virtual Box Node.js v20 FullStack Environment Ready"); .exit' }
      ]
    };
  }

  // 17. PROACTIVE SECURITY AUDIT & ANTI-REMOTE HIJACKING SUITE
  if (root === 'sec-audit' || root === 'security-audit' || root === 'audit-remote') {
    return {
      lines: [
        { type: 'system', text: '═════════ [TERMUX & VIRTUALBOX ANTI-REMOTE DEFENSE AUDIT] ═════════' },
        { type: 'success', text: '✔ [FIREWALL]: Ingress traffic strictly restricted to loopback (127.0.0.1).' },
        { type: 'success', text: '✔ [SSHD GUARD]: Password login disabled; unauthorized public WAN binding blocked.' },
        { type: 'success', text: '✔ [TUNNEL MONITOR]: No unauthorized reverse tunnels (Ngrok/Frp/Serveo) detected.' },
        { type: 'success', text: '✔ [ISOLATION]: Running inside zero-trust browser WebContainer runtime environment.' },
        { type: 'output', text: '--------------------------------------------------------------------------------' },
        { type: 'output', text: '  Threat Vector Assessment:' },
        { type: 'output', text: '  • Remote Shell Injection (Reverse TCP): PROTECTED (Blocked by Security Filter)' },
        { type: 'output', text: '  • Port Forwarding / Hacker Ingress: PROTECTED (Localhost Only, Port 3000 Isolated)' },
        { type: 'output', text: '  • Host File Tampering: IMMUNE (Client-side virtual sandboxing)' },
        { type: 'success', text: '🛡️ Overall Security Posture: OPTIMAL & HARDENED (Grade A+)' }
      ]
    };
  }

  if (root === 'ufw' || root === 'firewall') {
    return {
      lines: [
        { type: 'system', text: 'Status: ACTIVE (Termux Sandbox Firewall Profile)' },
        { type: 'output', text: 'To                         Action      From' },
        { type: 'output', text: '--                         ------      ----' },
        { type: 'success', text: '127.0.0.1:3000             ALLOW       127.0.0.1 (Localhost UI)' },
        { type: 'success', text: '127.0.0.1:5432             ALLOW       127.0.0.1 (Isolated Postgres DB)' },
        { type: 'error', text: '0.0.0.0/0 (Public WAN)     DENY        *.*.*.* (Anti-Hacker Ingress Inbound)' },
        { type: 'error', text: 'Any (Reverse Shell Port)   BLOCK       External Unknown IPs' },
        { type: 'success', text: 'All inbound WAN connection attempts automatically rejected.' }
      ]
    };
  }

  if (root === 'sshd-guard' || root === 'sshd') {
    return {
      lines: [
        { type: 'system', text: '[Termux OpenSSH & Remote Access Security Status]' },
        { type: 'output', text: '  • OpenSSH Server: RUNNING IN PROTECTED MODE' },
        { type: 'success', text: '  • ListenAddress: 127.0.0.1 (Loopback only - Not reachable from Internet)' },
        { type: 'success', text: '  • PasswordAuthentication: NO (Brute-force attack vector disabled)' },
        { type: 'success', text: '  • PermitRootLogin: NO' },
        { type: 'output', text: '  • MaxAuthTries: 3' },
        { type: 'success', text: '✔ Protection Active: Remote hackers on LAN/WiFi cannot connect to your Termux.' }
      ]
    };
  }

  if (root === 'check-tunnel' || root === 'tunnels') {
    return {
      lines: [
        { type: 'system', text: '[Scanning for Unauthorized Remote Forwarding Tunnels]' },
        { type: 'output', text: 'Checking process table for ngrok, frpc, bore, serveo, cloudflared...' },
        { type: 'success', text: '✔ [Clean]: 0 rogue outbound tunneling daemons found.' },
        { type: 'success', text: '✔ [Clean]: DNS leak checks show no unauthorized proxy rerouting.' },
        { type: 'output', text: 'Your Termux session is completely private to your local browser environment.' }
      ]
    };
  }

  // Fallback for custom commands
  return {
    lines: [
      { type: 'error', text: `bash: ${trimmed}: command not found.` },
      { type: 'output', text: 'Type "help", "help se", "help fullstack", or "help infra" to view all available commands.' }
    ]
  };
}
