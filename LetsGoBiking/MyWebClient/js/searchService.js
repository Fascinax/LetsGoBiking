export class SearchService {
    static async search(query) {
        if (!query || query.length < 2) return [];

        try {
            const url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(query)}&limit=10`;
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return data.features.map(feature => ({
                label: feature.properties.label,
                context: feature.properties.context,
                coordinates: {
                    lat: feature.geometry.coordinates[1],
                    lng: feature.geometry.coordinates[0]
                }
            }));
        } catch (error) {
            console.error('SearchService error:', error);
            return [];
        }
    }
}