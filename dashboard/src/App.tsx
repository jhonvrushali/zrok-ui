import { useState, useEffect } from 'react';

// --- Premium SVG Icons ---
const Icons = {
  Server: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="8" x="2" y="2" rx="2"/><rect width="20" height="8" x="2" y="14" rx="2"/><line x1="6" x2="6.01" y1="6" y2="6"/><line x1="6" x2="6.01" y1="18" y2="18"/></svg>,
  Globe: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>,
  Activity: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
  Key: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="7.5" cy="15.5" r="5.5"/><path d="m21 2-9.6 9.6"/><path d="m15.5 7.5 3 3L22 7l-3-3"/></svg>,
  Users: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Layout: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><line x1="3" x2="21" y1="9" y2="9"/><line x1="9" x2="9" y1="21" y2="9"/></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>,
  Copy: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>,
  Power: () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" x2="12" y1="2" y2="12"/></svg>,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  
  // Auth state
  const [token, setToken] = useState<string | null>(localStorage.getItem('zrok_token') || '');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  // API Data states
  const [tunnels, setTunnels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminTunnels, setAdminTunnels] = useState<any[]>([]);
  const [domainInput, setDomainInput] = useState('');
  const [domainVerified, setDomainVerified] = useState<null | boolean>(null);
  const [domainLoading, setDomainLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  const fetchTunnels = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/tunnels', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to fetch');
      setTunnels(json.data || []);
      setError('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTunnels();
    }
  }, [token]);

  const handleCreateTunnel = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const localPort = parseInt(formData.get('localPort') as string);
    const shareMode = formData.get('shareMode') as string;
    const customDomain = formData.get('customDomain') as string;
    
    const payload: any = { localPort, protocol: shareMode.toLowerCase() };
    if (customDomain && customDomain.trim()) {
      payload.customDomain = customDomain.trim().toLowerCase();
    }
    
    try {
      const res = await fetch('/api/tunnels', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json();
        alert('Error: ' + err.message);
        return;
      }
      setIsModalOpen(false);
      fetchTunnels();
    } catch (err) {
      alert('Network error');
    }
  };

  const handleCloseTunnel = async (id: string) => {
    if (!confirm('Are you sure you want to close this tunnel?')) return;
    try {
      const res = await fetch(`/api/tunnels/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchTunnels();
      }
    } catch (err) {
      alert('Error closing tunnel');
    }
  };

  const fetchAdminUsers = async () => {
    try {
      const res = await fetch('/api/auth/users', { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setAdminUsers(json.data || []);
    } catch {}
  };

  const fetchAdminTunnels = async () => {
    try {
      const res = await fetch('/api/tunnels', { headers: { 'Authorization': `Bearer ${token}` } });
      const json = await res.json();
      if (json.success) setAdminTunnels(json.data || []);
    } catch {}
  };

  const handleVerifyDomain = async () => {
    if (!domainInput.trim()) return;
    setDomainLoading(true);
    setDomainVerified(null);
    try {
      const res = await fetch('/api/tunnels/verify-domain', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: domainInput.trim() })
      });
      const json = await res.json();
      setDomainVerified(json.data?.verified ?? false);
    } catch { setDomainVerified(false); }
    finally { setDomainLoading(false); }
  };

  const handleToggleShareMode = async (tunnel: any) => {
    const newMode = tunnel.protocol === 'public' ? 'private' : 'public';
    // Delete old and recreate — simple approach
    await fetch(`/api/tunnels/${tunnel.id}`, {
      method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetch('/api/tunnels', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ localPort: tunnel.localPort, protocol: newMode })
    });
    fetchTunnels();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    
    try {
      const endpoint = authMode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Authentication failed');
      
      localStorage.setItem('zrok_token', json.data.token);
      setToken(json.data.token);
    } catch (err: any) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-blue-100">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/30">
              <span className="text-white"><Icons.Server /></span>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-2">Zrok Dashboard</h1>
          <p className="text-slate-500 text-center mb-8">
            {authMode === 'login' ? 'Sign in to manage your Zrok shares' : 'Create an account to get started'}
          </p>
          
          {authError && (
            <div className="bg-rose-50 text-rose-600 p-3 rounded-lg text-sm mb-6 border border-rose-100 text-center">
              {authError}
            </div>
          )}
          
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={authLoading}
              className="w-full flex justify-center py-3 px-4 mt-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition-all disabled:opacity-50"
            >
              {authLoading ? 'Please wait...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
          </form>
          
          <div className="mt-6 text-center text-sm text-slate-500">
            {authMode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button 
              onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setAuthError(''); }}
              className="font-medium text-brand-600 hover:text-brand-500 transition-colors"
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800">
      
      {/* Sidebar */}
      <div className="w-64 bg-white text-slate-800 flex flex-col fixed inset-y-0 z-20 border-r border-slate-200 shadow-sm">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center mr-3 shadow-sm text-white">
            <Icons.Globe />
          </div>
          <span className="font-semibold text-lg text-slate-800">Zrok Panel</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">User</div>
          <nav className="px-3 space-y-1 mb-8">
            <SidebarItem icon={<Icons.Layout />} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
            <SidebarItem icon={<Icons.Globe />} label="My Shares" active={activeTab === 'tunnels'} onClick={() => setActiveTab('tunnels')} badge="3" />
            <SidebarItem icon={<Icons.Key />} label="My Tokens" active={activeTab === 'tokens'} onClick={() => setActiveTab('tokens')} />
          </nav>

          <div className="px-6 mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Admin</div>
          <nav className="px-3 space-y-1">
            <SidebarItem icon={<Icons.Users />} label="All Users" active={activeTab === 'admin-users'} onClick={() => setActiveTab('admin-users')} />
            <SidebarItem icon={<Icons.Server />} label="All Shares" active={activeTab === 'admin-tunnels'} onClick={() => setActiveTab('admin-tunnels')} />
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100">
          <button onClick={() => { localStorage.removeItem('zrok_token'); setToken(null); }} className="flex items-center w-full px-3 py-2 text-sm rounded-lg text-slate-600 hover:bg-slate-50 hover:text-rose-600 transition-colors">
            <span className="mr-3"><Icons.Power /></span> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        
        <main className="flex-1 p-8">
          
          {/* DASHBOARD PAGE */}
          {activeTab === 'dashboard' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                <div className="flex gap-3">
                  <button onClick={() => setIsSetupOpen(true)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                    <span className="mr-2">📚</span> Setup Guide
                  </button>
                  <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                    <span className="mr-2"><Icons.Plus /></span> New Share
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <StatCard label="Active tunnels" value={tunnels.length.toString()} subtext="Ready to route" />
                <StatCard label="API Status" value="Online" subtext={error ? "Connection issue" : "Connected"} />
                <StatCard label="Uptime" value="99.8%" subtext="last 30 days" />
                <StatCard label="Active tokens" value="1" subtext="Current token" />
              </div>

              {/* Active Shares Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-8 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200">
                  <h2 className="font-semibold text-slate-800">Active shares</h2>
                </div>
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 text-left">Public URL</th>
                      <th className="px-6 py-3 text-left">Local port</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Created</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tunnels.slice(0, 5).map((t) => (
                      <tr key={'dash-' + t.id}>
                        <td className="px-6 py-4 font-mono text-brand-600">{t.publicUrl}</td>
                        <td className="px-6 py-4">{t.localPort}</td>
                        <td className="px-6 py-4"><Badge type={t.status === 'active' ? 'success' : 'error'}>{t.status}</Badge></td>
                        <td className="px-6 py-4 text-slate-500">Just now</td>
                        <td className="px-6 py-4 text-right"><ActionButton danger onClick={() => handleCloseTunnel(t.id)}>Close</ActionButton></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Live Traffic Analytics */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-slate-800">Traffic Analytics (Last 7 Days)</h2>
                  <button onClick={async () => {
                    if (tunnels.length > 0) {
                      const res = await fetch(`/api/tunnels/${tunnels[0].id}/analytics`, { headers: { 'Authorization': `Bearer ${token}` } });
                      const json = await res.json();
                      if (json.success) setAnalyticsData(json.data);
                    }
                  }} className="text-xs text-brand-600 hover:underline font-medium">
                    Load data
                  </button>
                </div>
                {analyticsData.length === 0 ? (
                  <div className="h-40 flex items-center justify-center text-slate-400 text-sm">
                    Create a share first, then click 'Load data'
                  </div>
                ) : (
                  <div className="flex items-end gap-2 h-40">
                    {analyticsData.map((d: any, i: number) => {
                      const maxBytes = Math.max(...analyticsData.map((x: any) => x.bytesIn + x.bytesOut));
                      const height = ((d.bytesIn + d.bytesOut) / maxBytes) * 100;
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full bg-brand-400 rounded-t-sm transition-all" style={{ height: `${height}%` }} title={`${Math.round((d.bytesIn + d.bytesOut) / 1024)}KB`}></div>
                          <span className="text-[9px] text-slate-400">{d.date.slice(5)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Custom Domain Verification */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="font-semibold text-slate-800 mb-1">Custom Domain</h2>
                <p className="text-sm text-slate-500 mb-4">Add your own domain (e.g. app.yourdomain.com) and verify it via DNS CNAME.</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="app.yourdomain.com"
                    value={domainInput}
                    onChange={(e) => setDomainInput(e.target.value)}
                    className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-800 focus:ring-2 focus:ring-brand-500 outline-none"
                  />
                  <button
                    onClick={handleVerifyDomain}
                    disabled={domainLoading}
                    className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {domainLoading ? 'Checking...' : 'Verify DNS'}
                  </button>
                </div>
                {domainVerified === true && (
                  <div className="mt-3 text-sm text-emerald-600 font-medium">✅ Domain verified! You can now use it when creating a share.</div>
                )}
                {domainVerified === false && (
                  <div className="mt-3 text-sm text-rose-600">❌ Not verified. Please add a CNAME record pointing to <code className="bg-slate-100 px-1 rounded">share.zrok.io</code> and try again.</div>
                )}
              </div>
            </div>
          )}

          {/* MY SHARES PAGE */}
          {activeTab === 'tunnels' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">My Shares</h1>
                <button onClick={() => setIsModalOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                  <span className="mr-2"><Icons.Plus /></span> New Share
                </button>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 text-left">Share Token</th>
                      <th className="px-6 py-3 text-left">Public URL</th>
                      <th className="px-6 py-3 text-left">Local port</th>
                      <th className="px-6 py-3 text-left">Protocol</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">CLI Command</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {tunnels.map((t) => (
                      <tr key={t.id}>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id.substring(0, 8)}</td>
                        <td className="px-6 py-4 font-mono text-brand-600">{t.publicUrl}</td>
                        <td className="px-6 py-4">{t.localPort}</td>
                        <td className="px-6 py-4"><Badge type="info">{t.protocol.toUpperCase()}</Badge></td>
                        <td className="px-6 py-4"><Badge type={t.status === 'active' ? 'success' : 'error'}>{t.status}</Badge></td>
                        <td className="px-6 py-4">
                          <code className="bg-slate-100 px-2 py-1 rounded text-xs text-slate-600 font-mono text-[10px] break-all">{t.chiselCommand}</code>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => handleCloseTunnel(t.id)} className="px-3 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700 transition-colors">
                            Close
                          </button>
                        </td>
                      </tr>
                    ))}
                    {tunnels.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-slate-500">No tunnels found. Create one!</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* MY TOKENS PAGE */}
          {activeTab === 'tokens' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">My Tokens</h1>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 text-left">Token</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Created</th>
                      <th className="px-6 py-3 text-left">Last used</th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono mr-3">a3f9...e21b</code>
                          <button onClick={() => handleCopy('a3f9...e21b')} className="text-brand-600 hover:text-brand-800 text-xs font-medium">
                            {copiedToken === 'a3f9...e21b' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge type="success" dot={false}>Active</Badge></td>
                      <td className="px-6 py-4 text-slate-500">2 days ago</td>
                      <td className="px-6 py-4 text-slate-500">2 min ago</td>
                      <td className="px-6 py-4 text-right"><ActionButton danger>Revoke</ActionButton></td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <code className="bg-slate-100 px-2 py-1 rounded text-slate-700 font-mono mr-3">c2d5...a18f</code>
                          <button onClick={() => handleCopy('c2d5...a18f')} className="text-brand-600 hover:text-brand-800 text-xs font-medium">
                            {copiedToken === 'c2d5...a18f' ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4"><Badge type="error" dot={false}>Revoked</Badge></td>
                      <td className="px-6 py-4 text-slate-500">10 days ago</td>
                      <td className="px-6 py-4 text-slate-500">8 days ago</td>
                      <td className="px-6 py-4 text-right"><ActionButton disabled>Revoked</ActionButton></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN: ALL USERS */}
          {activeTab === 'admin-users' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">All Users</h1>
                <button onClick={fetchAdminUsers} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors">
                  🔄 Refresh
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 text-left">Email</th>
                      <th className="px-6 py-3 text-left">User ID</th>
                      <th className="px-6 py-3 text-left">Joined</th>
                      <th className="px-6 py-3 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminUsers.length === 0 && (
                      <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                        Click Refresh to load users
                      </td></tr>
                    )}
                    {adminUsers.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 font-medium">{u.email}</td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-400">{u.id.substring(0,12)}...</td>
                        <td className="px-6 py-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><Badge type="success">{u.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ADMIN: ALL TUNNELS */}
          {activeTab === 'admin-tunnels' && (
            <div className="animate-in fade-in duration-300">
              <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold text-slate-900">All Shares</h1>
                <button onClick={fetchAdminTunnels} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                  🔄 Refresh
                </button>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-slate-500 font-medium">
                    <tr>
                      <th className="px-6 py-3 text-left">Share Token</th>
                      <th className="px-6 py-3 text-left">Public URL</th>
                      <th className="px-6 py-3 text-left">Mode</th>
                      <th className="px-6 py-3 text-left">Local Port</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-left">Created</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {adminTunnels.length === 0 && (
                      <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-400">Click Refresh to load shares</td></tr>
                    )}
                    {adminTunnels.map((t) => (
                      <tr key={t.id}>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">{t.id.substring(0,8)}...</td>
                        <td className="px-6 py-4 font-mono text-brand-600 text-xs">{t.publicUrl}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                            t.protocol === 'public' ? 'bg-emerald-50 text-emerald-700' : 'bg-purple-50 text-purple-700'
                          }`}>{t.protocol === 'public' ? '🌐 Public' : '🔒 Private'}</span>
                        </td>
                        <td className="px-6 py-4">{t.localPort}</td>
                        <td className="px-6 py-4"><Badge type={t.status === 'active' ? 'success' : 'error'}>{t.status}</Badge></td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{new Date(t.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateTunnel} className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-800">Create new share</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target / Local port</label>
                  <input type="number" name="localPort" required defaultValue="3000" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Share Mode</label>
                  <select name="shareMode" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all bg-white">
                    <option value="public">Public</option>
                    <option value="private">Private</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Custom Domain (Optional)</label>
                <input type="text" name="customDomain" placeholder="e.g. app.mycompany.com" className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all" />
                <p className="text-xs text-slate-500 mt-1">Leave empty for a random subdomain. Note: You must configure a CNAME record pointing to our server.</p>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors">
                Create tunnel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* SETUP GUIDE MODAL */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-slate-900/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800">Quick Setup Guide</h3>
              <button onClick={() => setIsSetupOpen(false)} className="text-slate-400 hover:text-slate-600"><Icons.Plus /></button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-medium text-slate-800 mb-2 border-b pb-1 border-slate-100">1. Install Zrok</h4>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="font-semibold text-slate-700 text-sm mb-1">Windows</div>
                    <a href="https://github.com/openziti/zrok/releases" target="_blank" className="text-brand-600 text-xs hover:underline">Download zrok.exe</a>
                  </div>
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <div className="font-semibold text-slate-700 text-sm mb-1">Linux / Mac</div>
                    <code className="text-[10px] bg-slate-200 px-1 rounded text-slate-700">curl -sS https://get.openziti.io/install.bash | bash</code>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2 border-b pb-1 border-slate-100">2. Enable Environment</h4>
                <p className="text-sm text-slate-600 mb-2">First time only! Enable your zrok environment:</p>
                <div className="bg-slate-900 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-emerald-400 text-sm font-mono">zrok enable YOUR_TOKEN_HERE</code>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-slate-800 mb-2 border-b pb-1 border-slate-100">3. Share Resource</h4>
                <p className="text-sm text-slate-600 mb-2">Run the command provided in your shares table:</p>
                <div className="bg-slate-900 p-3 rounded-lg flex items-center justify-between">
                  <code className="text-emerald-400 text-sm font-mono">zrok share public localhost:3000</code>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button onClick={() => setIsSetupOpen(false)} className="px-4 py-2 text-sm font-medium text-white bg-slate-800 rounded-lg hover:bg-slate-900 transition-colors">
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
  );
}

// UI Components
function SidebarItem({ icon, label, badge, active, onClick }: { icon: React.ReactNode, label: string, badge?: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all ${
        active ? 'bg-brand-50 text-brand-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
      }`}
    >
      <div className="flex items-center">
        <span className={`mr-3 ${active ? 'text-brand-600' : 'text-slate-400'}`}>{icon}</span>
        {label}
      </div>
      {badge && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${active ? 'bg-brand-200 text-brand-800' : 'bg-slate-100 text-slate-500'}`}>
          {badge}
        </span>
      )}
    </button>
  );
}

function StatCard({ label, value, subtext }: { label: string, value: string, subtext: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
      <div className="text-2xl font-bold text-slate-800 mb-1">{value}</div>
      <div className="text-xs text-slate-400">{subtext}</div>
    </div>
  );
}

function Badge({ children, type = 'info', dot = true }: { children: React.ReactNode, type?: 'success'|'error'|'info'|'neutral', dot?: boolean }) {
  const styles = {
    success: 'bg-emerald-100 text-emerald-800',
    error: 'bg-rose-100 text-rose-800',
    info: 'bg-blue-100 text-blue-800',
    neutral: 'bg-slate-100 text-slate-800'
  };
  const dotStyles = {
    success: 'bg-emerald-500',
    error: 'bg-rose-500',
    info: 'bg-blue-500',
    neutral: 'bg-slate-500'
  };
  
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[type]}`}>
      {dot && <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${dotStyles[type]}`}></span>}
      {children}
    </span>
  );
}

function ActionButton({ children, danger, disabled }: { children: React.ReactNode, danger?: boolean, disabled?: boolean }) {
  if (disabled) {
    return <button disabled className="px-3 py-1 text-xs font-medium rounded-md border border-slate-200 text-slate-400 opacity-50 cursor-not-allowed">{children}</button>;
  }
  return (
    <button className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors ${
      danger 
        ? 'border-slate-200 text-slate-600 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-700' 
        : 'border-slate-200 text-slate-600 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700'
    }`}>
      {children}
    </button>
  );
}
