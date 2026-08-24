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

## Still to get from Vidya
HR, Employee, Admin role screens (only Manager shared so far).

## Note: time-decay rule appears in the design
The ladder counts occurrences within a rolling 12-month window; older ones "fall out of the count and are shown greyed." (This matches the time-decay idea discussed early on — a nice senior feature.)
