# Farewell — Budget-aware trip planner

A multi-agent trip planner built for the SerpApi Hackathon 2026 (AI Agent /
Travel & Local Discovery tracks). Given an origin, dates, a budget, and a
vibe, it plans candidate destinations, searches **live** flight and hotel
prices via the **SerpApi MCP server**, ranks destinations by real
affordability, and builds a day-by-day itinerary from real local places.

## Architecture

```
Frontend (React + Vite)          Backend (Express)              External
─────────────────────           ────────────────────           ──────────
TripForm ──POST /api/trips/plan──▶ tripGraph.invoke()
                                        │
                                        ▼
                              LangGraph.js StateGraph
                        ┌───────────┬───────────┬───────────┬───────────┐
                        │  planner  │  search    │  compare  │ itinerary │
                        │ (Groq LLM)│(SerpApi MCP)│  (logic) │(SerpApi MCP
                        │           │             │          │ + Groq LLM)│
                        └───────────┴───────────┴───────────┴───────────┘
                                        │
                                        ▼
                                 Neon Postgres (trips table)
```

**Agent flow (plan → search → compare → act):**
1. **planner** — LLM proposes 4 candidate destinations that fit the budget/vibe
2. **search** — for each candidate, calls the SerpApi MCP server's `search`
   tool with `engine: google_flights` and `engine: google_hotels` to get
   real, current prices
3. **compare** — ranks all candidates by total real cost against the budget
4. **itinerary** — pulls real local attractions (`engine: google_local`) for
   the winning destination and has the LLM sequence them into a day-by-day plan

The result (winner, full ranking, itinerary) is saved to Neon Postgres so
past trips can be revisited via `GET /api/trips`.

## Why MCP, not a raw SerpApi SDK call

Every live-data call in this project goes through SerpApi's **hosted MCP
server** (`https://mcp.serpapi.com/<key>/mcp`) via the official
`@modelcontextprotocol/sdk` client (`src/agents/mcpClient.js`). The agent
nodes never call the SerpApi REST API directly — they call one MCP `search`
tool with an `engine` parameter, exactly like any MCP-compatible client
(Claude Desktop, Cursor, etc.) would. This is what lets the same tool
definition work across every SerpApi engine (flights, hotels, local search)
without writing a custom integration per endpoint.

## Setup

### 1. Neon Postgres
Create a free project at [neon.tech](https://neon.tech), copy the pooled
connection string, and run the schema once:
```bash
cd backend
cp .env.example .env   # fill in NEON_DATABASE_URL, SERPAPI_API_KEY, GROQ_API_KEY
npm install
npm run db:init         # creates the trips table
```

### 2. Backend
```bash
cd backend
npm run dev              # http://localhost:8080
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev               # http://localhost:5173 (proxies /api to :8080)
```

### Keys you need
- **SerpApi** — [serpapi.com/manage-api-key](https://serpapi.com/manage-api-key) (free tier: 250 searches/month)
- **Groq** — [console.groq.com/keys](https://console.groq.com/keys) (free tier available; used for the planner + itinerary reasoning steps)
- **Neon** — [neon.tech](https://neon.tech) (free tier Postgres)

## API

- `POST /api/trips/plan` — `{ origin, startDate, endDate, budgetInr, vibe }` → runs the full agent graph, saves and returns the ranked trip + itinerary
- `GET /api/trips` — list recent saved trips
- `GET /api/trips/:id` — full saved trip incl. itinerary

## Notes for judges

- `origin` is currently matched against a small city→airport-code lookup
  (`src/agents/nodes/search.js`) for the hackathon demo — swap in an
  autocomplete/geocoding step for production use.
- Every price shown is live at request time — nothing is mocked or cached.
