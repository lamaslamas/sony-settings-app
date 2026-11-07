// Voci della checklist pre-ripresa, adattate alla situazione scelta.
import type { Situazione } from '../types';
import { guida } from './data';
import type { Scelte } from './proposte';

export type Voce = { id: string; testo: string; dettaglio?: string; verify?: boolean; verifyNota?: string; quando?: 'zebre' | 'luciArtificiali' };

/**
 * Le voci “condizionate” compaiono solo quando servono (zebre: la situazione le prevede;
 * luci artificiali: l'hai indicato). Senza situazione scelta compaiono tutte, con la condizione scritta.
 */
export function vociPreRipresa(tipo: 'video' | 'foto', sit: Situazione | undefined, sc: Pick<Scelte, 'luciArtificiali'>): Voce[] {
  const comune: Voce[] = guida.preRipresa.comune.map((c) => ({
    ...c,
    // La compensazione dipende dalla situazione: con ISO fisso (interviste) non ha effetto.
    dettaglio: sit ? sit.compensazione.nota : c.dettaglio,
  }));
  const serve = (v: Voce): boolean => {
    if (!sit) return true;
    if (v.quando === 'zebre') return !!sit.zebre;
    if (v.quando === 'luciArtificiali') return sc.luciArtificiali;
    return true;
  };
  const specifiche = (guida.preRipresa[tipo] as Voce[]).filter(serve).map((v): Voce => {
    if (sit?.zebre && v.quando === 'zebre') {
      const alt = sit.zebre.alternative.length ? ` (alternativa ${sit.zebre.alternative.join(', ')})` : '';
      return { ...v, testo: 'Zebre attive', dettaglio: `Zebra Level ${sit.zebre.livello}${alt}. ${v.dettaglio ?? ''}` };
    }
    if (sit && v.id === 'f-iso') {
      const max = sit.diff.find((d) => d.campo === 'isoMax')?.value ?? '12800';
      return { ...v, testo: `ISO AUTO, massimo ${max}` };
    }
    if (!sit && v.quando === 'luciArtificiali') return { ...v, testo: `${v.testo} (solo con luci artificiali)` };
    return v;
  });
  return [...comune, ...specifiche];
}
