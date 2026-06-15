/* screen-customers.jsx */
const { Header: CHeader } = window.UI;

const CUST_FILTERS = [
  { id:'all',  label:'All' },
  { id:'due',  label:'Renewal soon' },
  { id:'warn', label:'Follow-up' },
  { id:'flame',label:'High priority' },
  { id:'ok',   label:'Active' },
];
const CUST_BADGE = {
  due:  { cls:'due',  txt:'Renewal soon', icon:'renew' },
  warn: { cls:'warn', txt:'Follow-up',    icon:'phone' },
  flame:{ cls:'due',  txt:'High priority',icon:'flame' },
  ok:   { cls:'ok',   txt:'Active',       icon:'check' },
};

function CustomerCard({ c, onOpen, i }) {
  const b = CUST_BADGE[c.status];
  return (
    <div className="card press fu" style={{ padding:15, animationDelay:(0.04*i)+'s' }} onClick={onOpen}>
      <div className="row gap12" style={{ alignItems:'flex-start' }}>
        <div className="mono thai">{c.mono}</div>
        <div style={{ flex:1, minWidth:0 }}>
          <div className="row between">
            <div className="thai t1" style={{ fontSize:15.5, fontWeight:600, color:'var(--ink-hi)' }}>{c.name}</div>
            <span className="dot" style={{ marginLeft:8, background:`var(--${b.cls})`, boxShadow:`0 0 10px var(--${b.cls})` }}></span>
          </div>
          <div style={{ fontSize:12.5, color:'var(--ink-mid)', marginTop:2 }}>
            {c.policy} · <span style={{ fontFamily:'var(--font-num)' }}>{c.premium}</span>
          </div>
          <div className="row between" style={{ marginTop:12 }}>
            <span className={'pill '+b.cls}><Icon name={b.icon} size={13} />{b.txt}</span>
            <div className="row gap8">
              <button className="rbtn gold" title={c.phone && c.phone !== '—' ? 'Call ' + c.phone : 'No phone number'}
                onClick={e=>{ e.stopPropagation();
                  if (c.phone && c.phone !== '—') window.location.href = 'tel:' + String(c.phone).replace(/[^\d+]/g, '');
                }}><Icon name="phone" size={17} /></button>
              <button className="rbtn" onClick={e=>e.stopPropagation()} title="Email"><Icon name="mail" size={17} /></button>
              <button className="rbtn" onClick={e=>e.stopPropagation()} title="Note"><Icon name="note" size={17} /></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomersScreen({ data, onOpen }) {
  const [filter, setFilter] = React.useState('all');
  const list = data.CUSTOMERS.filter(c => filter==='all' ? true : c.status===filter);
  const dueCount = data.CUSTOMERS.filter(c=>c.status==='due').length;
  return (
    <div className="screen">
      <CHeader eyebrow="Human Insurance" title="Customers"
        sub={`${data.CUSTOMERS.length} active · ${dueCount} need attention`}
        right={<button className="rbtn" onClick={()=>window.__openSearch&&window.__openSearch()}><Icon name="search" size={19} /></button>} />
      <div className="chips" style={{ marginTop:6, marginBottom:6 }}>
        {CUST_FILTERS.map(f => (
          <button key={f.id} className={'chip'+(filter===f.id?' on':'')} onClick={()=>setFilter(f.id)}>{f.label}</button>
        ))}
      </div>
      <div className="list-grid" style={{ marginTop:14 }}>
        {list.map((c, i) => <CustomerCard key={c.id} c={c} i={i} onOpen={()=>onOpen(c)} />)}
        {list.length===0 && <div className="muted list-empty" style={{ textAlign:'center', padding:'40px 0', fontSize:13 }}>No customers in this view</div>}
      </div>
    </div>
  );
}

window.CustomersScreen = CustomersScreen;
window.CUST_BADGE = CUST_BADGE;
