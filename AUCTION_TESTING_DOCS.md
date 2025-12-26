# Auction Automated Testing Documentation

## Overview

Dokumentasi ini menjelaskan implementasi unit test dan integration test untuk fitur auction di backend Pluto Koi.

---

## 📁 Struktur File Test

```
src/
├── __tests__/
│   ├── unit/
│   │   └── auction.engine.test.ts    # Unit tests untuk auction domain logic
│   └── integration/
│       ├── auction.websocket.test.ts  # Integration tests untuk WebSocket
│       └── auction.service.test.ts    # Integration tests untuk database operations
├── domain/
│   └── auction.engine.ts              # Pure domain logic (testable)
└── utils/
    └── time-provider.ts               # TimeProvider untuk deterministic testing
```

---

## 🕐 TimeProvider - Deterministic Time Handling

Semua logic auction yang melibatkan waktu menggunakan `TimeProvider` interface:

```typescript
interface TimeProvider {
  now(): Date;
}
```

### Implementasi

1. **RealTimeProvider** - Untuk production, menggunakan waktu sistem
2. **MockTimeProvider** - Untuk testing, waktu dapat dikontrol

```typescript
// Di test, gunakan MockTimeProvider
const timeProvider = new MockTimeProvider(new Date("2024-12-26T10:00:00Z"));
const engine = new AuctionEngine(timeProvider);

// Advance time untuk simulasi
timeProvider.advanceMinutes(5);
```

---

## 🧪 Unit Tests

### File: `src/__tests__/unit/auction.engine.test.ts`

**Fokus:** Pure auction domain logic tanpa side effects

#### Test Categories:

1. **Auction Status**
   - NOT_STARTED, ACTIVE, IN_EXTRA_TIME, ENDED
2. **Bid Validation - Price Multiplication**

   - Valid: `startPrice + (n × priceMultiplication)` where n >= 0
   - Examples: 50000, 150000, 250000... (startPrice=50000, priceMultiplication=100000)

3. **Extra Time Extension**
   - Bid dalam extra time window → extend endTime
   - Multiple extensions
4. **Process Bid**
   - First bid, outbid, validation errors
5. **Winner Determination**

   - Dengan winner, tanpa winner

6. **Edge Cases**
   - Large amounts, equal priceMultiplication dan startPrice

### Run Unit Tests

```bash
npm run test:auction:unit
```

---

## 🔌 Integration Tests

### File: `src/__tests__/integration/auction.websocket.test.ts`

**Fokus:** WebSocket event broadcasting dan room management

#### Test Categories:

1. **Connection**
   - Client connect/disconnect
2. **Room Management**
   - Join/leave auction rooms
   - Multiple clients in same room
3. **Bid Broadcast**
   - `new_bid_placed` event ke semua clients di room
4. **Leaderboard Updates**
   - `auction_leaderboard_update` event
5. **Time Extension Events**
   - `auction_time_extended` event
6. **Auction End Events**
   - `auction_ended` event dengan/tanpa winner
7. **Room Isolation**
   - Events tidak leak antar auction rooms

### File: `src/__tests__/integration/auction.service.test.ts`

**Fokus:** Database operations dengan MongoDB in-memory

#### Test Categories:

1. **Auction Model**
   - CRUD operations
   - Text search
   - Update endTime (time extension)
2. **Auction Activity Model**
   - Create bid
   - Get highest bid
   - Get participants
   - User bid history
   - Unique participants count
3. **Bid Flow**
   - Complete bid flow (outbid scenario)
   - Multiple bids from same user
4. **Statistics**
   - Aggregate calculations (avg, min, max)

### Run Integration Tests

```bash
npm run test:auction:integration
```

---

## 🚀 Running Tests

### All Auction Tests

```bash
npm run test:auction
```

### Unit Tests Only

```bash
npm run test:auction:unit
```

### Integration Tests Only

```bash
npm run test:auction:integration
```

### With Coverage

```bash
npm run test:coverage -- --testPathPatterns=auction
```

### Watch Mode

```bash
npm run test:watch -- --testPathPatterns=auction
```

---

## 📐 Test Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Unit Tests                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              AuctionEngine                             │  │
│  │  • Pure domain logic                                   │  │
│  │  • MockTimeProvider for deterministic time             │  │
│  │  • NO: Database, HTTP, WebSocket                       │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   Integration Tests                          │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │  WebSocket Tests    │  │   Database Tests            │  │
│  │  • Room management  │  │   • Auction Model CRUD      │  │
│  │  • Event broadcast  │  │   • Activity Model CRUD     │  │
│  │  • Multi-client     │  │   • Statistics              │  │
│  │  • Room isolation   │  │   • Bid flow                │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚠️ Important Rules

### ❌ DILARANG di Unit Tests:

- `setTimeout`, `sleep`, real delays
- `Date.now()` langsung di logic
- Database operations
- HTTP/WebSocket calls

### ✅ WAJIB di Unit Tests:

- Inject `TimeProvider`
- Pure function logic
- Deterministic behavior

### ❌ DILARANG di Integration Tests:

- Testing auction logic ulang (sudah di unit test)

### ✅ WAJIB di Integration Tests:

- Test wiring & event flow
- Test database operations
- Test multi-client scenarios

---

## 🔧 Dependencies

Pastikan dev dependencies terinstall:

```bash
npm install
```

Required dev dependencies:

- `jest` - Test runner
- `ts-jest` - TypeScript support
- `mongodb-memory-server` - In-memory MongoDB
- `socket.io-client` - WebSocket client for testing

---

## 📝 Adding New Tests

### Template Unit Test

```typescript
// UNIT TEST: [description]
// - [precondition 1]
// - [precondition 2]
// - [expected result]
it("should [expected behavior]", () => {
  const auction = createTestAuction({ ... });

  const result = engine.someMethod(auction, ...);

  expect(result).toBe(expected);
});
```

### Template Integration Test

```typescript
// INTEGRATION TEST: [description]
// - [setup step]
// - [action]
// - [expected result]
it("should [expected behavior]", async () => {
  // Setup
  const client = await createClient("user-1");

  // Action
  client.emit("some_event", payload);

  // Assert
  const response = await waitForEvent(client, "response_event");
  expect(response.field).toBe(expected);
});
```

---

## 🎯 Coverage Goals

| Layer                         | Target Coverage |
| ----------------------------- | --------------- |
| Unit Tests (AuctionEngine)    | 100%            |
| Integration Tests (WebSocket) | 90%+            |
| Integration Tests (Database)  | 90%+            |

---

> **Rule of Thumb:**
>
> - Jika unit test gagal → STOP deploy
> - Integration test hanya memastikan wiring, bukan logic
