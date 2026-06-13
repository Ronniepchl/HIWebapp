/* screen-login.jsx — premium executive sign-in gate
   Exports window.LoginScreen */
const { useState: lUseState } = React;

function LoginScreen({ onSuccess }) {
  const [user, setUser] = lUseState('');
  const [pass, setPass] = lUseState('');
  const [show, setShow] = lUseState(false);
  const [err, setErr] = lUseState('');
  const [busy, setBusy] = lUseState(false);

  const submit = () => {
    setErr('');
    if (!user.trim() || !pass) { setErr('Please enter your username and password.'); return; }
    setBusy(true);
    // Credentials are verified server-side by Code-login.gs (no hard-coded
    // passwords in the client). onSuccess receives the display name + token.
    window.login(
      user.trim(),
      pass,
      (res) => { onSuccess(res.user || user.trim(), res.token); },
      (message) => { setErr(message || 'Incorrect username or password.'); setBusy(false); }
    );
  };

  const onKey = (e) => { if (e.key === 'Enter') submit(); };

  const field = {
    width:'100%', height:54, borderRadius:15, padding:'0 46px 0 46px',
    background:'var(--glass)', border:'1px solid var(--glass-brd-2)', color:'var(--ink-hi)',
    fontFamily:'var(--font-ui)', fontSize:15, outline:'none',
  };

  return (
    <div className="login-screen">
      {/* ambient gold glow */}
      <div className="login-glow"></div>

      <div className="login-inner">
        {/* brand mark */}
        <div className="fu" style={{ display:'flex', flexDirection:'column', alignItems:'center' }}>
          <div className="login-logo">
            <Icon name="shield" size={30} color="var(--gold)" />
          </div>
          <div className="eyebrow" style={{ marginTop:18, color:'var(--gold-soft)' }}>Human Insurance</div>
          <h1 style={{ fontSize:30, fontWeight:600, color:'var(--ink-hi)', letterSpacing:-0.5, margin:'6px 0 0' }}>InsureFlow</h1>
          <div style={{ fontSize:13.5, color:'var(--ink-mid)', marginTop:6 }}>Your personal executive command center</div>
        </div>

        {/* form */}
        <div className="login-card fu" style={{ animationDelay:'0.06s' }}>
          <label className="login-label">Username</label>
          <div style={{ position:'relative', marginBottom:14 }}>
            <span className="login-ic"><Icon name="user" size={18} color="var(--ink-low)" /></span>
            <input value={user} onChange={e=>{ setUser(e.target.value); setErr(''); }} onKeyDown={onKey}
              placeholder="Enter username" autoCapitalize="none" autoCorrect="off" spellCheck="false"
              style={field} />
          </div>

          <label className="login-label">Password</label>
          <div style={{ position:'relative' }}>
            <span className="login-ic"><Icon name="lock" size={17} color="var(--ink-low)" /></span>
            <input value={pass} onChange={e=>{ setPass(e.target.value); setErr(''); }} onKeyDown={onKey}
              type={show ? 'text' : 'password'} placeholder="Enter password" style={field} />
            <button type="button" className="login-eye" onClick={()=>setShow(s=>!s)} aria-label="Toggle password">
              <Icon name={show ? 'eyeoff' : 'eye'} size={18} color="var(--ink-mid)" />
            </button>
          </div>

          <div className={'login-err' + (err ? ' show' : '')}>
            {err && <React.Fragment><Icon name="alert" size={13} color="var(--due)" />{err}</React.Fragment>}
          </div>

          <button className="login-btn" onClick={submit} disabled={busy}>
            {busy
              ? <span className="login-spin"></span>
              : <React.Fragment>Sign in<Icon name="chevron" size={17} color="#1a1407" stroke={2.4} /></React.Fragment>}
          </button>

          <div className="login-forgot">Forgot password?</div>
        </div>

        {/* brand promise */}
        <div className="thai fu" style={{ animationDelay:'0.12s', textAlign:'center', fontSize:12, color:'var(--ink-low)',
          marginTop:22, lineHeight:1.6, padding:'0 12px' }}>
          “ดูแลลูกค้าด้วยความเข้าใจ ไม่เร่งขาย”
        </div>
      </div>

      {/* secure footer */}
      <div className="login-foot">
        <Icon name="lock" size={12} color="var(--ink-low)" />
        <span>Private &amp; encrypted · For authorized use only</span>
      </div>
    </div>
  );
}

window.LoginScreen = LoginScreen;
