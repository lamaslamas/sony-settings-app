import { useState } from 'preact/hooks';
import { situazioni, situazioneById } from '../lib/data';
import { vociPreRipresa } from '../lib/preripresa';
import { useStato } from '../lib/useStato';
import { aggiornaEvento, azzeraSpunte, impostaSpunta } from '../lib/storage';
import { scelteDi, suggerisciLuciArtificiali } from '../lib/useProposte';
import { VerifyBadge } from '../components/Badges';
import { CheckRow } from '../components/CheckRow';

/** Checklist veloce prima di registrare/scattare. La prima voce è sempre la ghiera di compensazione a 0. */
export function PreRipresa() {
  const { evento, aggiorna } = useStato();
  const iniziale = situazioneById(evento.ultimaSituazione ?? '');
  const [sid, setSid] = useState<string>(iniziale?.id ?? '');
  const sit = situazioneById(sid);
  const [tipoScelto, setTipo] = useState<'video' | 'foto'>(iniziale?.tipo ?? 'video');
  const tipo = sit?.tipo ?? tipoScelto; // con una situazione scelta il tipo è quello della situazione
  const sc = scelteDi(evento);

  const prefisso = `pre/${tipo}/`;
  const items = vociPreRipresa(tipo, sit, sc);
  const fatte = items.filter((i) => evento.spunte[prefisso + i.id]).length;
  const suggerito = suggerisciLuciArtificiali(evento);

  return (
    <div class="page stack">
      <h1>Pre-ripresa</h1>
      <div class="card stack">
        <label class="small dim" for="sit">Situazione</label>
        <select id="sit" value={sid} onChange={(e) => setSid((e.target as HTMLSelectElement).value)}>
          <option value="">Nessuna (solo controlli generali)</option>
          {situazioni.map((s) => <option value={s.id} key={s.id}>{s.nome}</option>)}
        </select>
        {!sit && (
          <div class="seg" role="group" aria-label="Tipo di ripresa">
            <button aria-pressed={tipo === 'video'} onClick={() => setTipo('video')}>Video</button>
            <button aria-pressed={tipo === 'foto'} onClick={() => setTipo('foto')}>Foto</button>
          </div>
        )}
        {sit?.tipo === 'foto' && (
          <label class="check" style={{ minHeight: 'var(--hit)' }}>
            <input type="checkbox" checked={sc.luciArtificiali}
              onChange={(e) => aggiorna((s) => aggiornaEvento(s, (ev) => ({ ...ev, scelte: { ...ev.scelte, luciArtificiali: (e.target as HTMLInputElement).checked } })))} />
            <span class="body">Luci artificiali{evento.scelte?.luciArtificiali === undefined && suggerito ? ' (suggerito dalla foto di prova)' : ''}</span>
          </label>
        )}
      </div>
      <div class="row">
        <span class="progress" aria-live="polite">{fatte} di {items.length}</span>
        <button class="btn small" onClick={() => aggiorna((s) => azzeraSpunte(s, prefisso))}>Azzera per la prossima ripresa</button>
      </div>
      <div class="card" style={{ padding: 0 }}>
        {items.map((i) => (
          <CheckRow key={i.id} checked={!!evento.spunte[prefisso + i.id]} onChange={(v) => aggiorna((s) => impostaSpunta(s, prefisso + i.id, v))}>
            <div class="name">{i.testo} {i.verify && <VerifyBadge />}</div>
            {i.dettaglio && <div class="small dim">{i.dettaglio}</div>}
            {i.verifyNota && <div class="small dim">{i.verifyNota}</div>}
          </CheckRow>
        ))}
      </div>
    </div>
  );
}
