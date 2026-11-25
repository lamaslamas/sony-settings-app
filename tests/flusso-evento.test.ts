import { describe, expect, it } from 'vitest';
import { guida, situazioniFile, menu } from '../src/lib/data';

const testo = (p: { testo: string; valore?: string; avviso?: string }) => `${p.testo} ${p.valore ?? ''} ${p.avviso ?? ''}`;
const blocco = (id: string) => guida.passi.find((b) => b.id === id)!;

describe('flusso dell’evento: ogni posizione ha due memorie (Still e Movie)', () => {
  it('passo B: ghiera su 1, richiamo di M1 in Movie e salvataggio su 1, poi richiamo di M2 in Still e salvataggio su 1', () => {
    const passi = blocco('B').passi;
    const richiami = passi.filter((p) => p.menu?.item === 'Recall Camera Setting').map((p) => p.valore);
    const salvataggi = passi.filter((p) => p.menu?.item === 'Camera Set. Memory').map((p) => p.valore);
    expect(richiami).toEqual(['M1', 'M2']);
    expect(salvataggi).toEqual(['1', '1']);
    const t = passi.map(testo);
    const movie = t.findIndex((x) => /su Movie e la ghiera dei modi su 1/.test(x));
    const richiamoM1 = passi.findIndex((p) => p.valore === 'M1');
    const salvaMovie = t.findIndex((x) => /memoria Movie/.test(x));
    const still = t.findIndex((x) => /su Still/.test(x));
    const richiamoM2 = passi.findIndex((p) => p.valore === 'M2');
    const salvaStill = t.findIndex((x) => /memoria Still/.test(x));
    expect([movie, richiamoM1, salvaMovie, still, richiamoM2, salvaStill].every((i) => i >= 0)).toBe(true);
    expect(movie).toBeLessThan(richiamoM1);
    expect(richiamoM1).toBeLessThan(salvaMovie);
    expect(salvaMovie).toBeLessThan(still);
    expect(still).toBeLessThan(richiamoM2);
    expect(richiamoM2).toBeLessThan(salvaStill);
  });

  it('i passi di richiamo avvisano che serve la ghiera su 1, 2 o 3 (messaggio della camera)', () => {
    const avvisi = blocco('B').passi.map((p) => p.avviso ?? '').join(' ');
    expect(avvisi).toMatch(/This function is currently disabled/);
    expect(guida.concetti.find((c) => c.id === 'richiamo')!.testo).toMatch(/This function is currently disabled/);
  });

  it('passo C: la ghiera resta su 1 e si cambia solo Still/Movie', () => {
    const t = blocco('C').passi.map((p) => p.testo).join(' ');
    expect(t).toMatch(/ghiera dei modi su 1 per tutto l'evento/);
    expect(t).toMatch(/Cambi solo questa manopola/);
    expect(t).not.toMatch(/ghiera dei modi su 2/);
  });

  it('video e foto dell’evento si salvano entrambi su 1 (memorie Movie e Still)', () => {
    const { video, foto } = situazioniFile.salvataggioEvento;
    expect(video.passi[0]).toMatchObject({ valore: '1', menu: { item: 'Camera Set. Memory' } });
    expect(foto.passi[0]).toMatchObject({ valore: '1', menu: { item: 'Camera Set. Memory' } });
    expect(video.passi[0].testo).toMatch(/Movie/);
    expect(foto.passi[0].testo).toMatch(/Still/);
  });

  it('il concetto delle due memorie per posizione c’è e resta evidenziato', () => {
    const c = guida.concetti.find((x) => x.id === 'due-memorie')!;
    expect(c.evidenzia).toBe(true);
    expect(c.testo).toMatch(/due memorie separate/);
  });

  it('non resta nessun “da verificare” su Camera Set. Memory, Recall Camera Setting, Memory/Recall Media', () => {
    const voci = ['Camera Set. Memory', 'Recall Camera Setting', 'Memory/Recall Media'];
    const shooting = menu.tabs.find((t) => t.id === 'shooting')!.groups.find((g) => g.name === 'Shooting Mode')!;
    for (const v of voci) expect(shooting.items.find((i) => i.name === v)!.verify).toBeFalsy();
    // (la ghiera di compensazione della pre-ripresa resta “da verificare”: è un'altra cosa)
    const json = JSON.stringify([guida.concetti, guida.passi, situazioniFile.salvataggioEvento]);
    expect(json).not.toMatch(/"verify":true/);
  });
});
