const EARTH_RADIUS_KM = 6371;

function degreesToRadians(degrees) {
    return degrees * (Math.PI / 180);
}

//Haversine Distance calculation adapted from: https://www.movable-type.co.uk/scripts/latlong.html
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    const latDiff = degreesToRadians(lat2 - lat1);
    const lonDiff = degreesToRadians(lon2 - lon1);

    const lat1Radians = degreesToRadians(lat1);
    const lat2Radians = degreesToRadians(lat2);

    const a =
        Math.sin(latDiff / 2) * Math.sin(latDiff / 2) +
        Math.cos(lat1Radians) *
        Math.cos(lat2Radians) *
        Math.sin(lonDiff / 2) *
        Math.sin(lonDiff / 2);

    const c =
        2 * Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );

    return EARTH_RADIUS_KM * c;
}

// Calculate each facility's straight-line distance from the user, then sort the facilities from nearest to furthest.
export function findNearestFacilities(userLatitude, userLongitude, facilities) {
    const facilitiesWithDistance = facilities.map((facility) => {
        const distance = calculateDistanceKm(userLatitude, userLongitude, facility.latitude, facility.longitude);

        return {
            ...facility,
            distance: distance
        };
    });

    facilitiesWithDistance.sort((a, b) => {
        return a.distance - b.distance;
    });

    return facilitiesWithDistance;
}