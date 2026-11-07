import { describe, expect, it } from 'vitest';
import { situazioneById } from '../src/lib/data';
import { vociPreRipresa } from '../src/lib/preripresa';

const testi = (id: string | undefined, luci: boolean, tipo: 'video' | 'foto' = 'foto') =>
  vociPreRipresa(tipo, id ? situazioneById(id) : undefined, { luciArtificiali: luci }).map((v) => v.testo).join(' | ');

describe('pre-ripresa adattata alla situazione', () => {
  it('wildlife all’aperto: niente voce sulle luci artificiali', () => {
    expect(testi('wildlife', false)).not.toMatch(/Luci artificiali/);
  });
  it('wildlife con luci artificiali indicate: la voce compare', () => {
    expect(testi('wildlife', true)).toMatch(/Mechanical Shutter/);
  });
  it('wildlife: zebre attive e ISO AUTO massimo 6400', () => {
    const t = testi('wildlife', false);
    expect(t).toMatch(/Zebre attive/);
    expect(t).toMatch(/massimo 6400/);
  });
  it('conferenza (zebre non previste): niente zebre', () => {
    expect(testi('conferenza', true)).not.toMatch(/Zebre/);
    expect(testi('conferenza', true)).toMatch(/Mechanical Shutter/);
  });
  it('foto: ISO AUTO massimo 12800 se la situazione non lo cambia', () => {
    expect(testi('paesaggio', false)).toMatch(/massimo 12800/);
  });
  it('senza situazione compaiono tutte le voci, con la condizione scritta', () => {
    const t = testi(undefined, false);
    expect(t).toMatch(/Zebre per le alte luci/);
    expect(t).toMatch(/solo con luci artificiali/);
  });
  it('la ghiera di compensazione è sempre la prima voce', () => {
    expect(vociPreRipresa('video', situazioneById('intervista-chiuso'), { luciArtificiali: false })[0].id).toBe('compensazione');
  });
});
