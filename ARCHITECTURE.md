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
| JSON file | — | Lưu trữ data (setup, plans) — giai đoạn hiện tại |
| TypeScript | 5.x | Type safety |
| Be Vietnam Pro | — | Font chính, hỗ trợ tiếng Việt |

**Hiện tại không dùng:** Database, Prisma, Zod, ORM.  
**Roadmap auth:** sẽ thêm database khi chuyển sang multi-user (xem phần Mở rộng).

---

## Data Layer (hiện tại — single-user, local JSON)

Toàn bộ dữ liệu lưu trong `/src/data/`:

```
/src/data/
  setup.json     # Cấu hình instruments, checklist, equity
  plans.json     # Lịch sử các TradePlan đã tạo
```

Đọc/ghi qua **Next.js Route Handlers** (`/api/...`) dùng `fs` module của Node.

### Cấu trúc setup.json

```ts
{
  equity: number                              // Vốn tài khoản dùng chung (Gate 3)
  instruments: Record<string, {
    maxRiskPercent: number                    // Ngưỡng risk tối đa Gate 3
    checklist: ChecklistItem[]               // Danh sách rule Gate 2
  }>
}
```

### ChecklistItem — hỗ trợ 3 loại rule

```ts
type ChecklistItemType = 'checkbox' | 'number' | 'select'

interface ChecklistItem {
  id: string
  label: string
  type: ChecklistItemType
  operator?: '>=' | '<='       // chỉ dùng cho type 'number'
  threshold?: number           // chỉ dùng cho type 'number'
  options?: string[]           // chỉ dùng cho type 'select'
}
```

| Type | UI Gate 2 | Pass khi |
|---|---|---|
| `checkbox` | Click để tick | `value === true` |
| `number` | Input số | `value >= threshold` hoặc `<= threshold` (hoặc bất kỳ số nếu không có threshold) |
| `select` | Dropdown | Đã chọn một option |

---

## State Machine (Zustand)

Store duy nhất quản lý toàn bộ flow:

```ts
{
  currentGate: number
  gateStatus: Record<number, 'locked' | 'in-progress' | 'done'>
  planData: {
    instrument: string                 // Gate 0
    narrative: string                  // Gate 1
    checklist: (boolean|number|string)[] // Gate 2 — giá trị theo type
    checklistItems: ChecklistItem[]    // Gate 2 — metadata rule
    risk: { entry, stop, equity, riskPercent } // Gate 3
    preMortem: string                  // Gate 4
  }
  advance: () => void   // Chỉ chạy khi validation pass
  goBack: () => void    // Quay về gate trước
  reset: () => void     // Reset toàn bộ về gate 0
}
```

**Rule:** `advance()` chỉ chạy khi validation pass. Validation viết bằng JS thuần, không dùng Zod.

---

## Gates

| Gate | Tên | Validation |
|---|---|---|
| 0 | Chọn Instrument | `instrument !== ''` (load checklist + maxRisk theo profile) |
| 1 | Bối cảnh thị trường | `narrative.length >= 100` |
| 2 | Checklist kỹ thuật | Mỗi item pass theo type của nó |
| 3 | Tính toán rủi ro | `riskPercent <= maxRiskPercent` (đọc từ instrument profile) |
| 4 | Pre-Mortem | Input không rỗng |
| 5 | Thực thi | Hiển thị summary (kèm instrument), nút copy + lưu nhật ký |

---

## Cấu trúc thư mục

```
src/
  app/
    page.tsx                 # Redirect vào /plan
    plan/
      page.tsx               # Terminal chính — header, sidebar, gate content
    setup/
      page.tsx               # Trang cấu hình quy tắc (Rulebook Editor)
    log/
      page.tsx               # Nhật ký giao dịch — danh sách plan đã lưu
    api/
      plans/route.ts         # GET + POST plans.json
      setup/route.ts         # GET + PUT setup.json
  components/
    gates/
      Gate0Instrument.tsx    # Chọn instrument, load profile
      Gate1Narrative.tsx     # Textarea bối cảnh + char count
      Gate2Checklist.tsx     # Render rule theo type (checkbox/number/select)
      Gate3RiskCalc.tsx      # Risk calculator, load equity từ setup
      Gate4PreMortem.tsx     # Pre-mortem input
      Gate5Execution.tsx     # Summary + copy + lưu nhật ký
    layout/
      GateProgress.tsx       # Sidebar: danh sách gate + progress bar
      MentorBar.tsx          # Footer: avatar Brent + quote tiếng Việt
  store/
    guardianStore.ts         # Zustand state machine (gate 0–5)
  data/
    setup.json
    plans.json
  lib/
    validation.ts            # Validate từng gate, type ChecklistItem/ChecklistValue
    fileStore.ts             # Helper đọc/ghi JSON
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

## Trang /setup (Rulebook Editor)

Cho phép cấu hình toàn bộ tham số mà không cần sửa file JSON tay:

- **Sidebar instruments** — thêm/xóa instrument, click để chuyển profile
- **Vốn tài khoản** — dùng chung cho tất cả instruments, lưu vào root `setup.json`
- **Rủi ro tối đa/lệnh** — `maxRiskPercent` riêng mỗi instrument, Gate 3 đọc theo profile đang active
- **Checklist Gate 2** — thêm/xóa rule, chọn type, cấu hình threshold/options — riêng mỗi instrument
- Auto-save sau mỗi thao tác (PUT `/api/setup`), hiển thị trạng thái "ĐANG LƯU / ĐÃ LƯU ✓"

---

## Progress

### ✅ Done
- [x] Khởi tạo Next.js 16 + Tailwind v4 + Zustand
- [x] `guardianStore.ts` — state machine gates 0–5, `checklist` từ `boolean[]` → `(boolean|number|string)[]`
- [x] `validation.ts` — validate theo type (checkbox/number/select), export `ChecklistItem`, `ChecklistValue`
- [x] `fileStore.ts` — helper đọc/ghi JSON
- [x] `setup.json` — schema multi-instrument: `equity` root + `instruments` map
- [x] `api/plans` + `api/setup` — Route Handlers GET/POST/PUT
- [x] `GateProgress.tsx` — sidebar nav + progress bar, hiển thị instrument badge
- [x] `MentorBar.tsx` — footer Brent quotes (tiếng Việt)
- [x] `Gate0Instrument.tsx` — chọn instrument, load profile (checklist + maxRisk + equity)
- [x] `Gate1Narrative.tsx` — textarea + char count validation
- [x] `Gate2Checklist.tsx` — render UI theo type rule (checkbox / number / select)
- [x] `Gate3RiskCalc.tsx` — load equity + maxRisk từ instrument profile
- [x] `Gate4PreMortem.tsx` — pre-mortem input
- [x] `Gate5Execution.tsx` — summary (kèm instrument) + copy + lưu nhật ký
- [x] `plan/page.tsx` — terminal layout chính, nav QUY TẮC / NHẬT KÝ
- [x] `setup/page.tsx` — Rulebook Editor: sidebar instruments + edit profile từng cái
- [x] `log/page.tsx` — nhật ký: danh sách accordion, filter, risk badge
- [x] Việt hóa toàn bộ UI
- [x] Font Be Vietnam Pro — hỗ trợ tiếng Việt toàn app
- [x] CSS variables — contrast cải thiện (`--text-muted: #888`, `--border: #2e2e2e`)
- [x] Multi-instrument profiles — mỗi instrument có checklist + maxRisk riêng

### 🔜 Next
- [ ] Test toàn bộ flow end-to-end
- [ ] Responsive mobile (optional)

---

## Auth — Demo (JSON + cookie thủ công)

> Mục tiêu: chặn truy cập trực tiếp, đủ dùng cho demo. Không cần DB, không cần thư viện auth.

### Cơ chế

- `users.json` — array `{ username, password }` plaintext, thêm/sửa tay
- `POST /api/auth/login` — so khớp username + password, set cookie `tg_session=<username>`
- `POST /api/auth/logout` — xóa cookie, reset store, redirect `/login`
- `middleware.ts` — mọi request không có cookie `tg_session` → redirect `/login`
- Không dùng JWT, không dùng NextAuth, không dùng DB

### Cấu trúc thêm

```
src/
  app/
    login/
      page.tsx               # Form đăng nhập
    api/
      auth/
        login/route.ts       # POST — check users.json, set cookie
        logout/route.ts      # POST — clear cookie
  data/
    users.json               # [{ username, password }] — sửa tay
  middleware.ts              # Guard toàn bộ app trừ /login
```

### Thêm user

Sửa trực tiếp `src/data/users.json`:

```json
[
  { "username": "guardian", "password": "1234" },
  { "username": "trader2",  "password": "abcd" }
]
```

> ⚠ Plaintext password — chỉ dùng cho demo nội bộ, không expose public.
