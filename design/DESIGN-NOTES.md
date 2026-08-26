# Design Reference — Corrective Action Tracker ("Meridian HR")

From the Claude design. Build screens to match this.

## Colours (from the Design System screen)
- Ink      #16202E  (darkest — dark panels, main headings)
- Body     #33415A  (body text)
- Muted    #7A8698  (secondary/metadata text)
- Line     #E3E6EC  (borders / dividers)
- Canvas   #F5F6F8  (page background)
- Primary  #2D5BD6  (primary buttons, links, focus ring)
- Pending  #8A5A00  (Submitted / pending — amber)
- Review   #1E3F9E  (Under Review — dark blue)
- Approved #05714F  (Approved / Completed — green)
- Notified #5B3BB5  (Employee Notified — purple)
- InProgress #0B6072 (Action In Progress — teal)
- Dismissal #B3261E  (Dismissal / Rejected — red)

## Typography
- Font: Public Sans (UI). IBM Plex Mono for case codes, dates, levels (e.g. CA-2026-0143).
- Display 30 / line-height 1.2 (page titles)
- Section heading 20 / 1.3
- Body 15 / 1.65
- Secondary 13 (metadata, helper, table subtitles)

## Buttons
- Primary (blue #2D5BD6, white text), Secondary (white, border), Approve (green), Reject (red outline), Disabled (grey).
- Focus state: 2px #2D5BD6 ring (accessibility).

## Status badges (dot + label, coloured)
Draft(grey) · Submitted(amber) · Under Review(blue) · Approved(green) · Employee Notified(purple) · Action In Progress(teal) · Completed(green) · Closed(grey)

## App shell (all role screens)
- Left sidebar: "Meridian HR" logo (blue square + name); nav links (My cases, New incident, Case detail, Action ladder, Design system); bottom = user card (e.g. "Priya Nandra / Shift Manager") + a "Switch role" button.
- Main area on Canvas background. Small uppercase role label (e.g. "SHIFT MANAGER") above each page title.

## Screens (Manager role — designed)
1. Sign in / role picker — dark left panel with "Corrective Action Tracker" title + 3 bullets; right panel "Sign in — choose the workspace that matches your role" with 4 cards: Manager, HR, Employee, Admin (each a card with initials avatar + name + one-line description + arrow).
2. My cases (dashboard) — title "Cases" + "New incident" button; 4 stat cards (Pending review, Approved, Closed this month, At level 4 or 5); a "Cases you logged" table with filter tabs (All / Needs action / Approved / Closed) and columns CASE, EMPLOYEE (name + dept), VIOLATION, LEVEL (e.g. "3rd Suspension 1 · 3d"), STATUS (badge), UPDATED (date).
3. Log an incident (New incident) — left: form (Employee dropdown, Violation dropdown + "Rulebook code ATT-01", Date of incident, "What happened" textarea, Submit for HR review / Save draft). Right: "Recommended action" panel showing the level (L3 Suspension 1) + a plain-English explanation + "View the full ladder →". Note on screen: "The action is set by the rulebook, not the manager."
4. Corrective action ladder (STAR SCREEN) — dark header panel: "MARCUS LEE · LATE ATTENDANCE / Level 3 — Suspension 1" + explanation + "CURRENT LEVEL 3/5". Then a row of 5 level cards (First Warning SERVED, Final Written Warning SERVED, Suspension 1 CURRENT[highlighted], Suspension 2 IF REPEATED, Dismissal IF REPEATED) each with description + occurrence label. Below: "Why this level" (numbered reasons) + "This employee's record for Late attendance" (dated occurrences with level tags; note: occurrences older than 12 months fall out of the count — TIME DECAY).
5. Design system — the colours/typography/buttons/badges reference above.

## FULL DESIGN — all 4 roles (shared 2026-08-17)

Every role shares the same app shell (sidebar with role-specific nav + user card at bottom + "Switch role"), and shares three screens: **Case detail** (audit trail), **Action ladder**, **Design system**. The uppercase role label sits above each page title.

### Shared: Case detail
Two columns. LEFT card: case code (CA-2026-0143) + status badge; a row of status pills (Draft, Submitted, Under Review, Approved, Employee Notified, Action In Progress, Completed, Closed) with the current one highlighted and later ones greyed; a 2-col field grid (Employee, Department, Violation, Occurrence "3rd in policy window", Date of incident, Submitted by); "Manager's account" paragraph. RIGHT card: "Audit trail" — a vertical timeline; each entry = date (mono) + coloured dot + bold title + description. Entries: Case created, Submitted for review (system applied rulebook ATT-01 → level 3), Under review (assigned to HR), Approved (reviewer note), Employee notified, Action scheduled. → this is the `case_events` table.

### MANAGER (Priya Nandra · Shift Manager) — nav: My cases, New incident, Case detail, Action ladder, Design system
- My cases (dashboard): stat cards + cases table. [BUILT]
- New incident: form + live recommendation. [BUILT]
- Case detail, Action ladder [BUILT], Design system.

### HR (Dana Whitfield · HR Business Partner) — nav: All cases, Review queue, Case detail, Action ladder, Design system
- All cases: same layout as manager dashboard (4 stat cards + full table) showing ALL cases.
- Review queue / Review case: LEFT card = case info grid + Manager's account. RIGHT = "System recommendation" (L3 Suspension 1 + explanation) + "Reviewer note" textarea ("Optional. Required when rejecting.") + **Approve** (green) / **Reject & return** (red outline); below, "Prior record · <employee>" timeline with Level tags.
- Case detail, Action ladder, Design system.

### EMPLOYEE (Marcus Lee · Warehouse Operative) — nav: My notice, Case detail, Action ladder, Design system
- My notice: title "Your notice / Issued by HR on <date>". LEFT card: amber "Action required — acknowledge by <date>" banner; case code + issued date; "Notice of Corrective Action" heading; a plain-English notice paragraph; the L<n> action card; text explaining acknowledgement; **Acknowledge notice** (blue) / **Add a response** buttons. RIGHT card: "Where this sits on the ladder" — vertical list of the 5 levels with Served / "You are here"(highlighted) states + "See the full explanation →"; plus a small "Questions about this notice go to your HR partner…" card.
- Case detail, Action ladder, Design system.

### ADMIN (Aziz Rahman · System Administrator) — nav: All cases, Rulebook, Action ladder, Design system
- All cases: same table (all cases).
- Company rulebook: "Each violation maps to an action for offences 1 through 5." Header: "Policy set FY26 · Effective 1 Jan 2026 · Last edited by …" + "Version history" + "Add violation" buttons. A TABLE: columns VIOLATION (name + code e.g. "ATT-01 · resets after 12 months"), 1ST, 2ND, 3RD, 4TH, 5TH (each cell = a coloured action pill), + Edit link per row. Rows: Late attendance, Unauthorised absence, Safety breach, Misconduct, Insubordination, Damage to equipment. Footer note about policy versioning. → this is the `rules` table, editable.
- Action ladder, Design system.

## Build status vs the full design (2026-08-17)
BUILT & matching: sign-in role picker, Manager dashboard, Manager log-incident (+ live rules engine, drafts), Manager action ladder (static current level).
BUILT but SIMPLIFIED (do NOT match design — they're plain card lists): HR screen, Employee screen. Reusable CaseCard exists.
NOT built yet: Case detail + audit trail (shared), HR All-cases table, HR Review-case screen, Employee "My notice" screen, Admin All-cases + **Rulebook** table, per-role sidebars/layouts (only Manager has one), Design-system page.
All role screens should share the app shell (sidebar) + the design-system styling + the shared Case detail / Action ladder.

## Note: time-decay rule appears in the design
The ladder counts occurrences within a rolling 12-month window; older ones "fall out of the count and are shown greyed." (This matches the time-decay idea discussed early on — a nice senior feature.)
