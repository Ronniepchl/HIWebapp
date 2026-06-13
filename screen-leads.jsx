/* screen-leads.jsx — new business pipeline */
const LEAD_STAGES = [
  { id:'new',      label:'New',      tone:'info' },
  { id:'contacted',label:'Contacted',tone:'warn' },
  { id:'proposal', label:'Proposal', tone:'due'  },
  { id:'closed',   label:'Closed',   tone:'ok'   },
];
const SRC_TONE = { Website:'info', Referral:'ok', Facebook:'warn', LINE:'due' };

function PipelineBar({ counts, stages }) {
  const total = stages.reduce((s,st)=>s+(counts[st.id]||0),0) || 1;
  return (
    <div className="card" style={{ padding:16 }}>
      <div className="row between" style={{ marginBottom:12 }}>
        <span style={{ fontSize:12.5, fontWeight:600, color:'var(--ink-mid)' }}>Pipeline</span>
        <span style={{ fontSize:12.5, color:'var(--ink-low)' }}>
          <span style={{ fontFamily:'var(--font-num)', color:'var(--ink-hi)', fontWeight:600 }}>{total}</span> in motion
        </span>
      </div>
      <div className="row" style={{ gap:3, height:8, borderRadius:6, overflow:'hidden', marginBottom:14 }}>
        {stages.map(st => {
          const w = ((counts[st.id]||0)/total)*100;
          return <div key={st.id} style={{ width:w+'%', background:`var(--${st.tone})`, opacity:0.85 }}></div>;
        })}
      </div>
      <div className="row between">
        {stages.map(st => (
          <div key={st.id} style={{ textAlign:'center', flex:1 }}>
            <div className="metric" style={{ fontSize:22 }}>{counts[st.id]||0}</div>
            <div className="row gap8" style={{ justifyContent:'center', marginTop:3 }}>
              <span className="dot" style={{ width:6, height:6, background:`var(--${st.tone})` }}></span>
              <span style={{ fontSize:10.5, color:'var(--ink-mid)' }}>{st.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LeadCard({ l, i, onOpen }) {
  const tone = SRC_TONE[l.src] || 'info';
  return (
    <div className="card press fu" style={{ padding:15, animationDelay:(0.04*i)+'s' }} onClick={onOpen}>
      <div className="row gap12" style={{ alignItems:'flex-start' }}>
        <div className="mono thai">{l.mono}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="row between">
            <div className="thai t1" style={{ fontSize:15, fontWeight:600, color:'var(--ink-hi)' }}>{l.name}</div>
            <span style={{ marginLeft:8, fontFamily:'var(--font-num)', fontSize:13, color:'var(--gold)', fontWeight:600, flex:'0 0 auto' }}>{l.value}</span>
          </div>
          <div className="t1" style={{ fontSize:12.5, color:'var(--ink-mid)', marginTop:3 }}>{l.note}</div>
          <div className="row between" style={{ marginTop:11 }}>
            <div className="row gap8">
              <span className="pill" style={{ color:`var(--${tone})`, background:`var(--${tone}-bg)`,
                borderColor:`var(--${tone}-bg)` }}><span className="dot" style={{ width:6,height:6,background:`var(--${tone})` }}></span>{l.src}</span>
              <span style={{ fontSize:11, color:'var(--ink-low)', alignSelf:'center' }}>{l.date}</span>
            </div>
            <button className="rbtn gold" onClick={e=>e.stopPropagation()} title="Call"><Icon name="phone" size={16} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeadsScreen({ data, onOpen }) {
  const [stage, setStage] = React.useState('all');
  const counts = {}; LEAD_STAGES.forEach(s => counts[s.id] = data.LEADS.filter(l=>l.stage===s.id).length);
  const list = data.LEADS.filter(l => stage==='all' ? true : l.stage===stage);
  return (
    <div className="screen">
      <window.UI.Header eyebrow="New business" title="Leads"
        sub={`${data.LEADS.length} potential customers`}
        right={<button className="rbtn"><Icon name="filter" size={18} /></button>} />
      <PipelineBar counts={counts} stages={LEAD_STAGES} />
      <div className="chips" style={{ marginTop:16 }}>
        <button className={'chip'+(stage==='all'?' on':'')} onClick={()=>setStage('all')}>All<span className="ct">{data.LEADS.length}</span></button>
        {LEAD_STAGES.map(s => (
          <button key={s.id} className={'chip'+(stage===s.id?' on':'')} onClick={()=>setStage(s.id)}>{s.label}<span className="ct">{counts[s.id]}</span></button>
        ))}
      </div>
      <div className="list-grid" style={{ marginTop:14 }}>
        {list.map((l,i)=><LeadCard key={l.id} l={l} i={i} onOpen={()=>onOpen(l)} />)}
        {list.length===0 && <div className="muted list-empty" style={{ textAlign:'center', padding:'40px 0', fontSize:13 }}>No leads in this stage</div>}
      </div>
    </div>
  );
}

window.LeadsScreen = LeadsScreen;
window.LEAD_STAGES = LEAD_STAGES;
