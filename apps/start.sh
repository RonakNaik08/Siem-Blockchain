#!/usr/bin/env bash
# ============================================================
#  SIEM 2.0 Blockchain Project — Start All Services
# ============================================================
#
# Starts (in separate background processes):
#   1. Hardhat Node (8545)
#   2. Contract Deployer (One-shot)
#   3. Log Service (DB/Blockchain Persistence - 4000)
#   4. API Gateway (WebSockets / UI Relay - 5000)
#   5. AI Threat Service (Scoring - 5005)
#   6. Response Service (Orchestration - 5006)
#   7. Next.js Frontend (3000)
# ============================================================

set -e

APPS="$(cd "$(dirname "$0")" && pwd)"

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

log() { echo -e "${CYAN}[start.sh]${NC} $*"; }
ok()  { echo -e "${GREEN}✅ $*${NC}"; }
warn(){ echo -e "${YELLOW}⚠  $*${NC}"; }

# Cleanup on exit
cleanup() {
  echo ""
  log "Stopping all services..."
  kill $HARDHAT_PID $LOG_PID $GATEWAY_PID $AI_PID $RESP_PID $FRONTEND_PID 2>/dev/null || true
  ok "All services stopped."
}
trap cleanup INT TERM

# ── 1. Hardhat Node ──────────────────────────────────────────
log "Starting Hardhat node on http://127.0.0.1:8545 ..."
cd "$APPS/blockchain"
[ -d node_modules ] || npm install
npx hardhat node > /tmp/hardhat.log 2>&1 &
HARDHAT_PID=$!
sleep 2

# ── 2. Deploy Contract ───────────────────────────────────────
log "Deploying LogIntegrity contract..."
npx hardhat run scripts/deploy.js --network localhost > /tmp/deploy.log 2>&1
CONTRACT_ADDR=$(grep "Contract deployed to:" /tmp/deploy.log | awk '{print $NF}')

if [ -n "$CONTRACT_ADDR" ]; then
  ok "Contract at $CONTRACT_ADDR"
  # Patch .env files
  sed -i.bak "s|^CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDR|" "$APPS/blockchain/.env"
  sed -i.bak "s|^CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDR|" "$APPS/log-service/.env"
  sed -i.bak "s|^NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDR|" "$APPS/frontend/.env"
else
  warn "Failed to parse deployment address. Using existing address."
fi

# ── 3. Log Service (4000) ────────────────────────────────────
log "Starting Log Service (Persistence) on port 4000..."
cd "$APPS/log-service"
[ -d node_modules ] || npm install
node src/app.js > /tmp/log-service.log 2>&1 &
LOG_PID=$!

# ── 4. API Gateway (5000) ────────────────────────────────────
log "Starting API Gateway on port 5000..."
cd "$APPS/gateway"
[ -d node_modules ] || npm install
node src/server.js > /tmp/gateway.log 2>&1 &
GATEWAY_PID=$!

# ── 5. AI Threat Service (5005) ──────────────────────────────
log "Starting AI Threat Service on port 5005..."
cd "$APPS/ai-threat-service"
[ -d node_modules ] || npm install
node src/index.js > /tmp/ai-service.log 2>&1 &
AI_PID=$!

# ── 6. Response Service (5006) ───────────────────────────────
log "Starting Response Orchestrator on port 5006..."
cd "$APPS/response-service"
[ -d node_modules ] || npm install
node src/index.js > /tmp/response-service.log 2>&1 &
RESP_PID=$!

# ── 7. Frontend (3000) ───────────────────────────────────────
log "Starting Frontend on port 3000..."
cd "$APPS/frontend"
[ -d node_modules ] || npm install
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!

ok "══════════════════════════════════════════"
ok "  SIEM 2.0 ECOSYSTEM ACTIVE"
ok "══════════════════════════════════════════"
echo ""
echo "  🔗 Blockchain     → http://127.0.0.1:8545"
echo "  💾 Persistence    → http://localhost:4000"
echo "  🌐 Gateway (UI)   → http://localhost:5000"
echo "  🧠 AI Engine      → http://localhost:5005"
echo "  🛡  SOAR Response  → http://localhost:5006"
echo "  📊 Dashboard      → http://localhost:3000/dashboard"
echo ""
echo "  Tails:"
echo "    tail -f /tmp/log-service.log"
echo "    tail -f /tmp/gateway.log"
echo "    tail -f /tmp/ai-service.log"
echo ""

wait "$LOG_PID"
