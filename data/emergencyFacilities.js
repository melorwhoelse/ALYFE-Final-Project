// Fire station data from data.gov.sg
import fireStationData from './FireStations.json';

export const EMERGENCY_FACILITIES = fireStationData.features.map((feature) => {
    return {
        id: feature.properties.NAME
            .toLowerCase()
            .replaceAll(' ', '-'),
        name: feature.properties.NAME,
        type: 'SCDF Fire Station',
        address: feature.properties.ADDRESS,

        // GeoJSON stores coordinates as [longitude, latitude]
        latitude: feature.geometry.coordinates[1],
        longitude: feature.geometry.coordinates[0],
    };
});