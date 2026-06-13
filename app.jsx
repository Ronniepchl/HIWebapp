/* app.jsx — InsureFlow shell: nav, routing, sheets, tweaks, state ops */
const { useState, useEffect } = React;
const { NAV } = window.UI;

/* ---------------- Top navigation bar (web) ---------------- */
function TopNav({ active, onNav, onSearch, onSignOut, live, loading, error }) {
  const state = loading ? 'sync' : (live ? 'live' : 'off');
  const label = loading ? 'Syncing' : (live ? 'Live' : 'Offline');
  const title = loading ? 'Loading from Google Sheets…' : (live ? 'Connected to Google Sheets' : 'Not connected to Google Sheets');
  return (
    <header className="topbar">
      <div className="topbar-brand">
        <span className="topbar-logo"><Icon name="shield" size={18} color="var(--gold)" /></span>
        <span className="topbar-brand-name">Insure<b>Flow</b></span>
        <span className={'data-badge data-' + state} title={title}>
          <span className="data-dot"></span>{label}
        </span>
      </div>
      <nav className="topnav">
        {NAV.map(n => (
          <button key={n.id} className={'topnav-item' + (active === n.id ? ' active' : '')} onClick={() => onNav(n.id)}>
            <Icon name={n.icon} size={18} stroke={active === n.id ? 1.9 : 1.6} />
            <span className="topnav-lbl">{n.lbl}</span>
          </button>
        ))}
      </nav>
      <div className="topbar-spacer"></div>
      <div className="searchbar" onClick={onSearch}>
        <Icon name="search" size={18} color="var(--gold-soft)" />
        <span className="ph">Search customer, lead, or agent...</span>
      </div>
      <button className="topbar-user" onClick={onSignOut} title="Sign out" aria-label="Sign out">
        <Icon name="user" size={17} color="var(--ink-mid)" />
      </button>
    </header>
  );
}

/* ---------------- Tweak presets ---------------- */
const ACCENTS = {
  Gold:      ['#d8b873','#c7a55f','#a9853f'],
  Champagne: ['#e4d2a8','#d3bd8a','#b89a5f'],
  Platinum:  ['#cdd6e4','#aeb9cd','#8a97ad'],
  Emerald:   ['#94cbac','#72b89c','#4f9277'],
};
const BACKGROUNDS = {
  'Deep Navy': 'radial-gradient(120% 80% at 50% -10%, #173158 0%, #0b1730 46%, #070e1e 100%)',
  'Midnight':  'radial-gradient(120% 80% at 50% -10%, #14233e 0%, #0a1322 48%, #05080f 100%)',
  'Royal':     'radial-gradient(120% 80% at 50% -10%, #1c3e6e 0%, #122a4e 46%, #0a1830 100%)',
};
const FONTS = {
  'Sora':    '"Sora", "Noto Sans Thai", system-ui, sans-serif',
  'Manrope': '"Manrope", "Noto Sans Thai", system-ui, sans-serif',
  'Outfit':  '"Outfit", "Noto Sans Thai", system-ui, sans-serif',
};
const GOLD_INTENSITY = { Subtle:[10,24], Moderate:[16,34], Rich:[27,52] };

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "Gold",
  "background": "Deep Navy",
  "goldIntensity": "Subtle",
  "font": "Sora",
  "cardStyle": "Glass",
  "corners": 20
}/*EDITMODE-END*/;

const TASK_ICON = { birthday:'gift', renewal:'renew', lead:'leads', agent:'user', proposal:'doc' };
const nowTime = () => new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' });

/* ---------------- Speed-dial FAB ---------------- */
function FabMenu({ actions }) {
  const [open, setOpen] = useState(false);
  return (
    <React.Fragment>
      {open && <div className="fab-scrim" onClick={()=>setOpen(false)}></div>}
      <div className="fab-stack">
        {open && actions.map((a,i)=>(
          <button key={i} className="fab-item" style={{ animationDelay:(i*0.03)+'s' }}
            onClick={()=>{ setOpen(false); a.onClick(); }}>
            <span className="fab-item-label">{a.label}</span>
            <span className="fab-item-ic"><Icon name={a.icon} size={19} /></span>
          </button>
        ))}
        <button className={'fab'+(open?' open':'')} onClick={()=>setOpen(o=>!o)} aria-label="Add">
          <Icon name="plus" size={26} color="#1a1407" stroke={2.4} />
        </button>
      </div>
    </React.Fragment>
  );
}

/* ---------------- Root App ---------------- */
function App() {
  const [t, setTweak] = window.useTweaks(TWEAK_DEFAULTS);
  const [tab, setTab] = useState(() => {
    const saved = localStorage.getItem('if_tab');
    return (saved && saved !== 'summary') ? saved : 'today';
  });
  const [data, setData] = useState(() => JSON.parse(JSON.stringify(window.DATA)));
  const [live, setLive] = useState(false);     // true once data is loaded from Google Sheets
  const [loading, setLoading] = useState(true); // show skeletons until first load resolves
  const [loadError, setLoadError] = useState(null);

  const [detail, setDetail] = useState(null);   // {type,e} for lead/agent
  const [profileId, setProfileId] = useState(null); // customer profile
  const [adding, setAdding] = useState(false);   // legacy lead/agent add
  const [addPipeline, setAddPipeline] = useState(null); // 'leads' | 'agents' from FAB
  const [addCust, setAddCust] = useState(false);  // customer add
  const [confirm, setConfirm] = useState(null);   // task pending completion
  const [note, setNote] = useState(null);         // {open, presetId} note composer
  const [cal, setCal] = useState(false);
  const [schedule, setSchedule] = useState(null); // agent being scheduled
  const [reportOpen, setReportOpen] = useState(false); // secondary full report
  const [searchOpen, setSearchOpen] = useState(false);
  const [recent, setRecent] = useState([]);       // [{type,id}] last opened
  const [authUser, setAuthUser] = useState(() => { try { return sessionStorage.getItem('if_auth') || null; } catch(e){ return null; } });

  const signIn = (name) => { try { sessionStorage.setItem('if_auth', name); } catch(e){}; setAuthUser(name); };
  const signOut = () => { try { sessionStorage.removeItem('if_auth'); } catch(e){}; setAuthUser(null); };

  const record = (type, id) => setRecent(r => [{ type, id }, ...r.filter(x => !(x.type===type && x.id===id))].slice(0, 5));

  useEffect(() => { localStorage.setItem('if_tab', tab); }, [tab]);
  useEffect(() => { window.__openSearch = () => setSearchOpen(true); }, []);

  /* ---- load live data from Google Sheets ---- */
  const loadData = () => {
    if (!window.SHEET_WEBAPP_URL || !window.loadSheetData) {
      setLoading(false); setLoadError('not-configured'); return;
    }
    setLoading(true); setLoadError(null);
    window.loadSheetData(
      (d) => {
        if (d) setData(prev => Object.assign({}, prev, d));
        setLive(true); setLoading(false);
      },
      (err) => {
        console.warn('[InsureFlow] Google Sheets load failed:', err);
        setLoading(false); setLoadError(err || 'error');
      }
    );
  };
  useEffect(() => { loadData(); }, []);
  const go = (id) => { setDetail(null); setProfileId(null); setTab(id); };

  /* ---- state operations (persisted to Google Sheets) ----
     Each add inserts optimistically with a temp id, writes to the sheet,
     then swaps in the server record (real id) on success or rolls back on
     failure. With no SHEET_WEBAPP_URL configured it stays local-only. */
  const persistRow = (action, fields, tempId, key) => {
    if (!window.saveToSheet || !window.SHEET_WEBAPP_URL) return; // local-only fallback
    window.saveToSheet(action, fields,
      (res) => {
        const rec = res && res.record;
        if (rec) setData(d => ({ ...d, [key]: d[key].map(x => x.id === tempId ? rec : x) }));
        else if (res && res.id) setData(d => ({ ...d, [key]: d[key].map(x => x.id === tempId ? { ...x, id: res.id } : x) }));
      },
      (err) => {
        console.warn('[InsureFlow] save failed (' + action + '):', err);
        setData(d => ({ ...d, [key]: d[key].filter(x => x.id !== tempId) }));
        try { window.alert('Could not save to Google Sheets — the entry was not added. Please try again.'); } catch (e) {}
      }
    );
  };

  const addEntry = (name, src) => {
    const mono = (name.trim()[0]||'?') + (name.trim().split(' ')[1]?.[0]||'');
    const kind = addPipeline || tab;
    const tempId = (kind==='agents'?'na':'nl') + Date.now();
    setData(d => {
      const nd = { ...d };
      if (kind==='agents') nd.AGENTS = [{ id:tempId, name, job:src, date:'Just added', stage:'interested', note:'New candidate — reach out soon', mono }, ...d.AGENTS];
      else nd.LEADS = [{ id:tempId, name, src, date:'Just now', stage:'new', note:'New lead — not yet contacted', value:'฿—', mono }, ...d.LEADS];
      return nd;
    });
    setAdding(false);
    setAddPipeline(null);
    if (kind==='agents') persistRow('addAgent', { name, job:src }, tempId, 'AGENTS');
    else persistRow('addLead', { name, src }, tempId, 'LEADS');
  };

  const addCustomer = (f) => {
    const name = (f.name || '').trim() || 'New customer';
    const mono = name[0] + (name.split(' ')[1]?.[0] || '');
    const tempId = 'nc'+Date.now();
    const cust = {
      id:tempId, name, en:f.en||'', policy:f.policy, premium:f.premium ? '฿'+f.premium+'/yr' : '฿—',
      phone:f.phone || '—', bday:f.bday || '—', bdayDays:99, tier:f.tier, preferred:'LINE',
      last:'Just added', next:f.next ? 'Follow-up · '+f.next : 'Active', status:'ok', mono, years:0,
      remarks: f.remark ? [{ date:'Just now', text:f.remark }] : [],
    };
    setData(d => ({
      ...d,
      CUSTOMERS: [cust, ...d.CUSTOMERS],
      ACTIVITIES: [{ id:'ac'+Date.now(), icon:'user', tone:'ok', title:'Customer added', who:name, when:'Today · '+nowTime(), note:'New customer record created.' }, ...d.ACTIVITIES],
    }));
    setAddCust(false);
    persistRow('addCustomer',
      { name, en:f.en||'', policy:f.policy||'', premium:f.premium||'', phone:f.phone||'', tier:f.tier||'', next:f.next||'', remark:f.remark||'' },
      tempId, 'CUSTOMERS');
  };

  const addRemark = (custId, text) => {
    const tempAct = 'ac'+Date.now();
    let who = '';
    setData(d => {
      const c = d.CUSTOMERS.find(x => x.id === custId);
      who = c ? c.name : '';
      return {
        ...d,
        CUSTOMERS: d.CUSTOMERS.map(x => x.id === custId
          ? { ...x, remarks:[{ date:'Just now', text }, ...(x.remarks||[])], last:'Just now' } : x),
        ACTIVITIES: [{ id:tempAct, icon:'note', tone:'info', title:'Note added', who, when:'Today · '+nowTime(), note:text }, ...d.ACTIVITIES],
      };
    });
    if (window.saveToSheet && window.SHEET_WEBAPP_URL) {
      window.saveToSheet('addNote',
        { relatedType:'customer', relatedId:custId, relatedName:who, subject:'Note', text },
        (res) => { const rec = res && res.record; if (rec) setData(d => ({ ...d, ACTIVITIES: d.ACTIVITIES.map(a => a.id === tempAct ? rec : a) })); },
        (err) => { console.warn('[InsureFlow] note save failed:', err); }
      );
    }
  };

  const updateCustomer = (custId, patch) => {
    setData(d => ({ ...d, CUSTOMERS: d.CUSTOMERS.map(x => x.id === custId ? { ...x, ...patch } : x) }));
  };

  const snoozeTask = (task) => {
    setData(d => ({ ...d, TASKS: d.TASKS.map(x => x.id === task.id ? { ...x, due:'snoozed' } : x) }));
  };

  const completeTask = (task, remark) => {
    setData(d => ({
      ...d,
      TASKS: d.TASKS.map(x => x.id === task.id ? { ...x, status:'Completed' } : x),
      ACTIVITIES: [{
        id:'ac'+Date.now(), icon: TASK_ICON[task.type] || 'check', tone:'ok',
        title:'Completed: '+task.cat, who:task.name, when:'Today · '+nowTime(),
        note: remark || undefined,
      }, ...d.ACTIVITIES],
    }));
    setConfirm(null);
  };
  const saveSchedule = (agent, plan) => {
    const dd = new Date(plan.date + 'T00:00:00');
    const isToday = plan.date === '2026-06-09';
    const dstr = isNaN(dd) ? plan.date : dd.toLocaleDateString('en-GB', { day:'numeric', month:'short' });
    const friendly = `${plan.type} · ${isToday ? 'today' : dstr} ${plan.time}`;
    setData(d => ({
      ...d,
      AGENTS: d.AGENTS.map(x => x.id === agent.id ? { ...x, nextAction: friendly, date: friendly } : x),
      TASKS: [{
        id:'ts'+Date.now(), type:'agent', relatedType:'agent', relatedId:agent.id, name:agent.name,
        cat:plan.type, tone:plan.tone||'info', icon:'calendar', sub:agent.job,
        context:friendly, metric:plan.time, metricLabel:'scheduled',
        action:'Review profile', actionIcon:'doc', priority: isToday ? 'high' : 'normal',
        due: isToday ? 'today' : 'scheduled', status:'Open',
      }, ...d.TASKS],
      ACTIVITIES: [{
        id:'ac'+Date.now(), icon:'calendar', tone:'info', title:'Scheduled '+plan.type, who:agent.name,
        when:'Today · '+nowTime(), note: friendly + (plan.remark ? ' — '+plan.remark : ''),
      }, ...d.ACTIVITIES],
    }));
    setSchedule(null);
  };
  const completeCustomerFollowup = (cust) => {
    setConfirm({ id:'cf'+cust.id, type:'renewal', cat:'Follow-up', name:cust.name });
    setProfileId(null);
  };

  /* ---- open helpers ---- */
  const openProfile = (id) => { record('customer', id); setProfileId(id); };
  const openDetail = (type, e) => { record(type, e.id); setDetail({ type, e }); };
  const openTarget = (tg) => {
    if (tg.type === 'customer') { openProfile(tg.id); return; }
    const map = { lead:'LEADS', agent:'AGENTS' };
    const e = (data[map[tg.type]] || []).find(x => x.id === tg.id);
    if (e) openDetail(tg.type, e);
  };

  /* ---- global search ---- */
  const searchOpenEntity = (type, id) => {
    setSearchOpen(false);
    if (type === 'customer') { openProfile(id); return; }
    const src = type === 'lead' ? data.LEADS : data.AGENTS;
    const e = src.find(x => x.id === id);
    if (e) openDetail(type, e);
  };
  const searchAction = (kind, type, ent) => {
    if (kind === 'call' || kind === 'email') return; // would dial / open mail client
    setSearchOpen(false);
    if (kind === 'note') {
      if (type === 'customer') setNote({ open:true, presetId: ent.id });
      else searchOpenEntity(type, ent.id);
    } else if (kind === 'followup') {
      searchOpenEntity(type, ent.id);
    } else if (kind === 'done') {
      setConfirm({ id:'q'+ent.id, type, name: ent.name,
        cat: type==='customer' ? 'Follow-up' : type==='lead' ? 'Lead follow-up' : 'Interview' });
    }
  };

  /* ---- theme ---- */
  const [a0,a1,a2] = ACCENTS[t.accent] || ACCENTS.Gold;
  const [gi0,gi1] = GOLD_INTENSITY[t.goldIntensity] || GOLD_INTENSITY.Subtle;
  const themeVars = {
    '--gold': a0, '--gold-soft': a1, '--gold-deep': a2,
    '--gold-glow': `color-mix(in srgb, ${a0} ${gi0}%, transparent)`,
    '--gold-line': `color-mix(in srgb, ${a0} ${gi1}%, transparent)`,
    '--app-gradient': BACKGROUNDS[t.background] || BACKGROUNDS['Deep Navy'],
    '--font-ui': FONTS[t.font] || FONTS.Sora,
    '--r-md': t.corners + 'px', '--r-lg': (t.corners + 6) + 'px', '--r-sm': Math.max(10, t.corners - 6) + 'px',
  };

  const profile = data.CUSTOMERS.find(c => c.id === profileId);
  const { Sheets } = window;
  const fabActions = [
    { icon:'customers', label:'Add Customer', onClick:()=>setAddCust(true) },
    { icon:'leads',     label:'Add Lead',     onClick:()=>setAddPipeline('leads') },
    { icon:'agents',    label:'Add Agent',    onClick:()=>setAddPipeline('agents') },
    { icon:'note',      label:'Add Note',     onClick:()=>setNote({ open:true, presetId:null }) },
  ];

  let screen = null;
  if (loading) {
    screen = <window.UI.LoadingScreen tab={tab} />;
  } else if (loadError) {
    screen = <window.UI.DataState error={loadError} onRetry={loadData} />;
  } else {
    if (tab==='today')     screen = <window.TodayScreen     data={data} onOpenTarget={openTarget} onNav={go}
                                       onCalendar={()=>setCal(true)} onNote={(id)=>setNote({ open:true, presetId:id||null })}
                                       onComplete={(task)=>setConfirm(task)} onSnooze={snoozeTask} onReport={()=>setReportOpen(true)} />;
    if (tab==='customers') screen = <window.CustomersScreen data={data} onOpen={c => openProfile(c.id)} />;
    if (tab==='leads')     screen = <window.LeadsScreen     data={data} onOpen={l => openDetail('lead', l)} />;
    if (tab==='agents')    screen = <window.AgentsScreen    data={data} onOpen={a => openDetail('agent', a)} onSchedule={setSchedule} />;
  }

  return (
    <div className="s24" style={themeVars}>
      <div className="s24-screen" style={{ background: themeVars['--app-gradient'] }}>
        {!authUser ? (
          <window.LoginScreen onSuccess={signIn} />
        ) : (
        <React.Fragment>
        <TopNav active={tab} onNav={go} onSearch={()=>setSearchOpen(true)} onSignOut={signOut} live={live} loading={loading} error={loadError} />
        <div className={'appbody ' + (t.cardStyle==='Solid' ? 'solid ' : '') + (['customers','leads','agents'].includes(tab) ? 'wide' : '')}>
          {screen}
        </div>
        {!loading && !loadError && <FabMenu actions={fabActions} />}

        {detail && <Sheets.GenericDetail ctx={detail} onClose={()=>setDetail(null)} />}
        {profile && <Sheets.CustomerProfile cust={profile} onClose={()=>setProfileId(null)}
          onAddRemark={addRemark} onUpdate={updateCustomer} onComplete={completeCustomerFollowup} />}
        <Sheets.AddCustomer open={addCust} onClose={()=>setAddCust(false)} onAdd={addCustomer} />
        {window.AddSheet && <window.AddSheet kind={addPipeline||tab} open={adding || !!addPipeline} onClose={()=>{ setAdding(false); setAddPipeline(null); }} onAdd={addEntry} />}
        {confirm && <Sheets.ConfirmDone task={confirm} onClose={()=>setConfirm(null)} onConfirm={completeTask} />}
        <Sheets.NoteComposer open={!!(note&&note.open)} presetId={note&&note.presetId} data={data}
          onClose={()=>setNote(null)} onSave={(id,txt)=>{ addRemark(id,txt); setNote(null); }} />
        <Sheets.Calendar open={cal} data={data} onClose={()=>setCal(false)} />
        {schedule && <Sheets.ScheduleNextAction agent={schedule} onClose={()=>setSchedule(null)} onSave={saveSchedule} />}
        {reportOpen && (
          <div className="report-panel">
            <div className="report-body">
              <window.SummaryScreen data={data} onBack={()=>setReportOpen(false)} />
            </div>
          </div>
        )}
        <window.SearchOverlay open={searchOpen} data={data} recent={recent}
          onClose={()=>setSearchOpen(false)} onOpen={searchOpenEntity} onAct={searchAction} />
        </React.Fragment>
        )}
      </div>

      <window.TweaksPanel>
        <window.TweakSection label="Identity" />
        <window.TweakColor label="Accent" value={ACCENTS[t.accent]}
          options={Object.values(ACCENTS)}
          onChange={(v)=>{ const k = Object.keys(ACCENTS).find(k=>ACCENTS[k][0]===v[0]); setTweak('accent', k||'Gold'); }} />
        <window.TweakSelect label="Background" value={t.background} options={Object.keys(BACKGROUNDS)} onChange={v=>setTweak('background', v)} />
        <window.TweakRadio label="Gold use" value={t.goldIntensity} options={['Subtle','Moderate','Rich']} onChange={v=>setTweak('goldIntensity', v)} />
        <window.TweakSection label="Form" />
        <window.TweakSelect label="Typeface" value={t.font} options={Object.keys(FONTS)} onChange={v=>setTweak('font', v)} />
        <window.TweakRadio label="Cards" value={t.cardStyle} options={['Glass','Solid']} onChange={v=>setTweak('cardStyle', v)} />
        <window.TweakSlider label="Corner radius" value={t.corners} min={12} max={28} unit="px" onChange={v=>setTweak('corners', v)} />
      </window.TweaksPanel>
    </div>
  );
}

window.InsureFlowApp = App;
