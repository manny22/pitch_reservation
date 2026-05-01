import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RatingStarsComponent } from './rating-stars.component';

describe('RatingStarsComponent', () => {
    let fixture: ComponentFixture<RatingStarsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RatingStarsComponent],
        }).compileComponents();
        fixture = TestBed.createComponent(RatingStarsComponent);
    });

    it('se crea correctamente', () => {
        fixture.detectChanges();
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('muestra 5 iconos de estrella', () => {
        fixture.componentRef.setInput('value', 3);
        fixture.detectChanges();
        const icons = fixture.nativeElement.querySelectorAll('mat-icon');
        expect(icons.length).toBe(5);
    });

    it('renderiza "star" para estrellas rellenas y "star_border" para las vacías', () => {
        fixture.componentRef.setInput('value', 3);
        fixture.detectChanges();
        const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-icon');
        const texts = Array.from(icons).map((i) => i.textContent?.trim());
        expect(texts.slice(0, 3).every((t) => t === 'star')).toBe(true);
        expect(texts.slice(3).every((t) => t === 'star_border')).toBe(true);
    });

    it('todas rellenas con value=5', () => {
        fixture.componentRef.setInput('value', 5);
        fixture.detectChanges();
        const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-icon');
        Array.from(icons).forEach((i) => expect(i.textContent?.trim()).toBe('star'));
    });

    it('todas vacías con value=0', () => {
        fixture.componentRef.setInput('value', 0);
        fixture.detectChanges();
        const icons: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('mat-icon');
        Array.from(icons).forEach((i) => expect(i.textContent?.trim()).toBe('star_border'));
    });

    it('muestra el valor numérico cuando showValue=true', () => {
        fixture.componentRef.setInput('value', 4.7);
        fixture.componentRef.setInput('showValue', true);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).toContain('4.7');
    });

    it('no muestra el valor numérico cuando showValue=false', () => {
        fixture.componentRef.setInput('value', 4.7);
        fixture.componentRef.setInput('showValue', false);
        fixture.detectChanges();
        expect(fixture.nativeElement.textContent).not.toContain('4.7');
    });

    it('el aria-label refleja el valor correcto', () => {
        fixture.componentRef.setInput('value', 4);
        fixture.detectChanges();
        const span: HTMLElement = fixture.nativeElement.querySelector('.rating');
        expect(span.getAttribute('aria-label')).toContain('4');
    });
});
