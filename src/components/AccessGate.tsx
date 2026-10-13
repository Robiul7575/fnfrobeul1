import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

const KEY = 'fnf-access-code';

async function verify(code: string): Promise<boolean> {
  const { data, error } = await supabase.functions.invoke('verify-access', { body: { code } });
  return !error && data?.ok === true;
}

export function AccessGate({ children }: { children: ReactNode }) {
  const [state, setState] = useState<'checking' | 'locked' | 'open'>('checking');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (!saved) return setState('locked');
    verify(saved).then((ok) => {
      if (!ok) localStorage.removeItem(KEY);
      setState(ok ? 'open' : 'locked');
    });
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const ok = await verify(code.trim());
    setBusy(false);
    if (ok) {
      localStorage.setItem(KEY, code.trim());
      setState('open');
    } else setError('Wrong or expired password');
  };

  if (state === 'open') return <>{children}</>;
  if (state === 'checking')
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 border rounded-lg p-6 bg-card shadow-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <Lock className="h-8 w-8 text-primary" />
          <h1 className="text-xl font-semibold">FnF Invoice Generator</h1>
          <p className="text-sm text-muted-foreground">Enter your access password to continue.</p>
        </div>
        <Input type="password" value={code} onChange={(e) => setCode(e.target.value)} placeholder="Password" autoFocus />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy || !code.trim()}>
          {busy ? 'Checking…' : 'Enter'}
        </Button>
      </form>
    </div>
  );
}
