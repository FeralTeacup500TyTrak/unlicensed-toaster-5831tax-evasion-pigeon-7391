# Achievement classification – audit rules

Source: 7,002 GW2 API achievements; provisional classification; Wiki review search of 775 uncertain records, 2026-11-15.

- `included`: provisionally available, finite achievement; counts toward completion.
- `excluded`: removed from active denominator. Includes retired, repeatable, daily/weekly/monthly, one-time events, or `NO_WIKI_MATCH`.
- `review`: uncertain; excluded from active denominator until checked.
- `NO_WIKI_MATCH` is a **provisional filter**, not proof of retirement.
- `WIKI_SEARCH_CANDIDATES_NOT_VERIFIED` means search returned pages but did **not** verify the specific achievement; review required.
- Existing exclusions remain excluded regardless of search hits.
- Recurring festivals with finite achievements are eligible, but historical category alone is insufficient proof.
- Raid/PvP/WvW toggles remove achievements from the denominator without deleting progress.
- Each achievement's source, reasons, search candidate pages and dates are in `achievement-decisions.json`.
- All tiers must be checked to complete an achievement. Achievements with no API tiers receive a single completion checkbox.
- GW2 API tier `count` is a cumulative target, not the number of independent checkboxes.
- Future reclassification must preserve IDs, checkbox storage and a record of changed decisions.
