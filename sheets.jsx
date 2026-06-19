/* sheets.jsx — all bottom-sheet flows for InsureFlow
   Exports window.Sheets = { GenericDetail, CustomerProfile, AddCustomer, ConfirmDone, NoteComposer, Calendar } */
const { useState: sUseState, useEffect: sUseEffect } = React;
const SHEET = window.UI.Sheet;

/* ---------- shared primitives ---------- */
function Fact({ k, v }) {
  return (
    <div style={{ flex:1, minWidth:0 }}>
      <div style={{ fontSize:10.5, color:'var(--ink-low)', textTransform:'uppercase', letterSpacing:1 }}>{k}</div>
      <div className="thai t1" style={{ fontSize:14, color:'var(--ink-hi)', fontWeight:600, marginTop:3 }}>{v}</div>
    </div>
  );
}
function BigAction({ icon, label, gold, onClick }) {
  return (
    <button onClick={onClick} style={{ flex:1, height:54, borderRadius:16, cursor:'pointer',
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:3,
      background: gold?'var(--gold-glow)':'var(--glass-2)', border:`1px solid ${gold?'var(--gold-line)':'var(--glass-brd)'}`,
      color: gold?'var(--gold)':'var(--ink)', fontFamily:'var(--font-ui)' }}>
      <Icon name={icon} size={20} />
      <span style={{ fontSize:10.5, fontWeight:600 }}>{label}</span>
    </button>
  );
}
function GoldButton({ children, onClick, icon }) {
  return (
    <button onClick={onClick} style={{ width:'100%', height:54, borderRadius:16, cursor:'pointer',
      background:'linear-gradient(150deg, var(--gold), var(--gold-deep))', color:'#1a1407', border:'none',
      fontFamily:'var(--font-ui)', fontSize:15, fontWeight:700, boxShadow:'0 10px 26px rgba(169,133,63,0.4)',
      display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
      {icon && <Icon name={icon} size={18} color="#1a1407" stroke={2.2} />}{children}
    </button>
  );
}
function SheetHead({ title, sub, onClose }) {
  return (
    <div className="row between" style={{ marginBottom:16 }}>
      <div><div style={{ fontSize:19, fontWeight:600, color:'var(--ink-hi)' }}>{title}</div>
        {sub && <div style={{ fontSize:12.5, color:'var(--ink-mid)' }}>{sub}</div>}</div>
      <button className="rbtn" onClick={onClose}><Icon name="x" size={18} /></button>
    </div>
  );
}
const inputStyle = {
  width:'100%', height:50, borderRadius:14, padding:'0 16px',
  background:'var(--glass)', border:'1px solid var(--glass-brd-2)', color:'var(--ink-hi)',
  fontFamily:'var(--font-ui)', fontSize:15, outline:'none',
};
function Field({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ fontSize:11, color:'var(--ink-mid)', fontWeight:600, letterSpacing:0.3, display:'block', marginBottom:8 }}>{label}</label>
      {children}
    </div>
  );
}

/* ---------- Remark timeline ---------- */
function RemarkTimeline({ remarks }) {
  if (!remarks || !remarks.length) {
    return <div style={{ fontSize:12.5, color:'var(--ink-low)', padding:'4px 2px 8px' }}>No remarks yet. Add the first note below.</div>;
  }
  return (
    <div style={{ position:'relative', paddingLeft:18, marginTop:4 }}>
      <div style={{ position:'absolute', left:4, top:6, bottom:8, width:1.5, background:'var(--glass-brd-2)' }}></div>
      {remarks.map((r, i) => (
        <div key={i} style={{ position:'relative', paddingBottom:14 }}>
          <div style={{ position:'absolute', left:-18, top:3, width:9, height:9, borderRadius:'50%',
            background: i===0?'var(--gold)':'var(--navy-2)', border:'2px solid var(--glass-brd-2)' }}></div>
          <div style={{ fontSize:11, color:'var(--gold-soft)', fontWeight:600 }}>{r.date}</div>
          <div className="thai" style={{ fontSize:13, color:'var(--ink)', marginTop:2, lineHeight:1.45 }}>{r.text}</div>
        </div>
      ))}
    </div>
  );
}

window.SheetKit = { Fact, BigAction, GoldButton, SheetHead, inputStyle, Field, RemarkTimeline, SHEET };

/* ---------- Generic detail (lead / agent / task) ---------- */
function GenericDetail({ ctx, onClose, onContact }) {
  const { type, e } = ctx;
  const title = e.name || e.title;
  const mono = e.mono || (title ? title.slice(0,2) : '••');
  let facts = [], tl = [], actions = [];
  if (type === 'lead') {
    facts = [['Source', e.src],['Est. value', e.value],['Entered', e.date],['Stage', e.stage]];
    tl = [{t:e.note, d:'Latest'},{t:`Came in via ${e.src}`, d:e.date}];
    actions = [['phone','Call',true],['mail','Email',false],['doc','Proposal',false]];
  } else if (type === 'agent') {
    facts = [['Occupation', e.job],['Stage', e.stage],['Next', e.date]];
    tl = [{t:e.note, d:'Note'},{t:`Currently a ${e.job}`, d:'Background'}];
    actions = [['phone','Call',true],['mail','Email',false],['calendar','Schedule',false]];
  }
  return (
    <SHEET open={true} onClose={onClose}>
      <div className="row gap14" style={{ marginBottom:18 }}>
        <div className="mono thai" style={{ width:54, height:54, fontSize:18, borderRadius:17 }}>{mono}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="thai t1" style={{ fontSize:19, fontWeight:600, color:'var(--ink-hi)' }}>{title}</div>
          {e.job && <div className="t1" style={{ fontSize:12.5, color:'var(--ink-mid)' }}>{e.job}</div>}
          {e.note && type==='lead' && <div className="t1" style={{ fontSize:12.5, color:'var(--ink-mid)' }}>{e.note}</div>}
        </div>
        <button className="rbtn" onClick={onClose}><Icon name="x" size={18} /></button>
      </div>
      <div className="row gap10" style={{ marginBottom:18 }}>
        {actions.map((a,i)=><BigAction key={i} icon={a[0]} label={a[1]} gold={a[2]}
          onClick={a[1]==='Call' ? () => window.dialPhone(e.phone)
                 : a[1]==='Email' ? () => window.composeEmail(e.email)
                 : onClose} />)}
      </div>
      <div className="card" style={{ padding:'14px 16px', marginBottom:18 }}>
        <div style={{ display:'flex', flexWrap:'wrap', rowGap:14 }}>
          {facts.map((f,i)=><div key={i} style={{ flex:'1 1 45%' }}><Fact k={f[0]} v={f[1]} /></div>)}
        </div>
      </div>
      <div style={{ fontSize:12, fontWeight:600, color:'var(--ink-mid)', margin:'0 2px 10px' }}>Recent activity</div>
      <div style={{ position:'relative', paddingLeft:18 }}>
        <div style={{ position:'absolute', left:4, top:6, bottom:6, width:1.5, background:'var(--glass-brd-2)' }}></div>
        {tl.map((it,i)=>(
          <div key={i} style={{ position:'relative', paddingBottom:14 }}>
            <div style={{ position:'absolute', left:-18, top:3, width:9, height:9, borderRadius:'50%',
              background:i===0?'var(--gold)':'var(--navy-2)', border:'2px solid var(--glass-brd-2)' }}></div>
            <div className="thai" style={{ fontSize:13, color:'var(--ink)' }}>{it.t}</div>
            <div style={{ fontSize:11, color:'var(--ink-low)' }}>{it.d}</div>
          </div>
        ))}
      </div>
      <div style={{ marginTop:10 }}><GoldButton onClick={onClose}>Log a touchpoint</GoldButton></div>
    </SHEET>
  );
}

/* ---------- Customer profile (rich, editable) ---------- */
const STATUS_OPTS = [
  { id:'flame', label:'High priority' },
  { id:'due',   label:'Renewal soon' },
  { id:'warn',  label:'Follow-up' },
  { id:'ok',    label:'Active' },
];
const NEXT_OPTS = ['In 3 days','Next week','In 2 weeks','Next month'];

function polTone(status) {
  const s = String(status||'').toLowerCase();
  if (s.indexOf('laps')>=0 || s.indexOf('expir')>=0 || s.indexOf('cancel')>=0) return 'due';
  if (s.indexOf('pend')>=0 || s.indexOf('grace')>=0) return 'warn';
  return 'ok';
}

function CustomerProfile({ cust, onClose, onAddRemark, onUpdate, onComplete }) {
  const [tab, setTab] = sUseState('overview');
  const [note, setNote] = sUseState('');
  sUseEffect(() => { setTab('overview'); setNote(''); }, [cust && cust.id]);
  if (!cust) return null;
  const tierTone = cust.tier === 'VIP' ? 'gold' : cust.tier === 'Gold' ? 'warn' : 'info';
  const saveNote = () => { if (note.trim()) { onAddRemark(cust.id, note.trim()); setNote(''); } };
  return (
    <SHEET open={true} onClose={onClose}>
      <div className="row gap14" style={{ marginBottom:16 }}>
        <div className="mono thai" style={{ width:54, height:54, fontSize:18, borderRadius:17 }}>{cust.mono}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="row gap8" style={{ alignItems:'center' }}>
            <div className="thai t1" style={{ fontSize:19, fontWeight:600, color:'var(--ink-hi)' }}>{cust.name}</div>
          </div>
          <div className="row gap8" style={{ marginTop:4 }}>
            <span className="pill" style={{ height:22, color: tierTone==='gold'?'var(--gold)':`var(--${tierTone})`,
              background: tierTone==='gold'?'var(--gold-glow)':`var(--${tierTone}-bg)`,
              borderColor: tierTone==='gold'?'var(--gold-line)':`var(--${tierTone}-bg)` }}>{cust.tier}</span>
            <span style={{ fontSize:12, color:'var(--ink-mid)' }}>{cust.policy}{cust.policyCount > 1 ? ' · +'+(cust.policyCount-1)+' more' : ''}</span>
          </div>
        </div>
        <button className="rbtn" onClick={onClose}><Icon name="x" size={18} /></button>
      </div>

      {/* quick actions */}
      <div className="row gap10" style={{ marginBottom:16 }}>
        <BigAction icon="phone" label="Call" gold onClick={() => window.dialPhone(cust.phone)} />
        <BigAction icon="mail"  label="Email" onClick={() => window.composeEmail(cust.email)} />
        <BigAction icon="calendar" label="Follow-up" onClick={() => setTab('manage')} />
        <BigAction icon="check" label="Done" onClick={() => onComplete(cust)} />
      </div>

      {/* tabs */}
      <div className="seg" style={{ marginBottom:16 }}>
        {['overview','timeline','manage'].map(tk => (
          <button key={tk} className={tab===tk?'on':''} onClick={()=>setTab(tk)} style={{ textTransform:'capitalize' }}>{tk}</button>
        ))}
      </div>

      {tab==='overview' && (
        <div>
          {/* Policies — one row per policy, maintained in the Policies sheet tab */}
          <div className="row between" style={{ margin:'0 2px 8px' }}>
            <span style={{ fontSize:11, fontWeight:700, letterSpacing:0.6, color:'var(--ink-low)', textTransform:'uppercase' }}>
              Policies{cust.policyCount ? ' · '+cust.policyCount : ''}</span>
            <span style={{ fontSize:11.5, color:'var(--ink-mid)', fontFamily:'var(--font-num)' }}>
              {cust.premium}<span style={{ color:'var(--ink-low)', fontFamily:'var(--font-ui)' }}> total</span></span>
          </div>
          {(cust.policies||[]).map((p,i)=>(
            <div key={i} className="card" style={{ padding:'12px 14px', marginBottom:8 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:36, height:36, borderRadius:11, flex:'0 0 auto', display:'grid', placeItems:'center',
                  background:'var(--gold-glow)', color:'var(--gold)' }}><Icon name="shield" size={17} /></div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div className="thai t1" style={{ fontSize:14, fontWeight:600, color:'var(--ink-hi)' }}>{p.plan}</div>
                  <div style={{ fontSize:11.5, color:'var(--ink-mid)', marginTop:2 }}>
                    {p.policyNo ? p.policyNo+' · ' : ''}{p.renewal ? 'Renews '+p.renewal : 'No renewal date'}</div>
                </div>
                <div style={{ textAlign:'right', flex:'0 0 auto' }}>
                  <div style={{ fontFamily:'var(--font-num)', fontSize:13, fontWeight:600, color:'var(--gold)' }}>{p.premium}</div>
                  <span className="pill" style={{ marginTop:4, height:18, fontSize:9.5, color:`var(--${polTone(p.status)})`,
                    background:`var(--${polTone(p.status)}-bg)`, borderColor:`var(--${polTone(p.status)}-bg)` }}>{p.status}</span>
                </div>
              </div>
              {(p.riders && p.riders.length>0) && (
                <div style={{ marginTop:10, paddingLeft:48 }}>
                  <div style={{ fontSize:9, fontWeight:700, letterSpacing:0.5, color:'var(--ink-low)', textTransform:'uppercase', marginBottom:5 }}>
                    Riders · {p.riders.length}</div>
                  <div className="row gap8" style={{ flexWrap:'wrap' }}>
                    {p.riders.map((r,ri)=>(
                      <span key={ri} title={r.code} className="pill" style={{ height:19, fontSize:9.5, color:'var(--ink-mid)',
                        background:'var(--glass-2)', borderColor:'var(--glass-brd)' }}>{r.label}{r.code?' · '+r.code:''}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {(!cust.policies || !cust.policies.length) && (
            <div className="card" style={{ padding:'14px', marginBottom:8, fontSize:12.5, color:'var(--ink-mid)', textAlign:'center' }}>
              No policies on file. Add rows in the Policies sheet tab.</div>
          )}

          {/* Contact details */}
          <div className="card" style={{ padding:'16px', marginTop:4, marginBottom:8 }}>
            <div style={{ display:'flex', flexWrap:'wrap', rowGap:16 }}>
              {[['Phone',cust.phone],['Birthday',cust.bday],['Preferred',cust.preferred],['Last contact',cust.last],
                ['Next action',cust.next],['Customer for',cust.years+' years'],['Status',STATUS_OPTS.find(s=>s.id===cust.status)?.label||'Active']]
                .map((f,i)=><div key={i} style={{ flex:'1 1 45%' }}><Fact k={f[0]} v={f[1]} /></div>)}
            </div>
          </div>
        </div>
      )}

      {tab==='timeline' && (
        <div>
          <RemarkTimeline remarks={cust.remarks} />
          <Field label="ADD NEW REMARK">
            <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="พิมพ์บันทึก…" className="thai"
              style={{ ...inputStyle, height:90, padding:'12px 14px', resize:'none', lineHeight:1.5 }} />
          </Field>
          <GoldButton icon="plus" onClick={saveNote}>Add remark to timeline</GoldButton>
        </div>
      )}

      {tab==='manage' && (
        <div>
          <Field label="CUSTOMER STATUS">
            <div className="chips">
              {STATUS_OPTS.map(s => (
                <button key={s.id} className={'chip'+(cust.status===s.id?' on':'')} onClick={()=>onUpdate(cust.id,{ status:s.id })}>{s.label}</button>
              ))}
            </div>
          </Field>
          <Field label="SET NEXT FOLLOW-UP">
            <div className="chips">
              {NEXT_OPTS.map(n => (
                <button key={n} className={'chip'+(cust.next===('Follow-up · '+n)?' on':'')} onClick={()=>onUpdate(cust.id,{ next:'Follow-up · '+n })}>{n}</button>
              ))}
            </div>
          </Field>
          <Field label="POLICIES">
            <div style={{ fontSize:12.5, color:'var(--ink-mid)', lineHeight:1.55, padding:'2px' }}>
              {(cust.policyCount||0)} {cust.policyCount===1?'policy':'policies'} on file. Add, edit, or remove policies in the{' '}
              <b style={{ color:'var(--ink)' }}>Policies</b> tab of your Google Sheet — they sync here automatically.</div>
          </Field>
          <div style={{ marginTop:6 }}><GoldButton icon="check" onClick={() => onComplete(cust)}>Mark follow-up done</GoldButton></div>
        </div>
      )}
    </SHEET>
  );
}

/* ---------- Add customer form ---------- */
function AddCustomer({ open, onClose, onAdd }) {
  const blank = { name:'', phone:'', bday:'', policy:'Health', premium:'', tier:'Standard', next:'', remark:'' };
  const [f, setF] = sUseState(blank);
  sUseEffect(() => { if (open) setF(blank); }, [open]);
  if (!open) return null;
  const set = (k,v) => setF(p => ({ ...p, [k]:v }));
  return (
    <SHEET open={true} onClose={onClose}>
      <SheetHead title="New customer" sub="Synced to Customers sheet" onClose={onClose} />
      <Field label="FULL NAME">
        <input value={f.name} onChange={e=>set('name',e.target.value)} placeholder="พิมพ์ชื่อ-นามสกุล" className="thai" style={inputStyle} />
      </Field>
      <div className="row gap10">
        <div style={{ flex:1 }}><Field label="PHONE">
          <input value={f.phone} onChange={e=>set('phone',e.target.value)} placeholder="08x-xxx-xxxx" inputMode="tel" style={inputStyle} />
        </Field></div>
        <div style={{ flex:1 }}><Field label="BIRTHDAY">
          <input value={f.bday} onChange={e=>set('bday',e.target.value)} placeholder="e.g. 9 Jun" style={inputStyle} />
        </Field></div>
      </div>
      <div className="row gap10">
        <div style={{ flex:1 }}><Field label="POLICY">
          <select value={f.policy} onChange={e=>set('policy',e.target.value)} style={{ ...inputStyle, appearance:'none', WebkitAppearance:'none' }}>
            {window.POLICY_TYPES.map(p => <option key={p} value={p} style={{ color:'#0a1428' }}>{p}</option>)}
          </select>
        </Field></div>
        <div style={{ flex:1 }}><Field label="PREMIUM (฿/yr)">
          <input value={f.premium} onChange={e=>set('premium',e.target.value)} placeholder="48,000" inputMode="numeric" style={inputStyle} />
        </Field></div>
      </div>
      <Field label="CUSTOMER TIER">
        <div className="chips">
          {window.TIERS.map(tt => <button key={tt} className={'chip'+(f.tier===tt?' on':'')} onClick={()=>set('tier',tt)}>{tt}</button>)}
        </div>
      </Field>
      <Field label="NEXT ACTION">
        <div className="chips">
          {NEXT_OPTS.map(n => <button key={n} className={'chip'+(f.next===n?' on':'')} onClick={()=>set('next',n)}>{n}</button>)}
        </div>
      </Field>
      <Field label="REMARK (OPTIONAL)">
        <textarea value={f.remark} onChange={e=>set('remark',e.target.value)} placeholder="พิมพ์บันทึกแรก…" className="thai"
          style={{ ...inputStyle, height:74, padding:'12px 14px', resize:'none', lineHeight:1.5 }} />
      </Field>
      <div style={{ marginTop:4 }}><GoldButton icon="plus" onClick={()=>onAdd(f)}>Add customer</GoldButton></div>
    </SHEET>
  );
}

/* ---------- Confirm: mark task complete (2-tap) ---------- */
function ConfirmDone({ task, onClose, onConfirm }) {
  const [remark, setRemark] = sUseState('');
  sUseEffect(() => { setRemark(''); }, [task && task.id]);
  if (!task) return null;
  return (
    <SHEET open={true} onClose={onClose}>
      <div style={{ textAlign:'center', marginBottom:16 }}>
        <div style={{ width:54, height:54, borderRadius:18, margin:'2px auto 12px', display:'grid', placeItems:'center',
          background:'var(--gold-glow)', border:'1px solid var(--gold-line)', color:'var(--gold)' }}>
          <Icon name="check" size={26} stroke={2.2} /></div>
        <div style={{ fontSize:18, fontWeight:600, color:'var(--ink-hi)' }}>Mark this task as completed?</div>
        <div className="thai" style={{ fontSize:13, color:'var(--ink-mid)', marginTop:4 }}>{task.cat} · {task.name}</div>
      </div>
      <Field label="REMARK (OPTIONAL)">
        <textarea value={remark} onChange={e=>setRemark(e.target.value)} placeholder="พิมพ์บันทึกสั้น ๆ…" className="thai"
          style={{ ...inputStyle, height:80, padding:'12px 14px', resize:'none', lineHeight:1.5 }} />
      </Field>
      <div className="row gap10" style={{ marginTop:4 }}>
        <button onClick={onClose} style={{ flex:1, height:54, borderRadius:16, cursor:'pointer',
          background:'var(--glass-2)', border:'1px solid var(--glass-brd)', color:'var(--ink)',
          fontFamily:'var(--font-ui)', fontSize:15, fontWeight:600 }}>Cancel</button>
        <div style={{ flex:1.4 }}><GoldButton icon="check" onClick={()=>onConfirm(task, remark.trim())}>Complete task</GoldButton></div>
      </div>
    </SHEET>
  );
}

/* ---------- Note composer (from Today quick action) ---------- */
function NoteComposer({ open, presetId, data, onClose, onSave }) {
  const [note, setNote] = sUseState('');
  const [who, setWho] = sUseState(presetId || null);
  sUseEffect(() => { if (open) { setNote(''); setWho(presetId || null); } }, [open, presetId]);
  if (!open) return null;
  return (
    <SHEET open={true} onClose={onClose}>
      <SheetHead title="Quick note" onClose={onClose} />
      <Field label="ABOUT CUSTOMER">
        <div className="chips">
          {data.CUSTOMERS.slice(0,6).map(c => (
            <button key={c.id} className={'chip thai'+(who===c.id?' on':'')} onClick={()=>setWho(c.id)}>{c.name.split(' ')[0]}</button>
          ))}
        </div>
      </Field>
      <Field label="NOTE">
        <textarea value={note} onChange={e=>setNote(e.target.value)} placeholder="พิมพ์บันทึก…" className="thai"
          style={{ ...inputStyle, height:110, padding:'12px 14px', resize:'none', lineHeight:1.5 }} />
      </Field>
      <GoldButton icon="check" onClick={() => { if (who && note.trim()) onSave(who, note.trim()); else onClose(); }}>Save note</GoldButton>
    </SHEET>
  );
}

/* ---------- Calendar (this week) ---------- */
function Calendar({ open, data, onClose }) {
  if (!open) return null;
  return (
    <SHEET open={true} onClose={onClose}>
      <SheetHead title="This week" sub="9 – 15 June 2026" onClose={onClose} />
      <div className="card" style={{ padding:'4px 14px' }}>
        {data.UPCOMING.map((u,i)=>(
          <div key={u.id} className="row gap12" style={{ padding:'12px 4px', borderBottom: i<data.UPCOMING.length-1?'1px solid var(--glass-brd)':'none' }}>
            <div style={{ width:36, height:36, borderRadius:11, flex:'0 0 auto', display:'grid', placeItems:'center',
              background:'var(--glass)', border:'1px solid var(--glass-brd)', color:`var(--${u.tone})` }}>
              <Icon name={u.icon} size={17} /></div>
            <div style={{ flex:1, minWidth:0 }}>
              <div className="t1" style={{ fontSize:14, fontWeight:600, color:'var(--ink-hi)' }}>{u.kind} · <span className="thai">{u.name}</span></div>
              <div style={{ fontSize:11.5, color:'var(--ink-low)' }}>{u.when}</div></div>
          </div>
        ))}
      </div>
    </SHEET>
  );
}

/* ---------- Add lead / candidate ---------- */
function AddSheet({ kind, open, onClose, onAdd }) {
  const [name, setName] = sUseState('');
  const isAgent = kind === 'agents';
  const sources = isAgent ? ['Referral','Walk-in','Job board','LINE'] : ['Website','Referral','Facebook','LINE'];
  const [src, setSrc] = sUseState(sources[0]);
  const [phone, setPhone] = sUseState('');
  sUseEffect(() => { if (open) { setName(''); setSrc(sources[0]); setPhone(''); } }, [open]);
  if (!open) return null;
  return (
    <SHEET open={true} onClose={onClose}>
      <SheetHead title={isAgent ? 'New candidate' : 'New lead'} onClose={onClose} />
      <Field label="NAME">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="พิมพ์ชื่อ…" className="thai" style={inputStyle} />
      </Field>
      <Field label="PHONE">
        <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="08x-xxx-xxxx" inputMode="tel" style={inputStyle} />
      </Field>
      <Field label={isAgent ? 'CURRENT OCCUPATION / CHANNEL' : 'SOURCE'}>
        <div className="chips">
          {sources.map(s => <button key={s} className={'chip'+(src===s?' on':'')} onClick={()=>setSrc(s)}>{s}</button>)}
        </div>
      </Field>
      <div style={{ marginTop:6 }}><GoldButton icon="plus" onClick={()=>onAdd(name||'New entry', src, phone)}>Add to pipeline</GoldButton></div>
    </SHEET>
  );
}
window.AddSheet = AddSheet;

/* ---------- Schedule Next Action (recruitment planning) ---------- */
const ACTION_TYPES = [
  { id:'Interview',        icon:'user',     tone:'warn' },
  { id:'Follow-up Call',   icon:'phone',    tone:'info' },
  { id:'Coffee Chat',      icon:'chat',     tone:'info' },
  { id:'Training Session', icon:'graduate', tone:'due'  },
  { id:'Onboarding',       icon:'shield',   tone:'ok'   },
  { id:'Other',            icon:'spark',    tone:'info' },
];

function ScheduleNextAction({ agent, onClose, onSave }) {
  const todayStr = (() => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); })();
  const [type, setType] = sUseState('Interview');
  const [date, setDate] = sUseState(todayStr);
  const [time, setTime] = sUseState('14:00');
  const [remark, setRemark] = sUseState('');
  const [guest, setGuest] = sUseState('');
  sUseEffect(() => { if (agent) { setType('Interview'); setDate(todayStr); setTime('14:00'); setRemark('');
    setGuest(agent.email && agent.email !== '—' ? agent.email : ''); } }, [agent && agent.id]);
  if (!agent) return null;
  const at = ACTION_TYPES.find(a => a.id === type) || ACTION_TYPES[0];
  return (
    <SHEET open={true} onClose={onClose}>
      <SheetHead title="Schedule Next Action" sub={agent.name} onClose={onClose} />

      <Field label="ACTION TYPE">
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
          {ACTION_TYPES.map(a => {
            const on = type === a.id;
            return (
              <button key={a.id} onClick={()=>setType(a.id)} style={{ cursor:'pointer', textAlign:'left',
                display:'flex', alignItems:'center', gap:9, height:46, padding:'0 12px', borderRadius:13,
                background: on ? `var(--${a.tone}-bg)` : 'var(--glass)',
                border:`1px solid ${on ? `var(--${a.tone})` : 'var(--glass-brd)'}`,
                color: on ? 'var(--ink-hi)' : 'var(--ink-mid)', fontFamily:'var(--font-ui)',
                fontSize:12.5, fontWeight:600, transition:'all 0.16s ease' }}>
                <Icon name={a.icon} size={16} color={on ? `var(--${a.tone})` : 'var(--ink-low)'} />{a.id}
              </button>
            );
          })}
        </div>
      </Field>

      <div className="row gap10">
        <div style={{ flex:1 }}><Field label="DATE">
          <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{ ...inputStyle, colorScheme:'dark' }} />
        </Field></div>
        <div style={{ flex:1 }}><Field label="TIME (24H)">
          <div className="row gap8">
            <select value={(time||'00:00').split(':')[0]} onChange={e=>setTime(e.target.value+':'+(time||'00:00').split(':')[1])}
              style={{ ...inputStyle, colorScheme:'dark', flex:1, cursor:'pointer' }}>
              {Array.from({length:24},(_,h)=>{ const v=String(h).padStart(2,'0'); return <option key={v} value={v}>{v}</option>; })}
            </select>
            <span style={{ alignSelf:'center', color:'var(--ink-mid)', fontWeight:700 }}>:</span>
            <select value={(time||'00:00').split(':')[1]} onChange={e=>setTime((time||'00:00').split(':')[0]+':'+e.target.value)}
              style={{ ...inputStyle, colorScheme:'dark', flex:1, cursor:'pointer' }}>
              {Array.from({length:12},(_,i)=>{ const v=String(i*5).padStart(2,'0'); return <option key={v} value={v}>{v}</option>; })}
            </select>
          </div>
        </Field></div>
      </div>

      <Field label="REMARK (OPTIONAL)">
        <textarea value={remark} onChange={e=>setRemark(e.target.value)} placeholder="พิมพ์รายละเอียด…" className="thai"
          style={{ ...inputStyle, height:74, padding:'12px 14px', resize:'none', lineHeight:1.5 }} />
      </Field>

      {/* Google Calendar sync — event lands on your calendar; guest gets invited */}
      <div style={{ margin:'2px 0 16px', padding:'12px 13px', borderRadius:13,
        background:'var(--gold-glow)', border:'1px solid var(--gold-line)' }}>
        <div className="row gap10" style={{ marginBottom:10 }}>
          <Icon name="calendar" size={16} color="var(--gold)" />
          <span style={{ flex:1, fontSize:12.5, fontWeight:600, color:'var(--gold)' }}>Sync to Google Calendar</span>
        </div>
        <Field label="INVITE AGENT · GUEST EMAIL">
          <input value={guest} onChange={e=>setGuest(e.target.value)} placeholder="agent@email.com" inputMode="email" style={inputStyle} />
        </Field>
        <div style={{ fontSize:11, color:'var(--ink-low)', marginTop:7, lineHeight:1.5 }}>
          The event is added to your Google Calendar. Fill an email to invite the agent as a guest, or leave blank to skip the invite.
        </div>
      </div>

      <div className="row gap10">
        <button onClick={onClose} style={{ flex:1, height:54, borderRadius:16, cursor:'pointer',
          background:'var(--glass-2)', border:'1px solid var(--glass-brd)', color:'var(--ink)',
          fontFamily:'var(--font-ui)', fontSize:15, fontWeight:600 }}>Cancel</button>
        <div style={{ flex:1.4 }}><GoldButton icon="check" onClick={()=>onSave(agent, { type, date, time, remark:remark.trim(), tone:at.tone, guest:guest.trim() })}>Save</GoldButton></div>
      </div>
    </SHEET>
  );
}

window.Sheets = { GenericDetail, CustomerProfile, AddCustomer, ConfirmDone, NoteComposer, Calendar, ScheduleNextAction };

