/* ui.jsx — shared chrome + primitives for InsureFlow */
const { useState, useEffect, useRef } = React;

/* ---------- Device status bar (top) ---------- */
function StatusBar() {
  const [time, setTime] = useState('8:42');
  return (
    <div className="statusbar">
      <span style={{ fontFamily: 'var(--font-num)' }}>{time}</span>
      <div className="icons">
        <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
          <rect x="0"  y="8" width="3" height="5"  rx="1" fill="currentColor"/>
          <rect x="4.5"y="5" width="3" height="8"  rx="1" fill="currentColor"/>
          <rect x="9"  y="2.5"width="3" height="10.5" rx="1" fill="currentColor"/>
          <rect x="13.5"y="0" width="3" height="13" rx="1" fill="currentColor" opacity="0.4"/>
        </svg>
        <svg width="17" height="13" viewBox="0 0 17 13" fill="none">
          <path d="M8.5 11.2 1.2 4.3a10.3 10.3 0 0 1 14.6 0L8.5 11.2Z" fill="currentColor"/>
        </svg>
        <svg width="25" height="13" viewBox="0 0 25 13" fill="none">
          <rect x="0.5" y="1" width="21" height="11" rx="3" stroke="currentColor" strokeOpacity="0.5"/>
          <rect x="2"  y="2.5" width="16" height="8" rx="1.5" fill="currentColor"/>
          <rect x="23" y="4" width="1.5" height="5" rx="0.75" fill="currentColor" opacity="0.5"/>
        </svg>
      </div>
    </div>
  );
}

/* ---------- Screen header ---------- */
function Header({ eyebrow, title, sub, right }) {
  return (
    <div className="appheader row between" style={{ alignItems: 'flex-end' }}>
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1 className="h-title">{title}</h1>
        {sub && <div className="h-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

/* ---------- Sparkline (minimal) ---------- */
function Sparkline({ data, w = 88, h = 30, color = 'var(--gold)', fill = true, stroke = 2 }) {
  const min = Math.min(...data), max = Math.max(...data);
  const rng = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - 3 - ((v - min) / rng) * (h - 6);
    return [x, y];
  });
  const line = pts.map((p, i) => `${i ? 'L' : 'M'}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const area = `${line} L${w} ${h} L0 ${h} Z`;
  const gid = 'sg' + Math.round(min * 7 + max * 13 + data.length);
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`} />}
      <path d={line} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={pts[pts.length-1][0]} cy={pts[pts.length-1][1]} r="2.6" fill={color}/>
    </svg>
  );
}

/* ---------- Bottom navigation ---------- */
const NAV = [
  { id:'today',     lbl:'Home',      icon:'home' },
  { id:'customers', lbl:'Customers', icon:'customers' },
  { id:'leads',     lbl:'Leads',     icon:'leads' },
  { id:'agents',    lbl:'Agents',    icon:'agents' },
];
function BottomNav({ active, onNav }) {
  return (
    <div className="tabbar-wrap">
      <div className="tabbar" style={{ gridTemplateColumns: `repeat(${NAV.length}, 1fr)` }}>
        {NAV.map(n => (
          <div key={n.id} className={'tab' + (active === n.id ? ' active' : '')} onClick={() => onNav(n.id)}>
            <span className="glow"></span>
            <Icon name={n.icon} size={22} stroke={active === n.id ? 1.9 : 1.6} />
            <span className="lbl">{n.lbl}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Modal dialog (scrim centers the sheet) ---------- */
function Sheet({ open, onClose, children }) {
  if (!open) return null;
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

/* ---------- Quick action button (icon + label optional) ---------- */
function QuickActions({ items }) {
  return (
    <div className="row gap8">
      {items.map((it, i) => (
        <button key={i} className={'rbtn' + (it.gold ? ' gold' : '')} title={it.label}
                onClick={(e) => { e.stopPropagation(); it.onClick && it.onClick(); }}>
          <Icon name={it.icon} size={19} />
        </button>
      ))}
    </div>
  );
}

/* ---------- Pipeline column header ---------- */
function StageRail({ stages, active, onPick, counts }) {
  return (
    <div className="chips" style={{ marginTop: 14 }}>
      {stages.map(s => (
        <button key={s.id} className={'chip' + (active === s.id ? ' on' : '')} onClick={() => onPick(s.id)}>
          {s.label}<span className="ct">{counts[s.id] ?? 0}</span>
        </button>
      ))}
    </div>
  );
}

/* ---------- Skeleton loading ---------- */
function Skel({ w = '100%', h = 12, mt = 0, r = 6, style }) {
  return <div className="skel" style={{ width: w, height: h, marginTop: mt, borderRadius: r, ...style }} />;
}

function SkelHeader() {
  return (
    <div className="appheader">
      <Skel w={88} h={11} />
      <Skel w={190} h={26} mt={9} r={8} />
      <Skel w={150} h={13} mt={9} />
    </div>
  );
}

function SkelChips() {
  return (
    <div className="chips" style={{ marginTop: 6, marginBottom: 6 }}>
      {[64, 92, 80, 74, 60].map((w, i) => <Skel key={i} w={w} h={34} r={999} style={{ flex: '0 0 auto' }} />)}
    </div>
  );
}

function SkelRowCard() {
  return (
    <div className="card" style={{ padding: 15 }}>
      <div className="row gap12" style={{ alignItems: 'flex-start' }}>
        <Skel w={46} h={46} r={15} style={{ flex: '0 0 auto' }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Skel w="62%" h={14} />
          <Skel w="42%" h={11} mt={9} />
          <div className="row between" style={{ marginTop: 14 }}>
            <Skel w={92} h={26} r={999} />
            <div className="row gap8">
              <Skel w={42} h={42} r={13} />
              <Skel w={42} h={42} r={13} />
              <Skel w={42} h={42} r={13} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="screen">
      <SkelHeader />
      <SkelChips />
      <div className="list-grid" style={{ marginTop: 14 }}>
        {Array.from({ length: 6 }).map((_, i) => <SkelRowCard key={i} />)}
      </div>
    </div>
  );
}

function TodaySkeleton() {
  return (
    <div className="screen">
      <SkelHeader />
      <div className="card" style={{ padding: 18, marginTop: 6 }}>
        <Skel w="38%" h={11} />
        <Skel w="72%" h={24} mt={11} r={8} />
        <Skel w="50%" h={13} mt={10} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginTop: 16 }}>
          {[0, 1, 2].map(i => <Skel key={i} h={66} r={14} />)}
        </div>
        <Skel h={44} mt={12} r={13} />
      </div>
      <div className="section-label"><Skel w={130} h={12} /></div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ marginBottom: 11 }}><SkelRowCard /></div>
      ))}
    </div>
  );
}

function LoadingScreen({ tab }) {
  return tab === 'today' ? <TodaySkeleton /> : <ListSkeleton />;
}

/* ---------- Data unavailable / error state ---------- */
function DataState({ error, onRetry }) {
  const setup = error === 'not-configured' || error === 'no-url';
  return (
    <div className="screen datastate">
      <div className="datastate-ic"><Icon name={setup ? 'doc' : 'alert'} size={26} color="var(--gold-soft)" /></div>
      <div className="datastate-title">{setup ? 'Connect your data source' : 'Couldn’t load data'}</div>
      <div className="datastate-sub">
        {setup
          ? 'Set SHEET_WEBAPP_URL in data.jsx to your deployed Apps Script web app URL.'
          : 'We couldn’t reach Google Sheets right now. Check the deployment and try again.'}
      </div>
      {!setup && <button className="datastate-btn" onClick={onRetry}><Icon name="renew" size={16} color="#1a1407" />Retry</button>}
    </div>
  );
}

window.UI = { StatusBar, Header, Sparkline, BottomNav, Sheet, QuickActions, StageRail, NAV, LoadingScreen, DataState };
