/* screen-agents.jsx — recruitment pipeline */
const AGENT_STAGES = [
  { id:'interested',label:'Interested', tone:'info', icon:'spark' },
  { id:'interview', label:'Interview',  tone:'warn', icon:'user' },
  { id:'training',  label:'Training',   tone:'due',  icon:'graduate' },
  { id:'licensed',  label:'Licensed',   tone:'ok',   icon:'shield' },
];

function JourneyRail({ counts, active, onPick }) {
  return (
    <div className="card" style={{ padding:'18px 14px 14px' }}>
      <div className="row between" style={{ position:'relative' }}>
        <div style={{ position:'absolute', left:'12%', right:'12%', top:21, height:2, background:'var(--glass-brd-2)' }}></div>
        {AGENT_STAGES.map(s => {
          const on = active===s.id;
          return (
            <button key={s.id} onClick={()=>onPick(on?'all':s.id)} style={{ background:'none', border:'none', cursor:'pointer',
              display:'flex', flexDirection:'column', alignItems:'center', gap:8, flex:1, zIndex:1, padding:0 }}>
              <div style={{ width:44, height:44, borderRadius:14, display:'grid', placeItems:'center',
                background: on ? `var(--${s.tone}-bg)` : 'var(--navy-2)',
                border: `1px solid ${on?`var(--${s.tone})`:'var(--glass-brd)'}`,
                color: on ? `var(--${s.tone})` : 'var(--ink-mid)', transition:'all 0.2s ease' }}>
                <Icon name={s.icon} size={19} />
              </div>
              <div style={{ fontFamily:'var(--font-num)', fontSize:17, fontWeight:600,
                color: on?'var(--ink-hi)':'var(--ink)' }}>{counts[s.id]||0}</div>
              <div style={{ fontSize:10, color: on?`var(--${s.tone})`:'var(--ink-low)', fontWeight:600 }}>{s.label}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function AgentCard({ a, i, onOpen, onSchedule }) {
  const st = AGENT_STAGES.find(s=>s.id===a.stage);
  const next = a.nextAction || a.date;
  return (
    <div className="card fu" style={{ padding:15, animationDelay:(0.04*i)+'s' }}>
      <div className="press" onClick={onOpen} style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
        <div className="mono thai">{a.mono}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="row between">
            <div className="thai t1" style={{ fontSize:15, fontWeight:600, color:'var(--ink-hi)' }}>{a.name}</div>
            <span className="pill" style={{ marginLeft:8, flex:'0 0 auto', color:`var(--${st.tone})`, background:`var(--${st.tone}-bg)`, borderColor:`var(--${st.tone}-bg)` }}>
              {st.label}</span>
          </div>
          <div style={{ fontSize:12.5, color:'var(--ink-mid)', marginTop:3 }}>
            <Icon name="briefcase" size={12} color="var(--ink-low)" style={{ verticalAlign:'-2px', marginRight:5 }} />{a.job}
          </div>
          <div style={{ fontSize:12, color:'var(--ink)', marginTop:8, padding:'8px 11px', borderRadius:11,
            background:'var(--glass)', border:'1px solid var(--glass-brd)' }}>{a.note}</div>
        </div>
      </div>
      {/* Next Action — generic across all stages */}
      <div className="row between" style={{ marginTop:11, alignItems:'flex-end' }}>
        <div style={{ minWidth:0, flex:1 }}>
          <div style={{ fontSize:9, letterSpacing:0.6, fontWeight:700, color:'var(--ink-low)', textTransform:'uppercase' }}>Next action</div>
          <div className="t1" style={{ fontSize:12.5, fontWeight:600, marginTop:2,
            color: next ? 'var(--ink)' : 'var(--ink-low)', display:'flex', alignItems:'center', gap:6 }}>
            <Icon name="calendar" size={12} color={next ? 'var(--gold-soft)' : 'var(--ink-low)'} />
            {next || 'Not scheduled'}</div>
        </div>
        <div className="row gap8" style={{ flex:'0 0 auto', marginLeft:10 }}>
          <button className="rbtn gold" onClick={e=>{ e.stopPropagation(); }} title="Call"><Icon name="phone" size={16} /></button>
          <button className="rbtn" onClick={e=>{ e.stopPropagation(); }} title="Email"><Icon name="mail" size={16} /></button>
          <button className="rbtn" onClick={e=>{ e.stopPropagation(); onSchedule(a); }} title="Schedule next action"><Icon name="calendar" size={16} /></button>
        </div>
      </div>
    </div>
  );
}

function AgentsScreen({ data, onOpen, onSchedule }) {
  const [stage, setStage] = React.useState('all');
  const counts = {}; AGENT_STAGES.forEach(s => counts[s.id] = data.AGENTS.filter(a=>a.stage===s.id).length);
  const list = data.AGENTS.filter(a => stage==='all' ? true : a.stage===stage);
  return (
    <div className="screen">
      <window.UI.Header eyebrow="Future team" title="Agent recruitment"
        sub={`${data.AGENTS.length} candidates in the journey`}
        right={<button className="rbtn" onClick={()=>window.__openSearch&&window.__openSearch()}><Icon name="search" size={18} /></button>} />
      <JourneyRail counts={counts} active={stage} onPick={setStage} />
      <div className="section-label">
        <span className="t">{stage==='all'?'All candidates':AGENT_STAGES.find(s=>s.id===stage).label}</span>
        <span className="a">{list.length}</span>
      </div>
      <div className="list-grid">
        {list.map((a,i)=><AgentCard key={a.id} a={a} i={i} onOpen={()=>onOpen(a)} onSchedule={onSchedule} />)}
        {list.length===0 && <div className="muted list-empty" style={{ textAlign:'center', padding:'40px 0', fontSize:13 }}>No candidates in this stage</div>}
      </div>
    </div>
  );
}

window.AgentsScreen = AgentsScreen;
window.AGENT_STAGES = AGENT_STAGES;
