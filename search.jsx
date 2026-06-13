/* search.jsx — global search overlay + recently viewed
   Exports window.SearchOverlay */
const { useState: seUseState, useEffect: seUseEffect, useRef: seUseRef } = React;

const TYPE_LABEL = { customer:'Customer', lead:'Lead', agent:'Agent' };
const CUST_STATUS_LABEL = { flame:'High priority', due:'Renewal soon', warn:'Follow-up', ok:'Active' };

function digits(s) { return (s || '').replace(/\D/g, ''); }

function ResultActions({ type, ent, onAct }) {
  const acts = [
    ['phone','Call','call'],
    ['mail','Email','email'],
    ['note','Note','note'],
    ['calendar','Follow-up','followup'],
    ['check','Done','done'],
  ];
  return (
    <div className="row gap8" style={{ marginTop:11 }}>
      {acts.map(([icon,label,kind],i) => (
        <button key={i} title={label} onClick={(e)=>{ e.stopPropagation(); onAct(kind, type, ent); }}
          className={'rbtn' + (kind==='call' ? ' gold' : '')}
          style={{ flex:1, width:'auto', height:38 }}>
          <Icon name={icon} size={16} />
        </button>
      ))}
    </div>
  );
}

function ResultCard({ type, ent, status, next, onOpen, onAct }) {
  return (
    <div className="card press fu" style={{ padding:14, marginBottom:10 }} onClick={onOpen}>
      <div className="row gap12" style={{ alignItems:'flex-start' }}>
        <div className="mono thai" style={{ width:42, height:42, borderRadius:13, fontSize:15 }}>{ent.mono}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="row between">
            <div className="thai t1" style={{ fontSize:15, fontWeight:600, color:'var(--ink-hi)' }}>{ent.name}</div>
            <span style={{ fontSize:10.5, fontWeight:600, letterSpacing:0.4, color:'var(--ink-low)',
              textTransform:'uppercase', flex:'0 0 auto', marginLeft:8 }}>{TYPE_LABEL[type]}</span>
          </div>
          <div className="row gap8" style={{ marginTop:5, flexWrap:'wrap' }}>
            <span className="pill" style={{ height:22, color:`var(--${status.tone})`, background:`var(--${status.tone}-bg)`,
              borderColor:`var(--${status.tone}-bg)` }}>
              <span className="dot" style={{ width:6, height:6, background:`var(--${status.tone})` }}></span>{status.label}</span>
            <span className="t1" style={{ fontSize:11.5, color:'var(--ink-mid)', alignSelf:'center' }}>{next}</span>
          </div>
        </div>
      </div>
      <ResultActions type={type} ent={ent} onAct={onAct} />
    </div>
  );
}

function Group({ icon, label, count, children }) {
  if (!count) return null;
  return (
    <React.Fragment>
      <div className="res-group"><Icon name={icon} size={13} color="var(--gold-soft)" />{label}<span className="ct">{count}</span></div>
      {children}
    </React.Fragment>
  );
}

function SearchOverlay({ open, data, recent, onClose, onOpen, onAct }) {
  const [q, setQ] = seUseState('');
  const inputRef = seUseRef(null);
  seUseEffect(() => {
    if (open) { setQ(''); setTimeout(() => inputRef.current && inputRef.current.focus(), 60); }
  }, [open]);
  if (!open) return null;

  const query = q.trim().toLowerCase();
  const qd = digits(q);
  const has = (s) => (s || '').toLowerCase().includes(query);

  const matchC = (c) => !query || has(c.name) || has(c.en) || has(c.policy) || (qd && digits(c.phone).includes(qd));
  const matchL = (l) => !query || has(l.name) || has(l.src) || has(l.note);
  const matchA = (a) => !query || has(a.name) || has(a.job);

  const custs  = data.CUSTOMERS.filter(matchC);
  const leads  = data.LEADS.filter(matchL);
  const agents = data.AGENTS.filter(matchA);
  const total = custs.length + leads.length + agents.length;

  const custStatus = (c) => ({ tone: c.status==='flame'?'due':c.status, label: CUST_STATUS_LABEL[c.status] || 'Active' });
  const leadStatus = (l) => ({ tone: l.stage==='closed'?'ok':l.stage==='proposal'?'due':l.stage==='contacted'?'warn':'info',
    label: l.stage.charAt(0).toUpperCase()+l.stage.slice(1) });
  const agentStatus = (a) => ({ tone: a.stage==='licensed'?'ok':a.stage==='training'?'due':a.stage==='interview'?'warn':'info',
    label: a.stage.charAt(0).toUpperCase()+a.stage.slice(1) });

  // resolve recently viewed
  const recentEnts = recent.map(r => {
    const src = r.type==='customer' ? data.CUSTOMERS : r.type==='lead' ? data.LEADS : data.AGENTS;
    const ent = src.find(x => x.id === r.id);
    return ent ? { type:r.type, ent } : null;
  }).filter(Boolean);

  return (
    <div className="search-panel">
      <div className="search-field">
        <Icon name="search" size={19} color="var(--gold-soft)" />
        <input ref={inputRef} value={q} onChange={e=>setQ(e.target.value)}
          placeholder="Search customer, lead, or agent..." className="thai" />
        {q && <button className="rbtn" style={{ width:30, height:30 }} onClick={()=>setQ('')}><Icon name="x" size={15} /></button>}
        <button className="rbtn" style={{ width:34, height:34 }} onClick={onClose}><Icon name="chevronD" size={17} /></button>
      </div>

      <div className="search-body">
        {!query && (
          <React.Fragment>
            <div className="res-group"><Icon name="clock" size={13} color="var(--gold-soft)" />Recently viewed</div>
            {recentEnts.length === 0 && (
              <div style={{ fontSize:12.5, color:'var(--ink-low)', padding:'2px 2px 4px' }}>
                No profiles opened yet. Search above to find anyone instantly.</div>
            )}
            {recentEnts.map(({type,ent}) => {
              const st = type==='customer'?custStatus(ent):type==='lead'?leadStatus(ent):agentStatus(ent);
              const nx = type==='customer'?ent.next:type==='lead'?ent.date:ent.date;
              return <ResultCard key={type+ent.id} type={type} ent={ent} status={st} next={nx}
                onOpen={()=>onOpen(type, ent.id)} onAct={onAct} />;
            })}
          </React.Fragment>
        )}

        {query && total === 0 && (
          <div style={{ textAlign:'center', padding:'48px 16px', color:'var(--ink-mid)' }}>
            <Icon name="search" size={26} color="var(--ink-low)" />
            <div style={{ fontSize:14, fontWeight:600, color:'var(--ink-hi)', marginTop:10 }}>No matches</div>
            <div style={{ fontSize:12.5, marginTop:3 }}>Try a name, nickname, or phone number.</div>
          </div>
        )}

        {query && (
          <React.Fragment>
            <Group icon="customers" label="Customers" count={custs.length}>
              {custs.map(c => <ResultCard key={c.id} type="customer" ent={c} status={custStatus(c)} next={c.next}
                onOpen={()=>onOpen('customer', c.id)} onAct={onAct} />)}
            </Group>
            <Group icon="leads" label="Leads" count={leads.length}>
              {leads.map(l => <ResultCard key={l.id} type="lead" ent={l} status={leadStatus(l)} next={l.date}
                onOpen={()=>onOpen('lead', l.id)} onAct={onAct} />)}
            </Group>
            <Group icon="agents" label="Agents" count={agents.length}>
              {agents.map(a => <ResultCard key={a.id} type="agent" ent={a} status={agentStatus(a)} next={a.date}
                onOpen={()=>onOpen('agent', a.id)} onAct={onAct} />)}
            </Group>
          </React.Fragment>
        )}
      </div>
    </div>
  );
}

window.SearchOverlay = SearchOverlay;
