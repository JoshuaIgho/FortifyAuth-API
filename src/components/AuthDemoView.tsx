import React, { useState } from 'react';
import {
  Shield,
  KeyRound,
  Mail,
  User,
  Info,
  Smartphone,
  Check,
  AlertTriangle,
  Fingerprint,
  Lock,
} from 'lucide-react';

export default function AuthDemoView() {
  const [formType, setFormType] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  // States of authentication progress
  const [authStep, setAuthStep] = useState<'credentials' | 'mfa' | 'success'>('credentials');
  const [mfaCode, setMfaCode] = useState('');
  const [bannerMsg, setBannerMsg] = useState<{
    type: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      setBannerMsg({
        type: 'error',
        text: 'ALERT: Account remains locked. Please check email for emergency unlock token.',
      });
      return;
    }

    if (!email || !password) {
      setBannerMsg({
        type: 'error',
        text: 'Validation Error: Email and password fields cannot be empty.',
      });
      return;
    }

    if (formType === 'register') {
      if (!fullName) {
        setBannerMsg({ type: 'error', text: 'Validation Error: Full Name is required.' });
        return;
      }
      setBannerMsg({
        type: 'success',
        text: 'Registration Successful! A secure validation token was sent to your email.',
      });
      setFormType('login');
      return;
    }

    // Login logic
    if (password !== 'AdminFortifySecur3') {
      const nextErrors = errorCount + 1;
      setErrorCount(nextErrors);
      if (nextErrors >= 5) {
        setIsLocked(true);
        setBannerMsg({
          type: 'error',
          text: 'CRITICAL SECURITY BREACH: 5 failed attempts. Account has been force-locked.',
        });
      } else {
        setBannerMsg({
          type: 'error',
          text: `Authentication failed. Invalid password. (${5 - nextErrors} attempts remaining before account lockout)`,
        });
      }
    } else {
      setErrorCount(0);
      setBannerMsg({
        type: 'info',
        text: 'Credentials valid. Two-Factor Authentication required (TOTP Step-up).',
      });
      setAuthStep('mfa');
    }
  };

  const handleMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode === '120612') {
      setAuthStep('success');
      setBannerMsg({ type: 'success', text: 'Enterprise Identity Authenticated. Welcome back!' });
    } else {
      setBannerMsg({
        type: 'error',
        text: 'Security Warning: Invalid TOTP verification token code.',
      });
    }
  };

  const resetAll = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setErrorCount(0);
    setIsLocked(false);
    setAuthStep('credentials');
    setMfaCode('');
    setBannerMsg(null);
  };

  return (
    <div className="p-6 bg-[#020617] h-full overflow-y-auto space-y-6 flex flex-col items-center justify-center">
      {/* Container box */}
      <div className="w-full max-w-md bg-[#0f172a] rounded-xl border border-[#1e293b] overflow-hidden shadow-2xl">
        {/* Top Header Badge */}
        <div className="p-5 border-b border-[#1e293b] bg-slate-950/40 text-center relative">
          <div className="absolute top-4 left-4 flex space-x-1">
            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full"></span>
            <span className="w-2.5 h-2.5 bg-amber-500 rounded-full"></span>
            <span className="w-2.5 h-2.5 bg-[#10b981] rounded-full"></span>
          </div>
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-950/50 border border-[#10b981]/15 mb-2.5">
            {authStep === 'success' ? (
              <Fingerprint className="h-5 w-5 text-[#10b981] animate-pulse" />
            ) : (
              <Lock className="h-5 w-5 text-[#10b981]" />
            )}
          </div>
          <h3 className="font-bold text-white text-sm tracking-wide">
            {authStep === 'success' ? 'ACCESS CLEARANCE GRANTED' : 'FORTIFYAUTH IDENTITY GATEWAY'}
          </h3>
          <p className="text-[10px] text-slate-500 font-mono mt-0.5">
            SECURE END-USER COMPLIANCE PORTAL
          </p>
        </div>

        {/* Dynamic Warning Alert Banner */}
        {bannerMsg && (
          <div
            className={`px-5 py-3 text-[11px] font-sans border-b flex items-start gap-2 ${
              bannerMsg.type === 'success'
                ? 'bg-emerald-950/20 text-emerald-300 border-emerald-900/30'
                : bannerMsg.type === 'error'
                  ? 'bg-rose-950/20 text-rose-300 border-rose-900/30'
                  : 'bg-indigo-950/20 text-indigo-300 border-indigo-900/30'
            }`}
          >
            {bannerMsg.type === 'error' ? (
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            ) : (
              <Check className="h-4 w-4 shrink-0 mt-0.5" />
            )}
            <p className="leading-snug">{bannerMsg.text}</p>
          </div>
        )}

        {/* Primary forms viewport workspace */}
        <div className="p-6">
          {authStep === 'credentials' ? (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 font-sans">
              {/* Optional Name for registration */}
              {formType === 'register' && (
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Principal Architect"
                      className="w-full bg-slate-950 border border-[#1e293b] rounded-lg p-3 pl-9 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#10b981]"
                    />
                  </div>
                </div>
              )}

              {/* Email entry key */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="architect@fortifyauth.io"
                    className="w-full bg-slate-950 border border-[#1e293b] rounded-lg p-3 pl-9 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#10b981]"
                  />
                </div>
              </div>

              {/* Password credentials key */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Access Password
                  </label>
                  {formType === 'login' && (
                    <button
                      type="button"
                      onClick={() =>
                        setBannerMsg({
                          type: 'info',
                          text: 'Secure reset token transmitted to developer CLI.',
                        })
                      }
                      className="text-[10px] text-emerald-450 hover:underline font-semibold"
                    >
                      Forgot?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-3 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter cryptographic secret passphrase"
                    disabled={isLocked}
                    className="w-full bg-slate-950 border border-[#1e293b] rounded-lg p-3 pl-9 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#10b981] disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Tips block */}
              {formType === 'login' && (
                <div className="p-3 bg-slate-950 border border-[#1e293b] rounded-lg text-[10px] text-slate-400 flex items-start gap-2">
                  <Info className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Interactive Sandbox Passphrase:</span>
                    <br />
                    Use password{' '}
                    <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">
                      AdminFortifySecur3
                    </code>{' '}
                    to test the Multi-Factor and success flows. Try incorrect passwords to witness
                    brute-force lockout guards.
                  </div>
                </div>
              )}

              {/* Action push controls */}
              <button
                type="submit"
                disabled={isLocked}
                className="w-full py-3 bg-[#10b981] hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs leading-none transition-all cursor-pointer disabled:opacity-50"
              >
                {formType === 'login' ? 'APPROVE & RETRIEVE CREDENTIALS' : 'RESERVE IDENTITY SLOTS'}
              </button>

              {/* Toggle Form type link */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => {
                    setFormType(formType === 'login' ? 'register' : 'login');
                    setBannerMsg(null);
                  }}
                  className="text-[10px] text-slate-400 hover:text-white underline font-mono"
                >
                  {formType === 'login'
                    ? 'Create new tenant workspace user'
                    : 'Return to secure gateway login'}
                </button>
              </div>
            </form>
          ) : authStep === 'mfa' ? (
            <form onSubmit={handleMfaSubmit} className="space-y-4 font-sans">
              <div className="p-4 bg-slate-950 border border-[#1e293b] rounded-xl text-center space-y-2">
                <Smartphone className="h-7 w-7 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Step-Up MFA Required
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Enter the 6-digit dynamic key generated on your physical authenticator device
                  core.
                </p>
              </div>

              {/* MFA Dynamic Verification field */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest text-center block">
                  6-DIGIT VERIFICATION CODE
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value)}
                  placeholder="e.g. 120612"
                  className="w-full bg-slate-950 border border-[#1e293b] rounded-lg p-3 text-center text-lg font-mono tracking-widest text-[#10b981] placeholder-slate-700 focus:outline-none focus:border-[#10b981]"
                />
              </div>

              {/* Simulation instruction */}
              <div className="p-3 bg-slate-950 border border-[#1e293b] rounded-lg text-[10px] text-slate-400 flex items-start gap-2">
                <Info className="h-4 w-4 text-[#10b981] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white">TOTP Simulation:</span> Enter simulation
                  code{' '}
                  <code className="text-emerald-400 bg-slate-900 px-1 py-0.5 rounded">120612</code>{' '}
                  to unlock the final enterprise success view.
                </div>
              </div>

              {/* Controls */}
              <button
                type="submit"
                className="w-full py-3 bg-[#10b981] hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs leading-none transition-all cursor-pointer"
              >
                SUBMIT TOTP MUTATION
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resetAll}
                  className="text-[10px] text-slate-500 hover:text-slate-300 underline font-mono"
                >
                  Abstain and return to credential gateway
                </button>
              </div>
            </form>
          ) : (
            /* Authentication Complete */
            <div className="space-y-5 text-center font-sans py-4">
              <div className="h-14 w-14 rounded-full bg-emerald-950/40 border border-[#10b981]/50 text-[#10b981] flex items-center justify-center mx-auto text-xl">
                ✓
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-extrabold text-white">
                  Session Securely Established!
                </h4>
                <p className="text-xs text-slate-400">
                  Tokens were compiled inside compute containers, routing cookie footprints safely.
                </p>
              </div>

              <div className="p-4 bg-slate-950 border border-[#1e293b] rounded-xl text-left font-mono text-[10px] space-y-1.5 leading-normal">
                <div className="text-emerald-300 font-bold border-b border-[#1e293b] pb-1.5 uppercase">
                  Retrieved Token Specs:
                </div>
                <div>
                  <span className="text-slate-500">Subject:</span> usr_4480e_fba02
                </div>
                <div>
                  <span className="text-slate-500">Claims Scope:</span>{' '}
                  <span className="text-rose-400 bg-rose-950/40 px-1 rounded font-normal font-sans uppercase">
                    USER
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Security JTI:</span> user_sess_90251ff821ad
                </div>
                <div>
                  <span className="text-slate-500">Access Expiry:</span> 15 Minutes (Rotating)
                </div>
              </div>

              <button
                onClick={resetAll}
                className="w-full py-2.5 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-bold border border-[#1e293b] rounded-lg text-xs leading-none cursor-pointer transition-all"
              >
                TERMINATE SESSION & LOGOUT
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
