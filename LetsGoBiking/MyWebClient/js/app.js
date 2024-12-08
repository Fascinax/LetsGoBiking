class BikeRoutingApp {
    constructor() {
        this.mapManager = null;
        this.init();
    }

    init() {
        // Initialiser la carte
        this.mapManager = new MapManager();

        // Initialiser les références DOM
        this.setupDOMReferences();

        // Mettre en place les écouteurs d'événements
        this.setupEventListeners();

        // Initialiser les données depuis le localStorage
        this.updateDisplayedLocations();

        // Écouter les changements de stockage pour mise à jour en temps réel
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.includes('Location')) {
                this.updateDisplayedLocations();
            }
        });
    }

    setupDOMReferences() {
        this.elements = {
            originGroup: document.querySelector('.input-group[data-type="origin"]'),
            destinationGroup: document.querySelector('.input-group[data-type="destination"]'),
            startButton: document.querySelector('.btn-start'),
            detailsButton: document.querySelector('.btn-details'),
            routeInfo: document.querySelector('.route-info'),
            switchButton: document.querySelector('.switch-btn'),
            clearButtons: document.querySelectorAll('.clear-btn')
        };

        // Obtenir les références des contenus d'input
        if (this.elements.originGroup) {
            this.elements.originContent = this.elements.originGroup.querySelector('.input-content');
        }
        if (this.elements.destinationGroup) {
            this.elements.destinationContent = this.elements.destinationGroup.querySelector('.input-content');
        }
    }

    setupEventListeners() {
        // Événements pour les champs de recherche
        document.querySelectorAll('.input-group').forEach(input => {
            input.addEventListener('click', () => {
                const searchType = input.dataset.type;
                window.location.href = `search.html?type=${searchType}`;
            });
        });

        // Événement du bouton de démarrage
        this.elements.startButton?.addEventListener('click', () => this.calculateRoute());

        // Événement du bouton des détails
        this.elements.detailsButton?.addEventListener('click', () => {
            window.location.href = 'detailedRoute.html';
        });

        // Événement du bouton d'échange
        this.elements.switchButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.switchLocations();
        });

        // Événements des boutons de suppression
        this.elements.clearButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = e.target.closest('.input-group').dataset.type;
                this.clearLocation(type);
            });
        });
    }

    async calculateRoute() {
        const origin = this.getLocationFromStorage('origin');
        const destination = this.getLocationFromStorage('destination');

        if (!origin || !destination) {
            alert('Please select both origin and destination locations');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/routing/route', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    origin: {
                        latitude: origin.coordinates.lat,
                        longitude: origin.coordinates.lng
                    },
                    destination: {
                        latitude: destination.coordinates.lat,
                        longitude: destination.coordinates.lng
                    }
                })
            });

            if (!response.ok) throw new Error('Failed to calculate route');

            const routeData = await response.json();
            this.displayRouteInfo(routeData);
            this.mapManager.displayRoute(routeData);

        } catch (error) {
            console.error('Error calculating route:', error);
            alert('Error calculating route. Please try again.');
        }
    }

    displayRouteInfo(routeData) {
        if (!this.elements.routeInfo) return;

        const duration = Math.round(routeData.estimatedDuration / 60);
        const distance = (routeData.totalDistance / 1000).toFixed(1);

        this.elements.routeInfo.innerHTML = `
            <span class="duration">${duration} mins</span>
            <span class="distance">• ${distance}km</span>
            <span class="traffic-status">Fastest route</span>
        `;

        if (routeData.startStation && routeData.endStation) {
            const stationInfo = document.createElement('div');
            stationInfo.className = 'station-info';
            stationInfo.innerHTML = `
                <div class="start-station">
                    <strong>Start Station:</strong> ${routeData.startStation.name}
                    <br>Available bikes: ${routeData.startStation.availableBikes}
                </div>
                <div class="end-station">
                    <strong>End Station:</strong> ${routeData.endStation.name}
                    <br>Available spots: ${routeData.endStation.availableBikeStands}
                </div>
            `;
            this.elements.routeInfo.appendChild(stationInfo);
        }
    }

    updateDisplayedLocations() {
        const origin = this.getLocationFromStorage('origin');
        const destination = this.getLocationFromStorage('destination');

        this.updateLocationDisplay(this.elements.originContent, origin, 'Your <span class="text-blue">location</span>');
        this.updateLocationDisplay(this.elements.destinationContent, destination, 'Destination <span class="text-blue">address</span>');

        if (origin && destination) {
            this.calculateRoute();
        }
    }

    updateLocationDisplay(element, location, defaultText) {
        if (!element) return;

        if (location?.label) {
            element.textContent = location.label;
            element.classList.add('selected-address');
        } else {
            element.innerHTML = defaultText;
            element.classList.remove('selected-address');
        }
    }

    switchLocations() {
        const origin = this.getLocationFromStorage('origin');
        const destination = this.getLocationFromStorage('destination');

        if (origin && destination) {
            this.setLocationInStorage('origin', destination);
            this.setLocationInStorage('destination', origin);
            this.updateDisplayedLocations();
        }
    }

    clearLocation(type) {
        localStorage.removeItem(`${type}Location`);
        this.updateDisplayedLocations();
    }

    getLocationFromStorage(type) {
        const data = localStorage.getItem(`${type}Location`);
        return data ? JSON.parse(data) : null;
    }

    setLocationInStorage(type, location) {
        localStorage.setItem(`${type}Location`, JSON.stringify(location));
    }
}

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BikeRoutingApp();
});