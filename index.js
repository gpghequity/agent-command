require('dotenv').config({ path: 'C:\\Users\\gpghe\\.env.shared' });
require('dotenv').config();

const express = require('express');
const session = require('express-session');
const path = require('path');
const rateLimit = require('express-rate-limit');
const generalLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false });

// ─── VERSION + DEPLOY TIMESTAMP ───────────────────────────────────────────
// Per brief: update both BEFORE every Railway push.
const APP_VERSION = 'v1.0';
const LAST_DEPLOY = 'April 16, 2026 10:40 PM EST';
// ──────────────────────────────────────────────────────────────────────────

const app = express();
app.set('trust proxy', 1);
app.use(generalLimiter);
// Port override per operator preamble (3004)
const PORT = process.env.PORT || 3004;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'agent-command-dev',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }
}));

// Template locals
app.use((req, res, next) => {
  res.locals.version = APP_VERSION;
  res.locals.lastUpdated = LAST_DEPLOY;
  res.locals.appName = 'Agent Command';
  res.locals.role = (req.session && req.session.role) || null;
  res.locals.isLoggedIn = !!res.locals.role;
  res.locals.currentPath = req.path;
  res.locals.userName = (req.session && req.session.name) || null;
  next();
});

// ─── CREDENTIALS ──────────────────────────────────────────────────────────
const USERS = {
  brokeradmin: { password: process.env.ADMIN_PASSWORD || '', role: 'admin', name: 'Broker Admin' },
  agent:       { password: process.env.AGENT_PASSWORD || '',   role: 'agent', name: 'Demo Agent' }
};

function requireAuth(role) {
  return (req, res, next) => {
    if (!req.session || !req.session.role) return res.redirect('/login');
    if (role && req.session.role !== role) {
      // Role mismatch — redirect to their own dashboard
      return res.redirect(req.session.role === 'admin' ? '/dashboard' : '/agent-dashboard');
    }
    next();
  };
}

// ─── MODULES ──────────────────────────────────────────────────────────────
const TRAINING_MODULES = [
  { id: 1, title: 'Agency Law & Fiduciary Duty',      subtitle: 'PA + OH',                                         minutes: 45,
    summary: [
      'Who you work for, what you owe them, and where the lines are.',
      'Covers principal vs customer, disclosure, and loyalty duties.',
      'Applied to common transaction scenarios.'
    ]
  },
  { id: 2, title: 'Required Disclosures',             subtitle: 'SPD, Consumer Notice, Lead Paint',                 minutes: 30,
    summary: [
      'Which disclosures are required, when, and by whom.',
      'What happens if you miss one — and how to fix it.',
      'Checklist for every transaction type.'
    ]
  },
  { id: 3, title: 'Agreement of Sale — Field by Field', subtitle: 'PAR Form ASR',                                    minutes: 60,
    summary: [
      'Every field, every checkbox, every initial line.',
      'The five blanks agents miss most often.',
      'Escrow, contingencies, and default clauses in plain English.'
    ]
  },
  { id: 4, title: 'Wire Fraud Prevention',            subtitle: 'Protect your clients and your license',             minutes: 20,
    summary: [
      'How wire fraud actually happens — real case examples.',
      'The two-call verification rule — never skip it.',
      'What to do in the first 60 minutes if funds are wired wrong.'
    ]
  },
  { id: 5, title: 'Fair Housing',                     subtitle: 'Federal + PA + OH Additions',                       minutes: 45,
    summary: [
      'Federal protected classes plus what PA and OH add.',
      'What steering looks like — and what your ads can\'t say.',
      'Dual agency rules and when to escalate to the broker.'
    ]
  }
];

// ─── ROUTES ───────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  if (!req.session.role) return res.redirect('/login');
  return res.redirect(req.session.role === 'admin' ? '/dashboard' : '/agent-dashboard');
});

app.get('/login', (req, res) => {
  if (req.session.role) {
    return res.redirect(req.session.role === 'admin' ? '/dashboard' : '/agent-dashboard');
  }
  res.render('layout', { page: 'login', title: 'Sign In — Agent Command', error: null });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = USERS[(username || '').trim().toLowerCase()];
  if (!user || user.password !== password) {
    return res.status(401).render('layout', {
      page: 'login',
      title: 'Sign In — Agent Command',
      error: 'Invalid credentials. Try again.'
    });
  }
  req.session.role = user.role;
  req.session.name = user.name;
  // Track per-session module completion for Module 5
  req.session.completedModules = req.session.completedModules || [];
  res.redirect(user.role === 'admin' ? '/dashboard' : '/agent-dashboard');
});

app.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ─── BROKER DASHBOARD ─────────────────────────────────────────────────────
app.get('/dashboard', requireAuth('admin'), (req, res) => {
  const stats = [
    { label: 'Total Active Agents',      value: '6' },
    { label: 'In Onboarding',            value: '2' },
    { label: 'Training In Progress',     value: '3' },
    { label: 'Compliance Flags',         value: '1' },
    { label: 'Pending Applications',     value: '1' }
  ];

  const agents = [
    { name: 'Naire Crayton',  state: 'PA', plan: 'Plan A', statusColor: 'green',  statusLabel: 'ACTIVE',      txYtd: '4 YTD',  training: '5/5', complete: true },
    { name: 'Ryan Franco',    state: 'PA', plan: 'Plan A', statusColor: 'green',  statusLabel: 'ACTIVE',      txYtd: '11 YTD', training: '5/5', complete: true },
    { name: 'Drew Mitchell',  state: 'PA', plan: 'Plan A', statusColor: 'yellow', statusLabel: 'ACTIVE',      txYtd: '1 YTD',  training: '3/5', complete: false },
    { name: 'Connor Walsh',   state: 'PA', plan: 'Plan B', statusColor: 'blue',   statusLabel: 'ONBOARDING',  txYtd: '0',      training: '1/5', complete: false },
    { name: 'Alex Torres',    state: 'OH', plan: 'Plan A', statusColor: 'blue',   statusLabel: 'ONBOARDING',  txYtd: '0',      training: '0/5', complete: false },
    { name: 'Will Chambers',  state: 'PA', plan: 'Plan A', statusColor: 'orange', statusLabel: 'INACTIVE',    txYtd: '0 YTD',  training: '5/5', complete: true }
  ];

  const actionRequired = [
    { name: 'Alex Torres',    note: 'Onboarding checklist 0% complete — 5 days since application' },
    { name: 'Drew Mitchell',  note: 'Training Module 4 incomplete — deadline approaching' },
    { name: 'Connor Walsh',   note: 'ICA not yet uploaded' }
  ];

  const deadlines = [
    { name: 'Connor Walsh', event: 'ICA due',         date: 'April 22' },
    { name: 'Alex Torres',  event: 'Orientation due', date: 'April 24' }
  ];

  res.render('layout', {
    page: 'dashboard',
    title: 'Broker Dashboard — Agent Command',
    stats, agents, actionRequired, deadlines
  });
});

// ─── AGENT DASHBOARD ──────────────────────────────────────────────────────
app.get('/agent-dashboard', requireAuth('agent'), (req, res) => {
  const completed = req.session.completedModules || [];

  const stats = [
    { label: 'My Transactions YTD',   value: '3' },
    { label: 'Training Progress',     value: (3 + (completed.includes(5) ? 1 : 0)) + '/5 modules' },
    { label: 'Commission YTD',        value: '$12,400' },
    { label: 'Onboarding',            value: '85% complete' }
  ];

  const actionItems = [
    'Complete Training Module 4: Wire Fraud Prevention',
    'Upload signed ICA',
    'Submit W-9 to broker'
  ];

  const onboardingChecklist = [
    { label: 'Application submitted',      done: true  },
    { label: 'License verified',           done: true  },
    { label: 'ICA signed',                 done: true  },
    { label: 'E&O insurance on file',      done: true  },
    { label: 'W-9 submitted',              done: false },
    { label: 'Training modules complete',  done: false },
    { label: 'First deal submitted',       done: false }
  ];

  res.render('layout', {
    page: 'agent-dashboard',
    title: 'Agent Dashboard — Agent Command',
    stats, actionItems, onboardingChecklist
  });
});

// ─── TRAINING ─────────────────────────────────────────────────────────────
app.get('/training', requireAuth(), (req, res) => {
  const completed = req.session.completedModules || [];
  const modules = TRAINING_MODULES.map(m => ({
    ...m,
    status: completed.includes(m.id) ? 'Complete' : (m.id === 4 ? 'In Progress' : 'Not Started')
  }));

  res.render('layout', {
    page: 'training',
    title: 'Training — Agent Command',
    modules
  });
});

app.get('/training/module/:id', requireAuth(), (req, res) => {
  const id = parseInt(req.params.id, 10);
  const mod = TRAINING_MODULES.find(m => m.id === id);
  if (!mod) return res.redirect('/training');

  const completed = (req.session.completedModules || []).includes(id);

  if (id === 5) {
    return res.render('layout', {
      page: 'module5',
      title: `${mod.title} — Agent Command`,
      mod, completed, result: null
    });
  }

  return res.render('layout', {
    page: 'module-placeholder',
    title: `${mod.title} — Agent Command`,
    mod
  });
});

app.post('/training/module/5/submit', requireAuth(), (req, res) => {
  const { answer } = req.body;
  const correct = (answer || '').toUpperCase() === 'B';
  if (correct) {
    req.session.completedModules = Array.from(new Set([...(req.session.completedModules || []), 5]));
  }
  const mod = TRAINING_MODULES.find(m => m.id === 5);
  res.render('layout', {
    page: 'module5',
    title: `${mod.title} — Agent Command`,
    mod,
    completed: correct ? true : (req.session.completedModules || []).includes(5),
    result: correct ? 'correct' : 'incorrect'
  });
});

// ─── ABOUT ────────────────────────────────────────────────────────────────
app.get('/about', (req, res) => {
  res.render('layout', { page: 'about', title: 'About — Agent Command' });
});

// Health
app.get('/_health', (_req, res) => res.json({ ok: true, version: APP_VERSION, deployed: LAST_DEPLOY }));

// 404
app.use((req, res) => {
  res.status(404).render('layout', { page: 'not-found', title: 'Not Found — Agent Command' });
});

// Errors
app.use((err, req, res, next) => {
  console.error('[error]', err);
  if (res.headersSent) return next(err);
  res.status(500).send('Server error.');
});

// ─── START ────────────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(PORT, () => {
    console.log('');
    console.log(`  Agent Command ${APP_VERSION}`);
    console.log(`  Last deploy: ${LAST_DEPLOY}`);
    console.log(`  Running on http://localhost:${PORT}`);
    console.log(`  Admin:  brokeradmin / [ADMIN_PASSWORD]`);
    console.log(`  Agent:  agent / [AGENT_PASSWORD]`);
    console.log('');
  });
}

module.exports = app;
