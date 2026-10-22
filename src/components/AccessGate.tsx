import { useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock } from 'lucide-react';

const KEY = 'fnf-access-code';

// Returns true/false when the server answered, null on network failure.
async function verify(code: string): Promise<boolean | null> {
  try {
    const { data, error } = await supabase.functions.invoke('verify-access', { body: { code } });
    if (error) return (error as { name?: string }).name === 'FunctionsFetchError' ? null : false;
    return data?.ok === true;
  } catch {
    return null;
  }
}

export function AccessGate({ children }: { children: ReactNode }) {
  // Open instantly on reload if a password was saved; re-check quietly in background.
  const [state, setState] = useState<'locked' | 'open'>(() =>
    localStorage.getItem(KEY) ? 'open' : 'locked'
  );
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    if (!saved) return;
    verify(saved).then((ok) => {
      if (ok === false) {
        localStorage.removeItem(KEY);
        setError('Your password has expired. Please enter a new one.');
        setState('locked');
      }
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
    } else if (ok === null) setError('No internet connection. Please try again.');
    else setError('Wrong or expired password');
  };

  if (state === 'open') return <>{children}</>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-accent/70 via-background to-background p-4">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-border/70 bg-card shadow-lift p-7"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-lift">
            <Lock className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">FnF Pharmaceuticals</h1>
            <p className="text-[11px] font-semibold uppercase tracking-widest text-primary/80 mt-0.5">
              Invoice Generator
            </p>
          </div>
          <p className="text-sm text-muted-foreground">Enter your access password to continue.</p>
        </div>
        <Input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Password"
          autoFocus
          className="h-11 rounded-xl text-center tracking-widest"
        />
        {error && (
          <p className="text-sm text-destructive text-center bg-destructive/10 rounded-lg py-2 px-3">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={busy || !code.trim()}>
          {busy ? 'Checking…' : 'Enter'}
        </Button>
      </form>
    </div>
  );
}
