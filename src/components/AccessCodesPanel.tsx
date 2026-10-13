import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, KeyRound, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Code = { id: string; code: string; label: string | null; created_at: string; expires_at: string };
const CREDS = { username: 'Robeul', password: 'Robeul1' };

export function AccessCodesPanel() {
  const [codes, setCodes] = useState<Code[]>([]);
  const [label, setLabel] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const { data } = await supabase.functions.invoke('history-admin', { body: { op: 'list_codes', ...CREDS } });
    setCodes(data?.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const create = async () => {
    setBusy(true);
    const { data, error } = await supabase.functions.invoke('history-admin', {
      body: { op: 'create_code', label: label.trim() || null, ...CREDS },
    });
    setBusy(false);
    if (error || !data?.data) return toast.error('Could not create password');
    setLabel('');
    navigator.clipboard?.writeText(data.data.code).catch(() => {});
    toast.success(`Password ${data.data.code} created and copied`);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Remove this password? That person will lose access.')) return;
    await supabase.functions.invoke('history-admin', { body: { op: 'delete_code', id, ...CREDS } });
    load();
  };

  const fmt = (s: string) => new Date(s).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const now = Date.now();
  const active = codes.filter((c) => new Date(c.expires_at).getTime() > now).length;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <div className="border rounded-md p-2 text-center"><p className="text-lg font-bold">{active}</p><p className="text-[10px] text-muted-foreground">Active</p></div>
        <div className="border rounded-md p-2 text-center"><p className="text-lg font-bold">{codes.length - active}</p><p className="text-[10px] text-muted-foreground">Expired</p></div>
      </div>
      <div className="flex gap-2">
        <Input placeholder="Person's name (optional)" value={label} onChange={(e) => setLabel(e.target.value)} />
        <Button onClick={create} disabled={busy}><KeyRound className="h-4 w-4 mr-1" />Generate</Button>
      </div>
      <p className="text-[11px] text-muted-foreground">Each password works for 1 month.</p>
      <ul className="space-y-2">
        {codes.map((c) => {
          const expired = new Date(c.expires_at).getTime() <= now;
          return (
            <li key={c.id} className="border rounded-md p-2 flex items-center gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-mono text-sm font-semibold">{c.code}</p>
                <p className="text-xs text-muted-foreground truncate">{c.label || '—'}</p>
                <p className={`text-[10px] ${expired ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {expired ? 'Expired' : 'Expires'} {fmt(c.expires_at)}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { navigator.clipboard?.writeText(c.code); toast.success('Copied'); }}><Copy className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => remove(c.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
