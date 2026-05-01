import {
    AfterViewInit,
    ChangeDetectionStrategy,
    Component,
    ElementRef,
    OnChanges,
    OnDestroy,
    SimpleChanges,
    ViewChild,
    inject,
    input,
    output,
} from '@angular/core';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { Court } from '../../../domain/court/court.model';

const AVAILABLE_COLOR = '#2e7d32';
const UNAVAILABLE_COLOR = '#9e9e9e';
const USER_COLOR = '#1976d2';

export type GeolocationErrorReason = 'unsupported' | 'insecure' | 'denied' | 'unavailable' | 'timeout';

@Component({
    selector: 'app-court-map',
    standalone: true,
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<div #mapContainer class="map-container" [style.height]="height()"></div>`,
    styles: [
        `
      :host { display: block; }
      .map-container {
        width: 100%;
        border-radius: 12px;
        overflow: hidden;
        z-index: 0;
      }
    `,
    ],
})
export class CourtMapComponent implements AfterViewInit, OnChanges, OnDestroy {
    private readonly router = inject(Router);

    readonly courts = input<Court[]>([]);
    readonly height = input<string>('400px');
    readonly fitBounds = input<boolean>(true);
    readonly interactive = input<boolean>(true);
    readonly locateUser = input<boolean>(false);

    readonly geolocationError = output<GeolocationErrorReason>();
    readonly userLocated = output<GeolocationCoordinates>();

    @ViewChild('mapContainer', { static: true }) private mapEl!: ElementRef<HTMLDivElement>;

    private map?: L.Map;
    private markersLayer?: L.LayerGroup;
    private userLayer?: L.LayerGroup;
    private watchId?: number;
    private lastUserLatLng?: L.LatLng;

    ngAfterViewInit(): void {
        this.initMap();
        this.renderMarkers();
        if (this.locateUser()) {
            this.startGeolocation();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['courts'] && this.map) {
            this.renderMarkers();
        }
    }

    ngOnDestroy(): void {
        if (this.watchId !== undefined && navigator.geolocation) {
            navigator.geolocation.clearWatch(this.watchId);
        }
        this.map?.remove();
    }

    private initMap(): void {
        const interactive = this.interactive();
        this.map = L.map(this.mapEl.nativeElement, {
            zoomControl: interactive,
            dragging: interactive,
            scrollWheelZoom: interactive,
            doubleClickZoom: interactive,
            boxZoom: interactive,
            keyboard: interactive,
            touchZoom: interactive,
            attributionControl: true,
        }).setView([10.4006, -75.5247], 13); // Cartagena por defecto

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            maxZoom: 19,
        }).addTo(this.map);

        this.markersLayer = L.layerGroup().addTo(this.map);
        this.userLayer = L.layerGroup().addTo(this.map);

        if (this.locateUser() && interactive) {
            this.addLocateControl();
        }
    }

    private addLocateControl(): void {
        if (!this.map) return;
        const LocateControl = L.Control.extend({
            onAdd: () => {
                const btn = L.DomUtil.create('a', 'leaflet-bar leaflet-control locate-btn');
                btn.href = '#';
                btn.title = 'Centrar en mi ubicación';
                btn.setAttribute('role', 'button');
                btn.setAttribute('aria-label', 'Centrar en mi ubicación');
                btn.innerHTML = '\u25C9';
                btn.style.cssText =
                    'width:34px;height:34px;line-height:34px;text-align:center;font-size:20px;color:#1976d2;background:#fff;text-decoration:none;cursor:pointer;';
                L.DomEvent.disableClickPropagation(btn);
                L.DomEvent.on(btn, 'click', (ev) => {
                    L.DomEvent.preventDefault(ev);
                    this.recenterOnUser();
                });
                return btn;
            },
        });
        new LocateControl({ position: 'topright' }).addTo(this.map);
    }

    private startGeolocation(): void {
        if (!navigator.geolocation) {
            this.geolocationError.emit('unsupported');
            return;
        }
        // Geolocation API solo disponible en contextos seguros (https o localhost)
        if (typeof window !== 'undefined' && window.isSecureContext === false) {
            this.geolocationError.emit('insecure');
            return;
        }

        const opts: PositionOptions = {
            enableHighAccuracy: true,
            maximumAge: 30_000,
            timeout: 15_000,
        };

        this.watchId = navigator.geolocation.watchPosition(
            (pos) => {
                this.renderUserPosition(pos.coords);
                this.userLocated.emit(pos.coords);
            },
            (err) => {
                let reason: GeolocationErrorReason = 'unavailable';
                if (err.code === err.PERMISSION_DENIED) reason = 'denied';
                else if (err.code === err.TIMEOUT) reason = 'timeout';
                this.geolocationError.emit(reason);
            },
            opts,
        );
    }

    private renderUserPosition(coords: GeolocationCoordinates): void {
        if (!this.map || !this.userLayer) return;
        this.userLayer.clearLayers();

        const latLng = L.latLng(coords.latitude, coords.longitude);
        this.lastUserLatLng = latLng;

        L.circle(latLng, {
            radius: Math.max(coords.accuracy ?? 0, 10),
            color: USER_COLOR,
            fillColor: USER_COLOR,
            fillOpacity: 0.15,
            weight: 1,
        }).addTo(this.userLayer);

        L.circleMarker(latLng, {
            radius: 8,
            color: '#fff',
            weight: 2,
            fillColor: USER_COLOR,
            fillOpacity: 1,
        })
            .bindPopup('<strong>Estás aquí</strong>')
            .addTo(this.userLayer);
    }

    private recenterOnUser(): void {
        if (!this.map) return;
        if (this.lastUserLatLng) {
            this.map.setView(this.lastUserLatLng, 15, { animate: true });
            return;
        }
        // Si aún no tenemos ubicación, pídela una vez
        if (!navigator.geolocation) {
            this.geolocationError.emit('unsupported');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                this.renderUserPosition(pos.coords);
                this.userLocated.emit(pos.coords);
                this.map?.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
            },
            (err) => {
                let reason: GeolocationErrorReason = 'unavailable';
                if (err.code === err.PERMISSION_DENIED) reason = 'denied';
                else if (err.code === err.TIMEOUT) reason = 'timeout';
                this.geolocationError.emit(reason);
            },
            { enableHighAccuracy: true, timeout: 15_000 },
        );
    }

    private renderMarkers(): void {
        if (!this.map || !this.markersLayer) return;
        this.markersLayer.clearLayers();

        const courts = this.courts();
        if (!courts.length) return;

        const points: L.LatLngExpression[] = [];

        for (const court of courts) {
            const { latitude, longitude } = court.location;
            if (latitude == null || longitude == null) continue;

            const color = court.available ? AVAILABLE_COLOR : UNAVAILABLE_COLOR;
            const marker = L.circleMarker([latitude, longitude], {
                radius: 10,
                color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 2,
            });

            const safeName = this.escapeHtml(court.name);
            const safeZone = this.escapeHtml(court.location.zone);
            const popupHtml = `
        <div style="min-width: 180px;">
          <strong>${safeName}</strong><br/>
          <small>${safeZone}</small><br/>
          <span style="color:${color}; font-weight:600;">
            ${court.available ? 'Disponible' : 'Ocupada'}
          </span><br/>
          <span>$${court.pricePerHour.toLocaleString('es-CO')} / hora</span><br/>
          <a href="javascript:void(0)" data-court-id="${court.id}" class="map-link">Ver cancha</a>
        </div>
      `;

            marker.bindPopup(popupHtml);
            marker.on('popupopen', (e) => {
                const link = (e.popup.getElement() as HTMLElement).querySelector<HTMLAnchorElement>('.map-link');
                link?.addEventListener('click', () => this.router.navigate(['/canchas', court.id]));
            });

            marker.addTo(this.markersLayer);
            points.push([latitude, longitude]);
        }

        if (this.fitBounds() && points.length) {
            this.map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 15 });
        } else if (points.length === 1) {
            this.map.setView(points[0], 15);
        }
    }

    private escapeHtml(value: string): string {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }
}
