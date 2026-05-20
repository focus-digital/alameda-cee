# Demo Login Page — Explanation, Gaps & Test Plan

---

## High-Level Explanation

`DemoLoginPage` is a demo-environment-only page at the route `/demo-login`. It has three distinct responsibilities:

### 1. Admin User Selection & Login

- On mount, it calls `getDemoUsers()` (which hits `GET /demo/users`) via React Query. The full user list is then filtered to only `UserRole.ADMIN` users using `useMemo`.
- A `useEffect` auto-selects the first admin in the list by calling `setValue('email', adminUsers[0].email)` — but only if no email has been selected yet (guarded by `selectedEmail`).
- The user sees a `<Select>` dropdown populated with admin names (first + last). The dropdown is disabled while the list is still loading (empty array).
- The login button (`Login as selected admin`) is disabled until `selectedEmail` has a value (controlled via `useWatch`).
- The password is hardcoded as `secret123` in a hidden `<input>`. On submit, `login({ email, password })` is called from the `useAuth` hook, which in turn hits the real auth API.

### 2. Navigation Shortcut

- A "Go to Caregiver Home" button calls `navigate('/')`, taking the user to the public-facing caregiver home without requiring login. This is purely for demo convenience.

### 3. Reset Demo Data Flow

- A red "Reset Demo Data" button opens a USWDS `<Modal>` using a `ref` (`resetModalRef`). The modal is `forceAction`, meaning the user must explicitly click one of the two footer buttons — they cannot dismiss it by clicking outside.
- Inside the modal:
  - **Cancel** — a `<ModalToggleButton>` that calls `resetModalRef.current?.toggleModal()` to close without any side effects.
  - **Yes, reset data** — calls `handleResetConfirm()`, which calls `resetMutation.mutateAsync()`.
- `resetMutation` (a `useMutation`):
  1. Calls `resetDemoData()` → `POST /demo/reset`
  2. Invalidates the `demo-users` React Query cache (so the dropdown refreshes)
  3. Invalidates the `me` cache (so any logged-in session is cleared)
  4. On success: closes the modal via `resetModalRef.current?.toggleModal()`
  5. On error: `handleResetConfirm` catches it, logs to console, and calls `alert('Reset failed. Please try again.')`
- While the mutation is in-flight, the confirm button shows `"Resetting…"` and is disabled.

---

## Gaps & Regression Risks

| # | Gap | Regression Risk |
|---|-----|-----------------|
| 1 | Reset modal is never opened or confirmed in tests | Any breakage in the `modalRef` wiring or `forceAction` behavior goes undetected |
| 2 | `resetDemoData()` call is never asserted | Could silently stop calling the API after a refactor and CI would still pass |
| 3 | Error path in `handleResetConfirm` is untested | The `try/catch` + `alert()` branch is dead code from CI's perspective |
| 4 | `resetMutation.isPending` UI state is untested | "Resetting…" label and disabled-during-submit behavior could silently regress |
| 5 | Cancel button in modal is untested | `ModalToggleButton` wiring could break without any test catching it |
| 6 | Login button disabled state is never asserted | The `disabled={!selectedEmail}` guard could be removed without a test failing |
| 7 | Non-admin users are not filtered | The `UserRole.ADMIN` filter has zero test coverage; a backend schema change exposing non-admins would not be caught |
| 8 | "Go to Caregiver Home" navigation is untested | The button could stop working or be removed with no test failing |
| 9 | Auto-select is only tested implicitly | No explicit assertion that the dropdown defaults to the first admin after load |

---

## Existing Tests — Comments to Add

The 3 existing tests in
`frontend/tests/pages/demo-login-page.test.tsx`
need two comments above each `it(...)` block:
1. The test type
2. A plain-English summary anyone can understand

---

**Test 1** — `prefills admin list and logs in selected admin`
```ts
// Type: Component integration test
// What this checks: When the page loads, it fetches the list of admins from the server and fills the
// dropdown automatically. This test makes sure that selecting an admin from the list and clicking
// "Login" actually sends their email and the demo password to the login service.
it('prefills admin list and logs in selected admin', ...)
```

---

**Test 2** — `can select different admin from dropdown`
```ts
// Type: Component integration test
// What this checks: The dropdown lets you switch between multiple admins. This test makes sure that
// when you pick a different admin and click "Login", the correct admin's email is sent — not the
// default or the previously selected one.
it('can select different admin from dropdown', ...)
```

---

**Test 3** — `shows reset demo data button`
```ts
// Type: Render / smoke test
// What this checks: A basic sanity check that the "Reset Demo Data" button is visible on the page.
// It does not test what happens when the button is clicked — it only confirms the button exists.
it('shows reset demo data button', ...)
```

---

## New Tests to Add

All tests go inside the existing `describe('DemoLoginPage')` block in:
`frontend/tests/pages/demo-login-page.test.tsx`

### Test 1 — Reset modal: confirm flow
> **Integration test** — exercises the full modal open → async mutation → close cycle across component state, `useMutation`, and the `modalRef` API together.
- Render the page at `/demo-login`
- Wait for dropdown options to load
- Click "Reset Demo Data" → assert modal heading is visible
- Click "Yes, reset data" → assert `mockReset` was called once
- Assert the modal heading is no longer visible (modal closed on success)

### Test 2 — Reset modal: cancel flow
> **Integration test** — verifies the cancel path through the modal: the `ModalToggleButton` must correctly call `toggleModal` and no side-effect mutation should fire.
- Render the page
- Open the reset modal
- Click "Cancel" → assert `mockReset` was NOT called
- Assert modal closes (heading no longer visible)

### Test 3 — Reset modal: error path
> **Integration test** — exercises the `try/catch` error boundary inside `handleResetConfirm`; ensures the failure message reaches the user via `alert` when the API rejects.
- Set `mockReset.mockRejectedValue(new Error('boom'))`
- Spy on `window.alert`
- Open the modal and click "Yes, reset data"
- Assert `window.alert` was called (failure message surfaced to user)
- Assert `mockReset` was called (the attempt was made)

### Test 4 — Login button disabled when no email is selected
> **Unit test** — verifies a single conditional render rule: `disabled={!selectedEmail}` on the submit button based on `useWatch` form state.
- Render the page before data loads (or with an empty user list)
- Assert the login button `toBeDisabled()`
- After selecting an admin, assert the button is no longer disabled

### Test 5 — Non-admin users are filtered out of the dropdown
> **Unit test** — validates the `useMemo` filter that strips `UserRole.USER` entries from the options list; catches a silent regression if the filter condition changes.
- Add a `UserRole.USER` entry to the `demoUsers` fixture
- Assert that user's name does NOT appear as a `<option>` in the dropdown

### Test 6 — "Go to Caregiver Home" navigates to `/`
> **Integration test** — tests the interaction between the button's `onClick` handler and React Router's `navigate('/')`, requiring the router context to verify the route change.
- Render the page
- Click "Go to Caregiver Home"
- Assert the current route becomes `/` (check that caregiver home content renders, or inspect `history.location.pathname`)

### Test 7 — Auto-select defaults to first admin after load
> **Unit test** — verifies the `useEffect` that calls `setValue('email', adminUsers[0].email)` when data arrives; ensures the form state is set without user interaction.
- Render the page
- After data loads, assert the `<select>` element's value equals `adminUsers[0].email` with no manual interaction

---

## Verification

After adding tests, run:
```
cd /Users/Woodlandadmin/workspace/alameda-cee/frontend
npx vitest run tests/pages/demo-login-page.test.tsx
```
All 10 tests (3 existing + 7 new) should pass with no modifications to existing tests.
