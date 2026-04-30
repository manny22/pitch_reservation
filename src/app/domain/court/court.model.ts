export type CourtType = '5' | '7' | '8' | '11';

export interface CourtAmenities {
    parking: boolean;
    showers: boolean;
    bibs: boolean;
    lighting: boolean;
    cafeteria: boolean;
}

export interface CourtLocation {
    address: string;
    city: string;
    zone: string;
    latitude: number;
    longitude: number;
}

export interface Court {
    id: string;
    name: string;
    description: string;
    type: CourtType;
    pricePerHour: number;
    photos: string[];
    location: CourtLocation;
    amenities: CourtAmenities;
    averageRating: number;
    reviewsCount: number;
    available: boolean;
    activePromotionId?: string;
    cancellationPolicy: string;
    ownerId: string;
}
