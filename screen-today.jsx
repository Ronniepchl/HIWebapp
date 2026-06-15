/* screen-today.jsx — CEO command center */
const { Header: THeader } = window.UI;

const HEALTH = {
  Healthy:   { tone:'ok',   label:'Healthy',          dot:'ok' },
  Attention: { tone:'warn', label:'Attention needed', dot:'warn' },
  Action:    { tone:'due',  label:'Action required',  dot:'due' },
};

/* ---- Monthly Snapshot: compact business status + link to full report ---- */
function PulseTile({ k, onTap }) {
  const big = (k.value || '').length > 4;
  return (
    <button onClick={onTap} className="press" style={{ textAlign:'left', cursor:'pointer',
      padding:'11px 9px 11px', borderRadius:'var(--r-sm)', minWidth:0,
      background:'var(--glass)', border:'1px solid var(--glass-brd)', fontFamily:'var(--font-ui)' }}>
      <span style={{ width:26, height:26, borderRadius:8, display:'grid', placeItems:'center', marginBottom:9,
        background:`var(--${k.tone}-bg)`, color:`var(--${k.tone})` }}>
        <Icon name={k.icon} size={14} /></span>
      <div className="metric" style={{ fontSize: big ? 18 : 24, lineHeight:1, color:'var(--ink-hi)' }}>{k.value}</div>
      <div style={{ fontSize:10.5, color:'var(--ink)', marginTop:5, fontWeight:600, lineHeight:1.2 }}>{k.label}</div>
      <div style={{ fontSize:9.5, color:'var(--ink-low)', marginTop:2, lineHeight:1.2 }}>{k.sub}</div>
    </button>
  );
}

function MonthlySnapshot({ pulse, onNav, onReport }) {
  return (
    <React.Fragment>
      <div className="section-label">
        <span className="t row gap8">
          <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--gold)', boxShadow:'0 0 8px var(--gold)' }}></span>
          Monthly snapshot</span>
        <span className="a" style={{ color:'var(--ink-low)' }}>June 2026</span>
      </div>
      <div className="card" style={{ padding:13 }}>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr 1fr', gap:7 }}>
          {pulse.kpis.map((k,i) => (
            <PulseTile key={i} k={k} onTap={() => k.id==='summary' ? onReport() : onNav(k.id)} />
          ))}
        </div>
        <button onClick={onReport} style={{ width:'100%', height:44, marginTop:11, borderRadius:13, cursor:'pointer',
          display:'flex', alignItems:'center', justifyContent:'center', gap:8,
          background:'var(--gold-glow)', border:'1px solid var(--gold-line)', color:'var(--gold)',
          fontFamily:'var(--font-ui)', fontSize:13, fontWeight:700 }}>
          <Icon name="summary" size={16} />View full report
        </button>
      </div>
    </React.Fragment>
  );
}

/* ---- Focus score ring ---- */
function FocusRing({ score = 82, size = 76, stroke = 6 }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="url(#ringg)" strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off} />
        <defs>
          <linearGradient id="ringg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--gold-deep)" />
            <stop offset="100%" stopColor="var(--gold)" />
          </linearGradient>
        </defs>
      </svg>
      <div style={{ position:'absolute', inset:0, display:'grid', placeItems:'center', textAlign:'center' }}>
        <div>
          <span className="metric" style={{ fontSize:24, color:'var(--ink-hi)' }}>{score}</span>
          <span style={{ fontSize:11, color:'var(--ink-low)', fontFamily:'var(--font-num)' }}>/100</span>
        </div>
      </div>
    </div>
  );
}

/* ---- One ranked priority ---- */
function FocusPriority({ p, idx, onClick }) {
  return (
    <div className="press" onClick={onClick} style={{ padding:'13px 0', borderTop:'1px solid var(--glass-brd)' }}>
      <div className="row gap12" style={{ alignItems:'flex-start' }}>
        <div style={{ width:30, height:30, borderRadius:10, flex:'0 0 auto', display:'grid', placeItems:'center',
          fontFamily:'var(--font-num)', fontSize:14, fontWeight:600, color:'var(--gold)',
          background:'var(--gold-glow)', border:'1px solid var(--gold-line)' }}>{idx}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="row between" style={{ marginBottom:3 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:11, fontWeight:600,
              letterSpacing:0.3, color:`var(--${p.tone})` }}>
              <span className={'dot '+p.tone} style={{ width:7, height:7 }}></span>{p.cat}</span>
            <span className="metric" style={{ fontSize:14, color:'var(--ink-hi)' }}>{p.metric}</span>
          </div>
          <div className="row between">
            <div className="t1" style={{ fontSize:15.5, fontWeight:600, color:'var(--ink-hi)' }}>
              <span className="thai">{p.name}</span>
              {p.sub && <span style={{ color:'var(--ink-low)', fontWeight:500 }}> · {p.sub}</span>}
            </div>
          </div>
          <div style={{ fontSize:12.5, color:'var(--ink-mid)', marginTop:2 }}>
            {p.context}{p.risk && <span style={{ color:'var(--due)' }}> · {p.risk}</span>}
          </div>
          <div className="row between" style={{ marginTop:10 }}>
            <span className="pill" style={{ color:'var(--gold)', background:'var(--gold-glow)',
              borderColor:'var(--gold-line)' }}>
              <Icon name={p.actionIcon} size={13} />{p.action}</span>
            <Icon name="chevron" size={15} color="var(--ink-low)" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---- Quick action button ---- */
function QuickBtn({ icon, label, gold, onClick }) {
  return (
    <button onClick={onClick} style={{ flex:1, minWidth:0, height:60, borderRadius:15, cursor:'pointer',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:5,
      background: gold ? 'var(--gold-glow)' : 'var(--glass-2)',
      border:`1px solid ${gold ? 'var(--gold-line)' : 'var(--glass-brd)'}`,
      color: gold ? 'var(--gold)' : 'var(--ink)', fontFamily:'var(--font-ui)' }}>
      <Icon name={icon} size={19} />
      <span style={{ fontSize:9.5, fontWeight:600, letterSpacing:0.1, lineHeight:1, textAlign:'center' }}>{label}</span>
    </button>
  );
}

/* ---- Workload status card ---- */
function WorkloadCard({ count, label, color, glow }) {
  return (
    <div style={{ flex:1, minWidth:0, padding:'12px 12px 11px', borderRadius:14,
      background:'var(--glass)', border:'1px solid var(--glass-brd)' }}>
      <div className="row gap8" style={{ alignItems:'center' }}>
        <span style={{ width:9, height:9, borderRadius:'50%', flex:'0 0 auto',
          background:color, boxShadow: glow ? `0 0 9px ${color}` : 'none' }}></span>
        <span className="metric" style={{ fontSize:24, lineHeight:1, color:'var(--ink-hi)' }}>{count}</span>
      </div>
      <div style={{ fontSize:10.5, color:'var(--ink-mid)', marginTop:6, fontWeight:600, lineHeight:1.2 }}>{label}</div>
    </div>
  );
}

/* ---- The CEO Focus hero ---- */
function CEOFocusHero({ focus, tasks, workload, dateStr, callTo, onOpenTarget, onNav, onCalendar, onNote }) {
  const top3 = tasks.slice(0, 3);
  const tgt = (t) => ({ type: t.relatedType, id: t.relatedId });

  // Live clock — re-renders every second so the date/time stay current.
  const [now, setNow] = React.useState(() => new Date());
  React.useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const h = now.getHours();
  const greeting = h < 12 ? 'Good morning' : (h < 17 ? 'Good afternoon' : 'Good evening');
  const liveDate = now.toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const liveTime = now.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  // The viewer's IANA timezone, e.g. "Asia/Bangkok".
  const tz = (() => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone; } catch (e) { return ''; } })();
  return (
    <div className="card fu" style={{ padding:0, overflow:'hidden', position:'relative',
      border:'1px solid var(--gold-line)' }}>
      {/* glow */}
      <div style={{ position:'absolute', top:-70, right:-50, width:200, height:200, borderRadius:'50%',
        background:'radial-gradient(circle, var(--gold-glow), transparent 68%)', pointerEvents:'none' }}></div>

      {/* greeting + workload overview */}
      <div style={{ padding:'18px 18px 16px', background:'linear-gradient(160deg, rgba(216,184,115,0.10), rgba(255,255,255,0.015))' }}>
        <div className="eyebrow" style={{ display:'flex', alignItems:'center', gap:6 }}>
          <Icon name="spark" size={12} color="var(--gold-soft)" />CEO Focus · Today</div>
        <h1 style={{ fontSize:21, fontWeight:600, color:'var(--ink-hi)', letterSpacing:-0.3, margin:'5px 0 0', lineHeight:1.15 }}>
          {greeting}, NO.1</h1>
        <div style={{ fontSize:13, color:'var(--ink-mid)', marginTop:4 }}>
          {liveDate} · <span style={{ fontVariantNumeric:'tabular-nums' }}>{liveTime}</span>
          {tz && <span style={{ color:'var(--ink-low)' }}> · {tz.replace(/_/g, ' ')}</span>}</div>

        <div style={{ fontSize:10.5, fontWeight:600, letterSpacing:1.4, textTransform:'uppercase',
          color:'var(--ink-low)', margin:'16px 0 9px' }}>Today's overview</div>
        <div className="row gap8">
          <WorkloadCard count={workload.high}     label="High priority" color="var(--due)"  glow />
          <WorkloadCard count={workload.medium}   label="Medium"        color="var(--warn)"  glow />
          <WorkloadCard count={workload.upcoming} label="Upcoming"      color="var(--ink-low)" />
        </div>
      </div>

      {/* top 3 priorities */}
      <div style={{ padding:'4px 18px 14px' }}>
        <div style={{ fontSize:11, fontWeight:600, letterSpacing:1.6, textTransform:'uppercase',
          color:'var(--ink-low)', margin:'12px 0 2px' }}>Top 3 priorities</div>
        {top3.map((p, i) => (
          <FocusPriority key={p.id} p={p} idx={i+1} onClick={() => onOpenTarget(tgt(p))} />
        ))}
        {top3.length === 0 && (
          <div style={{ padding:'18px 0 6px', textAlign:'center', color:'var(--ok)', fontSize:13.5, fontWeight:600 }}>
            <Icon name="check" size={16} style={{ verticalAlign:'-3px', marginRight:6 }} />All caught up for today</div>
        )}
      </div>

      {/* AI morning briefing */}
      <div style={{ margin:'0 18px 16px', padding:'13px 14px', borderRadius:15,
        background:'var(--gold-glow)', border:'1px solid var(--gold-line)' }}>
        <div className="row gap8" style={{ marginBottom:6, color:'var(--gold)' }}>
          <Icon name="spark" size={14} /><span style={{ fontSize:11, fontWeight:700, letterSpacing:0.4 }}>AI MORNING BRIEFING</span>
        </div>
        <p style={{ margin:0, fontSize:13, lineHeight:1.55, color:'var(--ink)' }}>{focus.insight}</p>
      </div>

      {/* quick actions */}
      <div className="row gap8" style={{ padding:'0 16px 16px' }}>
        <QuickBtn icon="phone" label="Call" gold onClick={() => {
          if (callTo && callTo.phone) {
            // Opens the phone's dialer with the number pre-filled, ready to call.
            window.location.href = 'tel:' + String(callTo.phone).replace(/[^\d+]/g, '');
          } else if (top3[0]) {
            onOpenTarget(tgt(top3[0]));
          }
        }} />
        <QuickBtn icon="leads"    label="Leads"    onClick={() => onNav('leads')} />
        <QuickBtn icon="calendar" label="Calendar" onClick={onCalendar} />
        <QuickBtn icon="note"     label="Add note" onClick={onNote} />
      </div>
    </div>
  );
}

/* ---- Elegant birthday card (premium, not party) ---- */
function BirthdayCard({ t, cust, onAction, onCall, onComplete, onNote, onOpen }) {
  return (
    <div className="card fu" style={{ padding:0, marginBottom:11, overflow:'hidden', position:'relative',
      border:'1px solid var(--gold-line)' }}>
      <div style={{ position:'absolute', top:-50, right:-40, width:150, height:150, borderRadius:'50%',
        background:'radial-gradient(circle, var(--gold-glow), transparent 68%)', pointerEvents:'none' }}></div>
      <div style={{ padding:'15px 16px 4px', background:'linear-gradient(160deg, rgba(216,184,115,0.12), rgba(255,255,255,0.015))' }}>
        <div className="row between" style={{ marginBottom:11 }}>
          <span className="eyebrow" style={{ display:'flex', alignItems:'center', gap:6, color:'var(--gold)' }}>
            <Icon name="gift" size={13} />Birthday Today</span>
          {cust && <span className="pill" style={{ height:22, color:'var(--gold)', background:'var(--gold-glow)', borderColor:'var(--gold-line)' }}>{cust.tier}</span>}
        </div>
        <div className="press" onClick={onOpen} style={{ display:'flex', gap:12, alignItems:'center', paddingBottom:12 }}>
          <div className="mono thai" style={{ width:48, height:48, borderRadius:15, fontSize:17 }}>{cust ? cust.mono : '••'}</div>
          <div style={{ flex:1, minWidth:0 }}>
            <div className="thai t1" style={{ fontSize:17, fontWeight:600, color:'var(--ink-hi)' }}>{t.name}</div>
            <div className="t1" style={{ fontSize:12.5, color:'var(--ink-mid)', marginTop:2 }}>{t.sub}</div>
            <div className="t1" style={{ fontSize:12, color:'var(--ink-mid)', marginTop:2 }}>
              Annual premium <span style={{ fontFamily:'var(--font-num)', color:'var(--gold)', fontWeight:600 }}>{t.metric}</span></div>
          </div>
        </div>
      </div>
      <div style={{ margin:'4px 16px 12px', padding:'11px 13px', borderRadius:14, background:'var(--gold-glow)', border:'1px solid var(--gold-line)' }}>
        <div style={{ fontSize:10.5, fontWeight:700, letterSpacing:0.4, color:'var(--gold)' }}>SUGGESTED ACTION</div>
        <div style={{ fontSize:13, color:'var(--ink)', marginTop:3 }}>Send a warm birthday message today — {cust ? cust.tier+' customer' : 'valued customer'}.</div>
      </div>
      <div className="row gap8" style={{ padding:'0 14px 14px' }}>
        <TaskAction icon="mail"  label="Email" gold onClick={onAction} />
        <TaskAction icon="phone" label="Call" onClick={onCall} />
        <TaskAction icon="note"  label="Note" onClick={onNote} />
        <TaskAction icon="check" label="Done" onClick={onComplete} />
      </div>
    </div>
  );
}

function TaskAction({ icon, label, gold, onClick }) {
  return (
    <button onClick={(e)=>{ e.stopPropagation(); onClick&&onClick(); }} style={{ flex:1, minWidth:0, height:50, borderRadius:13, cursor:'pointer',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4,
      background: gold ? 'var(--gold-glow)' : 'var(--glass-2)',
      border:`1px solid ${gold ? 'var(--gold-line)' : 'var(--glass-brd)'}`,
      color: gold ? 'var(--gold)' : 'var(--ink)', fontFamily:'var(--font-ui)' }}>
      <Icon name={icon} size={17} />
      <span style={{ fontSize:9.5, fontWeight:600 }}>{label}</span>
    </button>
  );
}

/* ---- Compact alert card (Today's Alerts) ---- */
function AlertCard({ t, onOpen, onComplete, onContact, onCall, i }) {
  return (
    <div className="card fu" style={{ padding:14, marginBottom:10, animationDelay:(0.04*i)+'s' }}>
      <div className="press" onClick={onOpen} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div style={{ width:40, height:40, borderRadius:12, flex:'0 0 auto', display:'grid', placeItems:'center',
          background:`var(--${t.tone}-bg)`, color:`var(--${t.tone})` }}>
          <Icon name={t.icon} size={18} /></div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="row between" style={{ marginBottom:2 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:6, fontSize:10.5, fontWeight:600,
              letterSpacing:0.3, color:`var(--${t.tone})` }}>
              <span className={'dot '+t.tone} style={{ width:6, height:6 }}></span>{t.cat}</span>
            <span className="metric" style={{ fontSize:13, color:'var(--ink-hi)' }}>{t.metric}</span>
          </div>
          <div className="t1" style={{ fontSize:15, fontWeight:600, color:'var(--ink-hi)' }}>
            <span className="thai">{t.name}</span>
            {t.sub && <span style={{ color:'var(--ink-low)', fontWeight:500 }}> · {t.sub}</span>}</div>
          <div className="t1" style={{ fontSize:12, color:'var(--ink-mid)', marginTop:2 }}>
            {t.context}{t.risk && <span style={{ color:'var(--due)' }}> · {t.risk}</span>}</div>
        </div>
      </div>
      <div className="row gap8" style={{ marginTop:11 }}>
        <button onClick={onCall} className="alert-btn" style={{ color:'var(--gold)', background:'var(--gold-glow)', borderColor:'var(--gold-line)' }}>
          <Icon name="phone" size={15} />Call</button>
        <button onClick={onContact} className="alert-btn">
          <Icon name="mail" size={15} />Email</button>
        <button onClick={onComplete} className="alert-btn">
          <Icon name="check" size={15} />Done</button>
      </div>
    </div>
  );
}

/* ---- Compact monthly review (moved lower on dashboard) ---- */
function MonthlyReview({ m, onOpen }) {
  return (
    <div className="card press fu" onClick={onOpen} style={{ padding:16 }}>
      <div className="row between" style={{ alignItems:'flex-start' }}>
        <div>
          <div style={{ fontSize:11.5, color:'var(--ink-mid)', fontWeight:600 }}>Premium written · June</div>
          <div className="row gap8" style={{ alignItems:'baseline', marginTop:3 }}>
            <span className="metric" style={{ fontSize:30, color:'var(--ink-hi)' }}>{m.premium}</span>
            <span style={{ fontSize:12, color:'var(--ok)', fontWeight:600 }}>{m.delta} {m.vs}</span>
          </div>
        </div>
        <window.UI.Sparkline data={m.trend} w={96} h={42} color="var(--gold)" stroke={2.2} />
      </div>
      <div className="row" style={{ gap:8, marginTop:14 }}>
        {m.stats.map((s,i) => (
          <div key={i} style={{ flex:1, padding:'10px 11px', borderRadius:13, background:'var(--glass)', border:'1px solid var(--glass-brd)' }}>
            <div className="metric" style={{ fontSize:16, color:'var(--ink-hi)' }}>{s.value}</div>
            <div style={{ fontSize:10, color:'var(--ink-mid)', marginTop:3, fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div className="row between" style={{ marginTop:13, paddingTop:12, borderTop:'1px solid var(--glass-brd)' }}>
        <span style={{ fontSize:12.5, color:'var(--ink-mid)' }}>Full monthly review</span>
        <span className="row gap8" style={{ fontSize:12.5, color:'var(--gold-soft)', fontWeight:600 }}>
          Open <Icon name="chevron" size={13} color="var(--gold-soft)" /></span>
      </div>
    </div>
  );
}

/* ---- Recent activity (Activity Log) ---- */
function RecentActivity({ activities }) {
  if (!activities.length) return null;
  return (
    <React.Fragment>
      <div className="section-label">
        <span className="t">Recent activity</span>
        <span className="a">{activities.length}</span>
      </div>
      <div className="card" style={{ padding:'4px 14px' }}>
        {activities.map((a, i) => (
          <div key={a.id} className="row gap12" style={{ padding:'12px 4px', alignItems:'flex-start',
            borderBottom: i<activities.length-1?'1px solid var(--glass-brd)':'none' }}>
            <div style={{ width:32, height:32, borderRadius:10, flex:'0 0 auto', display:'grid', placeItems:'center',
              background:`var(--${a.tone}-bg)`, color:`var(--${a.tone})` }}>
              <Icon name={a.icon} size={15} /></div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, color:'var(--ink-hi)' }}>
                {a.title}{a.who && <span style={{ color:'var(--ink-mid)', fontWeight:500 }} className="thai"> · {a.who}</span>}</div>
              {a.note && <div style={{ fontSize:12, color:'var(--ink-mid)', marginTop:2 }} className="thai">{a.note}</div>}
              <div style={{ fontSize:11, color:'var(--ink-low)', marginTop:3 }}>{a.when}</div>
            </div>
          </div>
        ))}
      </div>
    </React.Fragment>
  );
}

/* ---- Upcoming list ---- */
function UpcomingRow({ u, i, last }) {
  return (
    <div className="row gap12" style={{ padding:'12px 4px', borderBottom: last?'none':'1px solid var(--glass-brd)' }}>
      <div style={{ width:36, height:36, borderRadius:11, flex:'0 0 auto', display:'grid', placeItems:'center',
        background:'var(--glass)', border:'1px solid var(--glass-brd)', color:`var(--${u.tone})` }}>
        <Icon name={u.icon} size={17} />
      </div>
      <div style={{ flex:1, minWidth:0 }}>
        <div className="t1" style={{ fontSize:14, fontWeight:600, color:'var(--ink-hi)' }}>
          {u.kind} · <span className="thai">{u.name}</span></div>
        <div style={{ fontSize:11.5, color:'var(--ink-low)' }}>{u.when}</div>
      </div>
      <Icon name="chevron" size={16} color="var(--ink-low)" />
    </div>
  );
}

function TodayScreen({ data, onOpenTarget, onNav, onCalendar, onNote, onComplete, onSnooze, onReport }) {
  const dstr = new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const PRANK = { high:0, normal:1, low:2 };
  const openTasks = data.TASKS
    .filter(t => t.status === 'Open' && t.due === 'today')
    .map((t, i) => ({ t, i }))
    .sort((a, b) => (PRANK[a.t.priority] ?? 1) - (PRANK[b.t.priority] ?? 1) || a.i - b.i)
    .map(x => x.t);
  const custById = (id) => data.CUSTOMERS.find(c => c.id === id);
  const tgt = (t) => ({ type: t.relatedType, id: t.relatedId });
  // Who the "Call" quick-action dials: the top open task's customer, else the
  // first customer with a number, so the button is always live. (Built LEADS
  // don't carry a phone, so we resolve against CUSTOMERS.)
  const callTo = (() => {
    const ready = (c) => c && c.phone && c.phone !== '—';
    const contactFor = (t) => t.relatedType === 'lead'
      ? data.LEADS.find(l => l.id === t.relatedId)
      : custById(t.relatedId);
    for (const t of openTasks) { const c = contactFor(t); if (ready(c)) return c; }
    return data.CUSTOMERS.find(ready) || data.LEADS.find(ready) || null;
  })();
  const bday = openTasks.find(t => t.type === 'birthday');
  const rest = openTasks.filter(t => t.type !== 'birthday');
  // Resolve a task's contact phone (customer / lead / agent) for its Call button.
  const phoneFor = (tk) => {
    if (!tk) return '';
    const c = tk.relatedType === 'lead' ? data.LEADS.find(x => x.id === tk.relatedId)
            : tk.relatedType === 'agent' ? data.AGENTS.find(x => x.id === tk.relatedId)
            : custById(tk.relatedId);
    return c ? c.phone : '';
  };
  // Workload summary — auto-calculated (High = urgent today, Medium = near-term, Upcoming = future)
  const workload = {
    high: openTasks.filter(t => t.priority === 'high').length,
    medium: openTasks.filter(t => t.priority !== 'high').length
            + data.CUSTOMERS.filter(c => c.bdayDays > 0 && c.bdayDays <= 7).length,
    upcoming: data.UPCOMING.length,
  };
  return (
    <div className="screen" style={{ paddingTop:6 }}>
      {/* 1 — CEO Focus Today (hero) */}
      <CEOFocusHero focus={data.CEO_FOCUS} tasks={openTasks} workload={workload} dateStr={dstr} callTo={callTo}
        onOpenTarget={onOpenTarget} onNav={onNav} onCalendar={onCalendar} onNote={() => onNote()} />

      {/* 2 — Today's Alerts */}
      <div className="section-label">
        <span className="t">Today's alerts</span>
        <span className="a">{openTasks.length} active</span>
      </div>
      {bday && (
        <BirthdayCard t={bday} cust={custById(bday.relatedId)}
          onOpen={() => onOpenTarget(tgt(bday))}
          onAction={() => onOpenTarget(tgt(bday))}
          onCall={() => window.dialPhone(phoneFor(bday))}
          onComplete={() => onComplete(bday)}
          onNote={() => onNote(bday.relatedId)} />
      )}
      {rest.map((t, i) => (
        <AlertCard key={t.id} t={t} i={i}
          onOpen={() => onOpenTarget(tgt(t))}
          onContact={() => onOpenTarget(tgt(t))}
          onCall={() => window.dialPhone(phoneFor(t))}
          onComplete={() => onComplete(t)} />
      ))}
      {openTasks.length === 0 && (
        <div className="card" style={{ padding:'26px 16px', textAlign:'center' }}>
          <Icon name="check" size={22} color="var(--ok)" />
          <div style={{ fontSize:14, fontWeight:600, color:'var(--ink-hi)', marginTop:8 }}>No alerts right now</div>
          <div style={{ fontSize:12.5, color:'var(--ink-mid)', marginTop:3 }}>Enjoy a calm, focused day.</div>
        </div>
      )}

      {/* 3 — Upcoming · next 7 days */}
      <div className="section-label">
        <span className="t">Upcoming · next 7 days</span>
        <span className="a row gap8" onClick={onCalendar} style={{ cursor:'pointer' }}>
          View all <Icon name="chevron" size={13} color="var(--gold-soft)" /></span>
      </div>
      <div className="card" style={{ padding:'4px 14px' }}>
        {data.UPCOMING.map((u, i) => <UpcomingRow key={u.id} u={u} i={i} last={i===data.UPCOMING.length-1} />)}
      </div>

      {/* 4 — Monthly Snapshot (compact; full report is secondary) */}
      <MonthlySnapshot pulse={data.PULSE} onNav={onNav} onReport={onReport} />

      {/* 5 — Recent Activities */}
      <RecentActivity activities={data.ACTIVITIES} />
    </div>
  );
}

window.TodayScreen = TodayScreen;
