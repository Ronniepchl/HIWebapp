/* screen-summary.jsx — monthly CEO review */
const { Sparkline: SSpark } = window.UI;

function MetricCard({ m, tone, i }) {
  const down = m.delta.startsWith('−') || m.delta.startsWith('-');
  return (
    <div className="card fu" style={{ padding:15, animationDelay:(0.05*i)+'s' }}>
      <div style={{ fontSize:11.5, color:'var(--ink-mid)', fontWeight:600, minHeight:30, lineHeight:1.3 }}>{m.label}</div>
      <div className="row between" style={{ alignItems:'flex-end', marginTop:6 }}>
        <div className="metric" style={{ fontSize:34, lineHeight:1 }}>{m.value}</div>
        <SSpark data={m.spark} w={70} h={28} color={`var(--${tone})`} />
      </div>
      <div style={{ fontSize:11, marginTop:8, color: down?'var(--ink-mid)':`var(--${tone})`, fontWeight:600,
        display:'flex', alignItems:'center', gap:5 }}>
        <Icon name={down?'arrowUR':'trend'} size={12} style={down?{transform:'rotate(90deg)'}:{}} />{m.delta} this month
      </div>
    </div>
  );
}

function SummaryGroup({ title, icon, items, tone }) {
  return (
    <React.Fragment>
      <div className="section-label">
        <span className="t row gap8"><Icon name={icon} size={15} color="var(--gold-soft)" />{title}</span>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:11 }}>
        {items.map((m,i)=><MetricCard key={m.label} m={m} tone={tone} i={i} />)}
      </div>
    </React.Fragment>
  );
}

function HeroTrend({ trend }) {
  return (
    <div className="card fu" style={{ padding:18, position:'relative', overflow:'hidden',
      background:'linear-gradient(155deg, rgba(216,184,115,0.09), rgba(255,255,255,0.025))', borderColor:'var(--gold-line)' }}>
      <div className="row between">
        <div>
          <div style={{ fontSize:12, color:'var(--gold-soft)', fontWeight:600 }}>Premium written · June</div>
          <div className="metric" style={{ fontSize:38, marginTop:4 }}>
            <span style={{ fontFamily:'var(--font-ui)', fontWeight:600, fontSize:28, marginRight:2 }}>฿</span>4.6M
          </div>
          <div style={{ fontSize:12, color:'var(--ok)', fontWeight:600, marginTop:4, display:'flex', alignItems:'center', gap:5 }}>
            <Icon name="trend" size={13} />+18% vs. May
          </div>
        </div>
        <div style={{ alignSelf:'flex-end' }}>
          <SSpark data={trend} w={120} h={58} color="var(--gold)" stroke={2.4} />
        </div>
      </div>
    </div>
  );
}

function SummaryScreen({ data, onBack }) {
  return (
    <div className="screen" style={{ paddingTop:8 }}>
      <window.UI.Header eyebrow="June 2026" title="Monthly report"
        sub="How the business is performing"
        right={onBack
          ? <button className="rbtn" onClick={onBack} title="Back"><Icon name="x" size={18} /></button>
          : <button className="rbtn"><Icon name="calendar" size={18} /></button>} />
      <HeroTrend trend={data.PREMIUM_TREND} />
      <SummaryGroup title="Customers"   icon="customers" items={data.SUMMARY.customers} tone="info" />
      <SummaryGroup title="New business" icon="leads"    items={data.SUMMARY.business}  tone="warn" />
      <SummaryGroup title="Recruitment" icon="agents"    items={data.SUMMARY.recruit}   tone="ok" />
      <div style={{ textAlign:'center', marginTop:26, opacity:0.5 }}>
        <div className="thai" style={{ fontSize:11.5, color:'var(--ink-low)' }}>
          “ดูแลลูกค้าด้วยความเข้าใจ ไม่เร่งขาย” · Human Insurance
        </div>
      </div>
    </div>
  );
}

window.SummaryScreen = SummaryScreen;
