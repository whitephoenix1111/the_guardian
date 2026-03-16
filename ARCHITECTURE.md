# The Guardian — Architecture

Công cụ cá nhân ép buộc quy trình lập kế hoạch giao dịch theo phong cách Brent Donnelly.
Người dùng phải đi qua 6 Gate theo thứ tự. Không pass Gate trước → không mở Gate sau.

---

## Stack

| Thứ | Version | Vai trò |
|---|---|---|
| Next.js | 16.1.6 | Framework + App Router |
| Tailwind CSS | v4 | Style (theme: Black & Lime) |
| Zustand | 5.x | State machine quản lý gates |
| JSON file | — | Lưu trữ data (per-user) |
| TypeScript | 5.x | Type safety |
| Be Vietnam Pro | — | Font chính, hỗ trợ tiếng Việt |

**Hiện tại không dùng:** Database, Prisma, Zod, ORM.
**Roadmap auth:** sẽ thêm database khi chuyển sang multi-user thật sự (xem phần Mở rộng).

---

## Data Layer (single-user per folder, local JSON)

Mỗi user có thư mục riêng trong `/src/data/users/<username>/`:

```
/src/data/
  users.json               # Danh sách tài khoản (global)
  users/
    <username>/
      setup.json           # Cấu hình instruments + checklists của user đó
      plans.json           # Lịch sử TradePlan của user đó
```

Đọc/ghi qua **Next.js Route Handlers** (`/api/...`) dùng `fs` module của Node.
Username được inject bởi `middleware.ts` vào header `x-username` sau khi xác thực cookie.

---

## Schema Data (target)

### Quan hệ giữa các thực thể

```
users
├── id (PK)
├── username (UK)
├── password
└── created_at
     │
     ├──1────────1── user_settings
     │               ├── id (PK)
     │               ├── user_id (FK)
     │               ├── equity
     │               └── updated_at
     │
     └──1────────∞── instruments
                     ├── id (PK)
                     ├── user_id (FK)
                     ├── name
                     └── created_at
                          │
                          └──1────────∞── checklists
                                          ├── id (PK)
                                          ├── instrument_id (FK)
                                          ├── name              ← "Trade thường", "Trade tin"...
                                          ├── max_risk_percent  ← mỗi checklist có ngưỡng riêng
                                          └── created_at
                                               │
                                               ├──1────────∞── checklist_items
                                               │               ├── id (PK)
                                               │               ├── checklist_id (FK)
                                               │               ├── label
                                               │               ├── type
                                               │               ├── operator
                                               │               ├── threshold
                                               │               ├── options
                                               │               └── sort_order
                                               │
                                               └──1────────∞── plans
                                                               ├── id (PK)
                                                               ├── checklist_id (FK)
                                                               ├── status
                                                               └── created_at
                                                                    │
                                                                    ├──1────1── plan_details
                                                                    │           ├── id (PK)
                                                                    │           ├── plan_id (FK)
                                                                    │           ├── narrative
                                                                    │           ├── pre_mortem
                                                                    │           ├── entry
                                                                    │           ├── stop
                                                                    │           ├── equity_snapshot
                                                                    │           └── risk_percent
                                                                    │
                                                                    └──1────∞── plan_checklist_snapshot
                                                                                ├── id (PK)
                                                                                ├── plan_id (FK)
                                                                                ├── item_label
                                                                                ├── item_type
                                                                                └── value
```

### Ghi chú thiết kế

- **1 user → nhiều instrument**: mỗi instrument thuộc về đúng 1 user.
- **1 instrument → nhiều checklist**: ví dụ EUR/USD có "Trade thường" và "Trade tin", mỗi cái là bộ luật riêng với `max_risk_percent` riêng.
- **1 checklist → nhiều checklist_item**: các rule cụ thể trong bộ đó.
- **1 plan → gắn với 1 checklist cụ thể**: plan là log ghi lại trade hôm đó theo bộ luật nào.
- **`plan_checklist_snapshot`**: snapshot toàn bộ câu trả lời checklist tại thời điểm lưu plan — tránh mất dữ liệu khi rule bị sửa sau này.
- **`plan_details`**: tách riêng để query danh sách log không cần kéo narrative dài.
- **`plans` chỉ chứa `checklist_id`**: không cần `instrument_id` hay `user_id` riêng vì đã traverse được qua `checklist → instrument → user`.

### Cấu trúc setup.json (target — per user)

```ts
{
  equity: number
  instruments: Record<string, {           // key = instrument name, VD: "EUR/USD"
    id: string
    checklists: Array<{
      id: string
      name: string                        // "Trade thường", "Trade tin"...
      maxRiskPercent: number
      items: ChecklistItem[]
    }>
  }>
}
```

### Cấu trúc setup.json (hiện tại — cần migrate)

```ts
{
  equity: number
  instruments: Record<string, {
    maxRiskPercent: number
    checklist: ChecklistItem[]            // ← flat, chưa có multi-checklist
  }>
}
```

### ChecklistItem

```ts
type ChecklistItemType = 'checkbox' | 'number' | 'select'

interface ChecklistItem {
  id: string
  label: string
  type: ChecklistItemType
  operator?: '>=' | '<='
  threshold?: number
  options?: string[]
}
```

---

## State Machine (Zustand)

Store duy nhất quản lý toàn bộ flow:

```ts
{
  currentGate: number
  gateStatus: Record<number, 'locked' | 'in-progress' | 'done'>
  planData: {
    instrument: string                    // Gate 0 — tên instrument
    checklistId: string                   // Gate 0 — id checklist được chọn (mới)
    checklistName: string                 // Gate 0 — tên checklist để hiển thị (mới)
    narrative: string                     // Gate 1
    checklist: (boolean|number|string)[]  // Gate 2 — giá trị theo type
    checklistItems: ChecklistItem[]       // Gate 2 — metadata rule
    risk: { entry, stop, equity, riskPercent } // Gate 3
    preMortem: string                     // Gate 4
  }
  advance: () => void
  goBack: () => void
  reset: () => void
}
```

---

## Gates

| Gate | Tên | Validation |
|---|---|---|
| 0 | Chọn Instrument + Checklist | `instrument !== ''` và `checklistId !== ''` |
| 1 | Bối cảnh thị trường | `narrative.length >= 100` |
| 2 | Checklist kỹ thuật | Mỗi item pass theo type |
| 3 | Tính toán rủi ro | `riskPercent <= maxRiskPercent` (đọc từ checklist được chọn) |
| 4 | Pre-Mortem | Input không rỗng |
| 5 | Thực thi | Summary + copy + lưu nhật ký |

### Gate 0 — UI mới (1 bước, chọn cả instrument lẫn checklist)

```
[ EUR/USD ]  ←── click để chọn instrument
  ├── Trade thường   (max 1%)   ○  ←── click để chọn checklist
  └── Trade tin      (max 0.5%) ●  ←── đang chọn

[ GBP/USD ]
  └── Trade thường   (max 1%)   ○
```

---

## Cấu trúc thư mục

```
src/
  app/
    page.tsx
    plan/
      page.tsx
    setup/
      page.tsx                 # Rulebook Editor — cần refactor cho multi-checklist
    log/
      page.tsx
    api/
      plans/route.ts           # GET + POST — per user
      setup/route.ts           # GET + PUT — per user
      auth/
        login/route.ts         # POST — check users.json, set cookie, init user data
        logout/route.ts        # POST — clear cookie
  components/
    gates/
      Gate0Instrument.tsx      # Chọn instrument + checklist — cần refactor
      Gate1Narrative.tsx
      Gate2Checklist.tsx
      Gate3RiskCalc.tsx        # Load maxRisk từ checklist — cần cập nhật
      Gate4PreMortem.tsx
      Gate5Execution.tsx
    layout/
      GateProgress.tsx
      MentorBar.tsx
  store/
    guardianStore.ts           # Thêm checklistId, checklistName — cần cập nhật
  data/
    users.json
    users/
      <username>/
        setup.json
        plans.json
  lib/
    validation.ts
    fileStore.ts               # readUserJSON, writeUserJSON, userFileExists
  middleware.ts                # Inject x-username header
```

---

## UI Layout

```
[ Header: ◈ THE GUARDIAN  TERMINAL  |  QUY TẮC  NHẬT KÝ  GATE X/5 ]
────────────────────────────────────────────────────────────────────
[ Sidebar: tiến độ + gate list ]  |  [ Main: Active Gate UI       ]
────────────────────────────────────────────────────────────────────
[ Footer: Avatar BD  |  Brent quote  |  Châm ngôn giao dịch       ]
```

Theme: nền đen `#0d0d0d`, accent lime `#a3e635`.
Font: **Be Vietnam Pro** — subset `latin` + `vietnamese`, weight 400/500/600/700.

---

## Auth — Demo (JSON + cookie thủ công)

- `users.json` — array `{ username, password }` plaintext
- `POST /api/auth/login` — so khớp, set cookie `tg_session=<username>`, init user data nếu chưa có
- `POST /api/auth/logout` — xóa cookie
- `middleware.ts` — guard toàn app, inject `x-username` header vào mọi request đã auth

### Thêm user

```json
[
  { "username": "guardian", "password": "1234" },
  { "username": "trader2",  "password": "abcd" }
]
```

> ⚠ Plaintext password — chỉ dùng cho demo nội bộ.