# Agent Command

The Operating System for Scalable Brokerages — demo app by Projects with a Purpose LLC.

Four-page Express app: Login → Broker Dashboard / Agent Dashboard → Training → About.
In-memory session data. Real integrations drop in later without rebuilding.

## Run locally

```
npm install
node index.js
```

Visit `http://localhost:3004`.

Credentials:
- Broker admin: `brokeradmin` / `gorilla2026`
- Agent:       `agent` / `agent2026`

## Routes

| Route | Access | Notes |
| --- | --- | --- |
| `/login` | public | |
| `/dashboard` | admin | Broker view: 5 stats, roster table, action required, deadlines, Add Agent modal |
| `/agent-dashboard` | agent | Agent view: 4 stats, action items, onboarding checklist |
| `/training` | both | 5 module cards with status badges |
| `/training/module/5` | both | Fair Housing — full content + comprehension question |
| `/training/module/:id` (1-4) | both | Placeholder: "coming soon" |
| `/about` | public | Feature marketing + Request Access CTA |

Role-based redirects keep agents out of the broker dashboard and vice versa.

## Version + deploy timestamp

Constants at the top of `index.js`:

```js
const APP_VERSION = 'v1.0';
const LAST_DEPLOY = 'April 16, 2026 10:40 PM EST';
```

Bump before every Railway push (per brief). Both inject into every template via
`res.locals.version` / `res.locals.lastUpdated` and render in the footer.
