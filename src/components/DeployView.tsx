import React, { useState } from 'react';
import { productionEnvExample, productionDockerfile, productionDockerCompose } from '../data/deployment';
import { Globe, FileCode, Check, Copy, Code, Server, HelpCircle, Network } from 'lucide-react';

export default function DeployView() {
  const [activeTab, setActiveTab] = useState<'env' | 'dockerfile' | 'compose' | 'vpc'>('env');
  const [copied, setCopied] = useState<boolean>(false);
  const [focusedEnvKey, setFocusedEnvKey] = useState<string>('DATABASE_URL');

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getEnvExplToKey = (key: string): string => {
    switch (key) {
      case 'DATABASE_URL':
        return 'The connection string for PostgreSQL. In production must contain secure flags like "sslmode=require" to prevent man-in-the-middle sniffing of queries.';
      case 'REDIS_URL':
        return 'The Redis connection URL. Crucial to prefix with "rediss://" (SSL) to guarantee encrypted transit of rate limit, OTPs, and blacklist parameters.';
      case 'JWT_ACCESS_SECRET':
        return 'HS256 encryption string signing short-lived 15m access tokens. In production, must be at least 32/64 high-entropy characters to block brute-forcing offline calculations.';
      case 'JWT_REFRESH_SECRET':
        return 'Signature secret validating opaque refresh token credentials. Re-evaluate periodically or migrate to a Vault/Secrets-Manager rotating key repository.';
      case 'SMTP_FROM':
        return 'Verify this domain on your mail providers DNS (e.g. AWS SES, Resend). SPF, DKIM, and DMARC parameters prevent emails from hitting Spam traps.';
      case 'CORS_ALLOWED_ORIGINS':
        return 'White-list of allowed domains. Never configure with a wildcard "*" in production as it would permit malicious cross-origin exfiltration scripts.';
      default:
        return 'A required system variable loaded securely from container environments or secret stores.';
    }
  };

  const getActiveCode = () => {
    switch (activeTab) {
      case 'dockerfile': return productionDockerfile;
      case 'compose': return productionDockerCompose;
      default: return productionEnvExample;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#020617] overflow-hidden">
      
      {/* Configuration Header tab switchers */}
      <div className="bg-[#0f172a] border-b border-[#1e293b] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold tracking-tight text-white flex items-center space-x-2">
            <Globe className="h-4.5 w-4.5 text-[#10b981] font-bold" />
            <span>Deployment & Configuration Architect</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">Configure environment settings and deploy Docker clusters behind private VPC subnets.</p>
        </div>

        {/* tab arrays */}
        <div className="flex flex-wrap gap-1 bg-slate-955 p-1 rounded-lg border border-[#1e293b] self-start">
          <button
            onClick={() => setActiveTab('env')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'env' 
                ? 'bg-[#1e293b] text-[#10b981]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            .env.example
          </button>
          <button
            onClick={() => setActiveTab('dockerfile')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'dockerfile' 
                ? 'bg-[#1e293b] text-[#10b981]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dockerfile
          </button>
          <button
            onClick={() => setActiveTab('compose')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'compose' 
                ? 'bg-[#1e293b] text-[#10b981]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            docker-compose
          </button>
          <button
            onClick={() => setActiveTab('vpc')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeTab === 'vpc' 
                ? 'bg-[#1e293b] text-[#10b981]' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Multi-AZ Topology
          </button>
        </div>
      </div>

      {activeTab === 'vpc' ? (
        /* VPC Topology Layout View */
        <div className="flex-grow p-6 overflow-y-auto space-y-6">
          <div className="bg-[#0f172a] rounded-xl border border-[#1e293b] p-6 shadow-2xl max-w-4xl space-y-5">
            <div className="flex items-center space-x-2 text-emerald-400 border-b border-[#1e293b] pb-3">
              <Network className="h-4.5 w-4.5" />
              <h3 className="font-bold text-white text-[11px] uppercase tracking-wider font-mono">Secure Production VPC Topology Schema</h3>
            </div>
            
            {/* Visual VPC Tier Box Graphic rendering */}
            <div className="space-y-4 font-sans">
              
              {/* Box 1: Public internet gateway tier */}
              <div className="p-4 bg-slate-950 border border-[#1e293b] rounded-xl relative">
                <span className="absolute top-2.5 right-3 text-[9px] font-mono font-bold text-slate-500">TIER-1 (PUBLIC)</span>
                <h4 className="font-bold text-white text-xs">Public Boundary / DNS / Gateways</h4>
                <p className="text-[11px] text-slate-400 mt-1">Cloudflare WAF DNS queries translate HTTPS on Port 443 ↴</p>
                <div className="mt-3 flex gap-2">
                  <span className="px-2.5 py-1 bg-[#0f172a] border border-[#1e293b] rounded text-[9px] text-[#10b981] font-mono font-bold">
                    Application Load Balancer (HTTPS termination)
                  </span>
                  <span className="px-2.5 py-1 bg-[#0f172a] border border-[#1e293b] rounded text-[9px] text-[#10b981] font-mono font-bold">
                    Nginx Reverse Proxy
                  </span>
                </div>
              </div>

              {/* Arrow downward */}
              <div className="flex justify-center"><div className="h-6 w-0.5 border-l border-dashed border-[#1e293b]"></div></div>

              {/* Box 2: Private Network Services Tier */}
              <div className="p-4 bg-slate-950 border border-[#1e293b] rounded-xl relative">
                <span className="absolute top-2.5 right-3 text-[9px] font-mono font-bold text-emerald-400">TIER-2 (PRIVATE ACCESS ONLY)</span>
                <h4 className="font-bold text-white text-xs">Application Subnets (Multi-AZ Clusters)</h4>
                <p className="text-[11px] text-slate-400 mt-1">Containers scaled horizontally inside private isolation zones. Internal load distributing handles load ↴</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-[#0f172a] border border-[#1e293b] rounded text-[10px] font-mono font-semibold text-slate-300">
                    🐳 Docker Node-1 (AZ-1)
                  </span>
                  <span className="px-2.5 py-1 bg-[#0f172a] border border-[#1e293b] rounded text-[10px] font-mono font-semibold text-slate-300">
                    🐳 Docker Node-2 (AZ-2)
                  </span>
                  <span className="px-2.5 py-1 bg-[#0f172a] border border-[#1e293b] rounded text-[10px] font-mono font-semibold text-slate-300">
                    🐳 Docker Node-3 (AZ-3)
                  </span>
                </div>
              </div>

              {/* Arrow downward */}
              <div className="flex justify-center"><div className="h-6 w-0.5 border-l border-dashed border-[#1e293b]"></div></div>

              {/* Box 3: Data tier isolation */}
              <div className="p-4 bg-slate-950 border border-[#1e293b] rounded-xl relative">
                <span className="absolute top-2.5 right-3 text-[9px] font-mono font-bold text-rose-400">TIER-3 (STRICT ISOLATION)</span>
                <h4 className="font-bold text-white text-xs">Locked Database Subnets</h4>
                <p className="text-[11px] text-slate-400 mt-1">Strictly isolated, rejecting direct ingress except through Node-Service AZ private IPs.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 bg-[#0f172a] border border-rose-900/30 rounded text-[9px] font-mono font-semibold text-rose-300">
                    🐘 Postgres RDS Cluster (Primary / Read-Replicas)
                  </span>
                  <span className="px-2.5 py-1 bg-[#0f172a] border border-rose-900/30 rounded text-[9px] font-mono font-semibold text-rose-300">
                    ⚡ Redis Session / Limiter Cluster (Multi-AZ Cache)
                  </span>
                </div>
              </div>

            </div>

            {/* Explanations summary */}
            <div className="pt-4 border-t border-[#1e293b] space-y-3 font-sans text-xs">
              <h4 className="font-bold text-white">Secure VPC Architecture Highlights</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-300">
                <li className="space-y-1">
                  <span className="font-bold text-[#10b981]">1. Zero Public Database Exposure</span>
                  <p className="text-[11px] text-slate-450 leading-normal font-sans">Database and Redis instances have no public IPv4 addresses, nullifying active external network attack surfaces.</p>
                </li>
                <li className="space-y-1">
                  <span className="font-bold text-[#10b981]">2. SSL/TLS Termination</span>
                  <p className="text-[11px] text-slate-450 leading-normal font-sans text-slate-400">ALBs terminate SSL configurations at Tier-1 boundary, proxying plain, fast HTTP internally to Docker clusters over private networks.</p>
                </li>
                <li className="space-y-1">
                  <span className="font-bold text-[#10b981]">3. Multi-AZ Failovers</span>
                  <p className="text-[11px] text-slate-450 leading-normal font-sans text-slate-300">Horizontally repeating nodes across Multi Availability-Zones shields against regional physical outages gracefully.</p>
                </li>
                <li className="space-y-1">
                  <span className="font-bold text-[#10b981]">4. WAF Filtering Rules</span>
                  <p className="text-[11px] text-slate-450 leading-normal font-sans">Cloudflare processes connections first, filtering injection patterns, standard XSS, and volumetric attacks before reaching internal proxy servers.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      ) : activeTab === 'env' ? (
        /* Environment specifier layout */
        <div className="flex-grow flex flex-col lg:flex-row overflow-hidden bg-[#020617]">
          
          {/* List of keys on the left of panel */}
          <div className="w-full lg:w-96 border-b lg:border-b-0 lg:border-r border-[#1e293b] overflow-y-auto p-4 space-y-3 shrink-0 bg-[#0f172a]/30">
            <h4 className="text-[10px] font-bold text-[#64748b] uppercase tracking-widest font-mono px-2">Secure Parameters List</h4>
            <div className="space-y-1">
              {['DATABASE_URL', 'REDIS_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'SMTP_FROM', 'CORS_ALLOWED_ORIGINS'].map((key) => {
                const isSelected = focusedEnvKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setFocusedEnvKey(key)}
                    className={`w-full text-left p-3 rounded-xl border text-xs font-mono transition-all flex items-start space-x-2.5 cursor-pointer ${
                      isSelected
                        ? 'border-[#10b981] bg-emerald-950/10 ring-1 ring-[#10b981]/25 text-[#10b981]'
                        : 'border-[#1e293b] bg-slate-950/50 hover:bg-slate-900'
                    }`}
                  >
                    <Server className={`h-4.5 w-4.5 mt-0.5 shrink-0 ${isSelected ? 'text-[#10b981]' : 'text-slate-500'}`} />
                    <div className="min-w-0">
                      <div className="font-bold text-white truncate">{key}</div>
                      <p className="text-[10px] text-slate-450 font-sans mt-1 line-clamp-1 leading-normal">{getEnvExplToKey(key)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interactive explanations frame */}
          <div className="flex-grow flex flex-col justify-between p-6">
            <div className="space-y-6">
              <div className="flex items-center space-x-2.5 border-b border-[#1e293b]/60 pb-3">
                <HelpCircle className="h-4.5 w-4.5 text-[#10b981]" />
                <h3 className="font-extrabold text-white text-[10px] font-mono uppercase tracking-widest">Variable Context Inspector</h3>
              </div>

              <div>
                <span className="text-[10px] bg-slate-955 border border-[#1e293b] text-emerald-400 px-2 py-0.5 rounded font-mono font-semibold">
                  {focusedEnvKey}
                </span>
                <h4 className="text-sm font-extrabold text-white mt-4 font-sans uppercase tracking-wide">Security configurations explanation</h4>
                <p className="text-xs text-slate-450 mt-2 leading-relaxed font-sans">
                  {getEnvExplToKey(focusedEnvKey)}
                </p>
              </div>

              {/* Show recommendation code */}
              <div className="bg-amber-950/10 rounded-xl border border-amber-900/40 p-4 space-y-1.5 font-sans">
                <div className="text-amber-500 font-bold text-xs uppercase font-mono tracking-wider">Production Compliance Guideline:</div>
                <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                  Never commit raw secrets, custom salts, or production certificates directly into Git repository structures. Use Vault configs, AWS Secrets manager or container cloud environments directly, parsing parameters at runtime execution.
                </p>
              </div>
            </div>

            <button
              onClick={() => handleCopy(productionEnvExample)}
              className="px-4 py-2 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-bold border border-[#1e293b] rounded-lg text-xs self-start cursor-pointer transition-all shrink-0"
            >
              Copy Full .env.example
            </button>
          </div>

        </div>
      ) : (
        /* Code view for Dockerfile / docker-compose */
        <div className="flex-grow p-6 overflow-y-auto bg-[#020617] text-slate-350 font-mono text-xs flex flex-col relative select-text">
          <div className="flex items-center justify-between border-b border-[#1e293b] pb-3 mb-4 bg-[#020617] sticky top-0 z-10">
            <span className="text-xs text-[#10b981] font-mono font-bold flex items-center space-x-1.5">
              <FileCode className="h-4 w-4" />
              <span>{activeTab === 'dockerfile' ? 'Dockerfile' : 'docker-compose.yml'}</span>
            </span>
            <button
              onClick={() => handleCopy(getActiveCode())}
              className="px-3 py-1.5 bg-[#1e293b] hover:bg-slate-800 text-[#10b981] font-bold border border-[#1e293b] rounded-md transition-all flex items-center space-x-1.5 text-[11px] cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>Copy Configuration</span>
                </>
              )}
            </button>
          </div>
          <pre className="flex-grow p-4 bg-slate-950 rounded-xl border border-[#1e293b] text-xs overflow-auto leading-relaxed text-slate-350">
            {getActiveCode()}
          </pre>
        </div>
      )}

    </div>
  );
}
