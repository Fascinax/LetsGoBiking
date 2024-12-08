// routeService.js
export class RouteService {
    static API_KEY = '5b3ce3597851110001cf6248938feda7c0de4fcbb1f22e60c70fecf4'; // Il faudra obtenir une clé API

    static async getRoute(start, end) {
        try {
            const response = await fetch(`https://api.openrouteservice.org/v2/directions/cycling-regular?api_key=${this.API_KEY}&start=${start.longitude},${start.latitude}&end=${end.longitude},${end.latitude}`);

            if (!response.ok) {
                throw new Error('Erreur lors de la récupération de l\'itinéraire');
            }

            const data = await response.json();
            return this.formatRouteData(data);
        } catch (error) {
            console.error('Erreur:', error);
            return null;
        }
    }

    static formatRouteData(data) {
        if (!data.features || !data.features[0] || !data.features[0].properties) {
            return null;
        }

        const route = data.features[0];
        const steps = route.properties.segments[0].steps.map(step => ({
            instruction: step.instruction,
            distance: step.distance,
            duration: step.duration,
            type: this.getStepType(step.type),
            coordinates: step.coordinates
        }));

        return {
            duration: route.properties.segments[0].duration,
            distance: route.properties.segments[0].distance,
            steps: steps
        };
    }

    static getStepType(type) {
        // Convertir les types d'étapes de l'API en icônes Material
        const typeMap = {
            'turn-left': 'turn_left',
            'turn-right': 'turn_right',
            'continue': 'straight',
            // Ajouter d'autres mappings selon les besoins
        };
        return typeMap[type] || 'directions_bike';
    }
}