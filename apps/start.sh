#!/usr/bin/env bash
# ============================================================
#  SIEM Blockchain Project — Start All Services
# ============================================================
# Usage: bash start.sh
#
# Starts (in separate Terminal tabs / background processes):
#   1. Hardhat local blockchain node   (port 8545)
#   2. Smart-contract deployment       (one-shot)
#   3. Log service / API               (port 5000)
#   4. Next.js frontend                (port 3000)
#
# Prerequisites:
#   • Node.js >= 18
#   • MongoDB running on localhost:27017
#   • npm install done in each app directory
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

# ── 1. Hardhat node ──────────────────────────────────────────
log "Starting Hardhat local blockchain on http://127.0.0.1:8545 ..."
cd "$APPS/blockchain"

# Install deps if needed
[ -d node_modules ] || npm install

# Launch in background; pipe logs to a file
npx hardhat node > /tmp/hardhat.log 2>&1 &
HARDHAT_PID=$!
ok "Hardhat node PID=$HARDHAT_PID  (logs → /tmp/hardhat.log)"

# Give the node a moment to boot
sleep 3

# ── 2. Deploy contract ───────────────────────────────────────
log "Deploying LogIntegrity contract to localhost ..."
npx hardhat run scripts/deploy.js --network localhost 2>&1 | tee /tmp/deploy.log
CONTRACT_ADDR=$(grep "Contract deployed to:" /tmp/deploy.log | awk '{print $NF}')

if [ -n "$CONTRACT_ADDR" ]; then
  ok "Contract deployed at $CONTRACT_ADDR"

  # Patch .env files with the fresh address
  sed -i.bak "s|^CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDR|" "$APPS/blockchain/.env"
  sed -i.bak "s|^CONTRACT_ADDRESS=.*|CONTRACT_ADDRESS=$CONTRACT_ADDR|" "$APPS/log-service/.env"
  sed -i.bak "s|^NEXT_PUBLIC_CONTRACT_ADDRESS=.*|NEXT_PUBLIC_CONTRACT_ADDRESS=$CONTRACT_ADDR|" "$APPS/frontend/.env"

  ok "Updated CONTRACT_ADDRESS in all .env files"
else
  warn "Could not parse contract address — using address from existing .env"
fi

# ── 3. Log service ───────────────────────────────────────────
log "Starting Log Service on port 5000 ..."
cd "$APPS/log-service"
[ -d node_modules ] || npm install
node src/app.js > /tmp/log-service.log 2>&1 &
LOG_PID=$!
ok "Log service PID=$LOG_PID  (logs → /tmp/log-service.log)"

# ── 4. Frontend ──────────────────────────────────────────────
log "Starting Next.js frontend on port 3000 ..."
cd "$APPS/frontend"
[ -d node_modules ] || npm install
npm run dev > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
ok "Frontend PID=$FRONTEND_PID  (logs → /tmp/frontend.log)"

# ── Summary ──────────────────────────────────────────────────
echo ""
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo -e "${GREEN}  All services started!${NC}"
echo -e "${GREEN}══════════════════════════════════════════${NC}"
echo ""
echo "  🔗 Blockchain node  → http://127.0.0.1:8545"
echo "  🖥  Log API          → http://localhost:5000/api/logs"
echo "  🌐 Dashboard        → http://localhost:3000/dashboard"
echo "  📋 Logs page        → http://localhost:3000/logs"
echo "  🚨 Alerts page      → http://localhost:3000/alerts"
echo ""
echo "  Live tails:"
echo "    tail -f /tmp/hardhat.log"
echo "    tail -f /tmp/log-service.log"
echo "    tail -f /tmp/frontend.log"
echo ""
echo -e "  ${YELLOW}Press Ctrl-C to stop all services${NC}"
echo ""

# Wait — on Ctrl-C kill all children
cleanup() {
  echo ""
  log "Stopping all services..."
  kill "$HARDHAT_PID" "$LOG_PID" "$FRONTEND_PID" 2>/dev/null || true
  ok "All services stopped."
}
trap cleanup INT TERM

wait "$LOG_PID"
