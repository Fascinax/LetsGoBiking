class MapManager {
    constructor() {
        this.map = null;
        this.markers = [];
        this.routeLine = null;
        this.init();
    }

    init() {
        console.log('Initializing map...');
        // Attendre que l'élément DOM soit complètement chargé
        if (!document.getElementById('map')) {
            console.error('Map container not found!');
            return;
        }

        try {
            // Initialiser la carte Leaflet
            this.map = L.map('map', {
                zoomControl: false,
                attributionControl: true
            }).setView([46.603354, 1.888334], 6); // Centre sur la France

            // Ajouter la couche de tuiles
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19
            }).addTo(this.map);

            // Forcer une mise à jour de la taille de la carte
            setTimeout(() => {
                this.map.invalidateSize();
            }, 0);

            console.log('Map initialized successfully');
        } catch (error) {
            console.error('Error initializing map:', error);
        }
    }

    updateFromStorage() {
        const origin = JSON.parse(localStorage.getItem('originLocation'));
        const destination = JSON.parse(localStorage.getItem('destinationLocation'));

        this.clearMap();

        if (origin?.coordinates) {
            const marker = L.marker([origin.coordinates.lat, origin.coordinates.lng])
                .bindPopup('Origin: ' + origin.label)
                .addTo(this.map);
            this.markers.push(marker);
        }

        if (destination?.coordinates) {
            const marker = L.marker([destination.coordinates.lat, destination.coordinates.lng])
                .bindPopup('Destination: ' + destination.label)
                .addTo(this.map);
            this.markers.push(marker);
        }

        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds().pad(0.1));
        }
    }

    clearMap() {
        // Nettoyer les marqueurs existants
        this.markers.forEach(marker => marker.remove());
        this.markers = [];

        // Nettoyer la ligne de route existante
        if (this.routeLine) {
            this.routeLine.remove();
            this.routeLine = null;
        }
    }

    displayRoute(routeData) {
        this.clearMap();

        // Ajouter des marqueurs pour les stations
        if (routeData.startStation) {
            const startMarker = L.marker([routeData.startStation.position.latitude, routeData.startStation.position.longitude])
                .bindPopup(`Start Station: ${routeData.startStation.name}<br>Available Bikes: ${routeData.startStation.availableBikes}`)
                .addTo(this.map);
            this.markers.push(startMarker);
        }

        if (routeData.endStation) {
            const endMarker = L.marker([routeData.endStation.position.latitude, routeData.endStation.position.longitude])
                .bindPopup(`End Station: ${routeData.endStation.name}<br>Available Spots: ${routeData.endStation.availableBikeStands}`)
                .addTo(this.map);
            this.markers.push(endMarker);
        }

        // Dessiner les segments de route
        const allPoints = [];

        routeData.segments.forEach((segment, index) => {
            const points = segment.steps.map(step => [step.location.latitude, step.location.longitude]);
            allPoints.push(...points);

            // Créer une ligne pour chaque segment avec une couleur différente selon le type
            const color = segment.type === 'FOOT' ? '#3388ff' : '#32CD32';
            const line = L.polyline(points, {
                color: color,
                weight: 4,
                opacity: 0.8
            }).addTo(this.map);

            // Ajouter une popup avec les informations du segment
            const distance = (segment.distance / 1000).toFixed(1);
            const duration = Math.round(segment.duration / 60);
            line.bindPopup(`${segment.type}: ${distance}km - ${duration}min`);
        });

        // Ajuster la vue pour voir tout l'itinéraire
        if (allPoints.length > 0) {
            const bounds = L.latLngBounds(allPoints);
            this.map.fitBounds(bounds.pad(0.1));
        }
    }
}