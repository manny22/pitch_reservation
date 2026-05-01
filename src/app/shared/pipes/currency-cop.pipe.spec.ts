import { CurrencyCopPipe } from './currency-cop.pipe';

describe('CurrencyCopPipe', () => {
    let pipe: CurrencyCopPipe;

    beforeEach(() => {
        pipe = new CurrencyCopPipe();
    });

    it('formatea un valor positivo en pesos colombianos', () => {
        const result = pipe.transform(50000);
        // El símbolo y separadores varían por ICU; validamos contenido clave
        expect(result).toContain('50');
        expect(result).toMatch(/\$|COP/);
    });

    it('devuelve cadena vacía para null', () => {
        expect(pipe.transform(null)).toBe('');
    });

    it('devuelve cadena vacía para undefined', () => {
        expect(pipe.transform(undefined)).toBe('');
    });

    it('devuelve cadena vacía para NaN', () => {
        expect(pipe.transform(Number.NaN)).toBe('');
    });

    it('formatea cero correctamente', () => {
        const result = pipe.transform(0);
        expect(result).toContain('0');
    });
});
