/* Mock mínimo de Leaflet para Jest. Evita tocar el DOM real. */

const chain: any = new Proxy(
    {},
    {
        get: () => () => chain,
    },
);

const mapInstance = {
    setView: jest.fn().mockReturnThis(),
    remove: jest.fn(),
    fitBounds: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
    getZoom: jest.fn().mockReturnValue(13),
    on: jest.fn(),
    off: jest.fn(),
};

const layerGroup = {
    addTo: jest.fn().mockReturnThis(),
    clearLayers: jest.fn(),
    addLayer: jest.fn(),
};

const marker = {
    addTo: jest.fn().mockReturnThis(),
    bindPopup: jest.fn().mockReturnThis(),
    on: jest.fn(),
    openPopup: jest.fn(),
};

export const map = jest.fn(() => mapInstance);
export const tileLayer = jest.fn(() => ({ addTo: jest.fn() }));
export const layerGroup_fn = jest.fn(() => layerGroup);
export { layerGroup_fn as layerGroup };
export const circleMarker = jest.fn(() => marker);
export const circle = jest.fn(() => marker);
export const latLng = jest.fn((lat: number, lng: number) => ({ lat, lng }));
export const latLngBounds = jest.fn(() => ({}));
export const Control = {
    extend: jest.fn(() => function () { return { addTo: jest.fn() }; }),
};
export const DomUtil = { create: jest.fn(() => document.createElement('a')) };
export const DomEvent = {
    on: jest.fn(),
    disableClickPropagation: jest.fn(),
    preventDefault: jest.fn(),
};

export default {
    map,
    tileLayer,
    layerGroup: layerGroup_fn,
    circleMarker,
    circle,
    latLng,
    latLngBounds,
    Control,
    DomUtil,
    DomEvent,
};
