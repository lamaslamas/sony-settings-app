import { describe, expect, it } from 'vitest';
import { baseFoto, baseVideo, situazioneById, situazioniFile } from '../src/lib/data';
import { proponi, SCELTE_INIZIALI, valoriDaBase } from '../src/lib/proposte';
import type { LetturaLuce } from '../src/lib/analisi';

const lettura = (ev: number): LetturaLuce => ({
  valida: true, problemi: [], avvisi: [], ev, evDescrizione: '', temperaturaK: 4000, dominante: 'neutra', tinta: null, luceMista: null,
  affidabilitaColore: 'alta', origine: 'camera-jpeg', impostazioni: { iso: 800, tempo: 1 / 50, diaframma: 4, daExif: true }, istogramma: [],
});

describe('base foto M2: modo M, ISO AUTO, 1/200, F2.8', () => {
  it('i dati della base', () => {
    expect(baseFoto.dials).toEqual({ stillMovieSq: 'Still', mode: 'M', tempo: '1/200', diaframma: 'F2.8' });
    expect(baseFoto.entries.find((e) => e.item === 'ISO')!.value).toBe('ISO AUTO');
  });

  it('i valori di partenza entrano nel controllo delle regole', () => {
    expect(valoriDaBase(baseFoto)).toMatchObject({ shutterDenominator: 200, apertureF: 2.8, isoAuto: true, isoAutoMax: 12800 });
    expect(valoriDaBase(baseVideo).shutterDenominator).toBeUndefined(); // la base video non fissa tempo e diaframma
  });

  it('la conferenza è identica alla base: resta solo il controllo dell’obiettivo', () => {
    expect(situazioneById('conferenza')!.diff.every((d) => d.source === 'lens')).toBe(true);
  });

  it('le situazioni in M non ripetono Mode dial, ISO e valori già nella base', () => {
    const gc = situazioneById('gruppo-chiuso')!;
    expect(gc.diff.map((d) => d.id)).toEqual(expect.arrayContaining(['shutter', 'aperture']));
    expect(gc.diff.some((d) => d.id === 'mode' || d.id === 'iso')).toBe(false);
    expect(situazioneById('wildlife')!.diff.some((d) => d.id === 'mode')).toBe(false);
  });

  it('paesaggio e foto di gruppo aperto, che dipendevano dal modo A, passano in A con un passo dedicato', () => {
    for (const id of ['paesaggio', 'gruppo-aperto']) {
      const m = situazioneById(id)!.diff.find((d) => d.id === 'mode');
      expect(m, id).toMatchObject({ source: 'dial', label: 'Mode dial', value: 'A' });
    }
  });

  it('la conferenza ha la previsione dell’ISO dai valori della base, senza diff', () => {
    const s = situazioneById('conferenza')!;
    const p = proponi({ s, base: baseFoto, regole: situazioniFile.regole, lettura: lettura(5), scelte: SCELTE_INIZIALI, modificati: {} });
    expect(p.previsione.join(' ')).toMatch(/ISO atteso/);
  });

  it('wildlife: 1/1000 e tutta apertura restano differenze rispetto a 1/200 F2.8', () => {
    const w = situazioneById('wildlife')!;
    expect(w.diff.find((d) => d.id === 'shutter')!.value).toBe('1/1000');
    expect(w.diff.find((d) => d.id === 'aperture')!.value).toBe('Tutta apertura');
  });
});
