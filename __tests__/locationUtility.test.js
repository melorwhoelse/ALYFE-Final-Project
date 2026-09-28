import { calculateDistanceKm, findNearestFacilities } from '../utility/locationUtility';

// Verify distance calculation using identical coordinates where result should be approximately zero
describe('calculateDistanceKm', () => {
    test('returns 0 when both locations are the same', () => {
        const distance = calculateDistanceKm(
            1.2920721554408667,
            103.84881635673574,
            1.2920721554408667,
            103.84881635673574
        );

        expect(distance).toBeCloseTo(0);
    });
});

// Verify facilities are sorted in order based on user's current location
describe('findNearestFacilities', () => {
    test('sorts facilities from nearest to furthest', () => {
        const facilities = [
            {
                name: 'Far Facility',
                latitude: 1.40,
                longitude: 103.90,
            },
            {
                name: 'Near Facility',
                latitude: 1.30,
                longitude: 103.80,
            }
        ];

        const result = findNearestFacilities(
            1.30,
            103.80,
            facilities
        );

        expect(result[0].name).toBe('Near Facility');
        expect(result[1].name).toBe('Far Facility');

    })
})
