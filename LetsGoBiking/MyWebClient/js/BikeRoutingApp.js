class BikeRoutingApp {
    constructor() {
        this.mapManager = null;
        this.originInput = null;
        this.destinationInput = null;
        this.init();
    }

    init() {
        // Initialiser la carte
        this.mapManager = new MapManager();

        // Récupérer les références des éléments DOM
        this.setupDOMReferences();

        // Mettre en place les écouteurs d'événements
        this.setupEventListeners();

        // Initialiser depuis le localStorage
        this.loadFromLocalStorage();
    }

    setupDOMReferences() {
        this.originGroup = document.querySelector('.input-group[data-type="origin"]');
        this.destinationGroup = document.querySelector('.input-group[data-type="destination"]');
        this.originContent = this.originGroup?.querySelector('.input-content');
        this.destinationContent = this.destinationGroup?.querySelector('.input-content');
        this.startButton = document.querySelector('.btn-start');
        this.detailsButton = document.querySelector('.btn-details');
        this.routeInfo = document.querySelector('.route-info');
    }

    setupEventListeners() {
        // Écouteurs pour les champs de saisie
        if (this.originGroup) {
            this.originGroup.addEventListener('click', () => {
                window.location.href = 'search.html?type=origin';
            });
        }

        if (this.destinationGroup) {
            this.destinationGroup.addEventListener('click', () => {
                window.location.href = 'search.html?type=destination';
            });
        }

        // Écouteur pour le bouton de démarrage
        if (this.startButton) {
            this.startButton.addEventListener('click', () => this.calculateRoute());
        }

        // Écouteur pour le bouton des détails
        if (this.detailsButton) {
            this.detailsButton.addEventListener('click', () => {
                window.location.href = 'detailedRoute.html';
            });
        }

        // Écouteur pour le bouton d'échange
        const switchBtn = document.querySelector('.switch-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.switchLocations();
            });
        }

        // Écouteurs pour les boutons de suppression
        document.querySelectorAll('.clear-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const type = e.target.closest('.input-group').dataset.type;
                this.clearLocation(type);
            });
        });
    }

    async calculateRoute() {
        const origin = JSON.parse(localStorage.getItem('originLocation'));
        const destination = JSON.parse(localStorage.getItem('destinationLocation'));

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

            if (!response.ok) {
                throw new Error('Failed to calculate route');
            }

            const routeData = await response.json();
            this.displayRouteInfo(routeData);
            this.mapManager.displayRoute(routeData);

        } catch (error) {
            console.error('Error calculating route:', error);
            alert('Error calculating route. Please try again.');
        }
    }

    displayRouteInfo(routeData) {
        if (!this.routeInfo) return;

        const duration = Math.round(routeData.estimatedDuration / 60);
        const distance = (routeData.totalDistance / 1000).toFixed(1);

        this.routeInfo.innerHTML = `
            <span class="duration">${duration} mins</span>
            <span class="distance">• ${distance}km</span>
            <span class="traffic-status">Fastest route</span>
        `;

        // Si des stations sont disponibles, afficher leurs informations
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
            this.routeInfo.appendChild(stationInfo);
        }
    }

    switchLocations() {
        const origin = localStorage.getItem('originLocation');
        const destination = localStorage.getItem('destinationLocation');

        if (origin && destination) {
            localStorage.setItem('originLocation', destination);
            localStorage.setItem('destinationLocation', origin);
            this.loadFromLocalStorage();
            this.calculateRoute();
        }
    }

    clearLocation(type) {
        localStorage.removeItem(`${type}Location`);
        this.loadFromLocalStorage();
    }

    loadFromLocalStorage() {
        const origin = JSON.parse(localStorage.getItem('originLocation'));
        const destination = JSON.parse(localStorage.getItem('destinationLocation'));

        if (this.originContent) {
            if (origin?.label) {
                this.originContent.textContent = origin.label;
                this.originContent.classList.add('selected-address');
            } else {
                this.originContent.innerHTML = 'Your <span class="text-blue">location</span>';
                this.originContent.classList.remove('selected-address');
            }
        }

        if (this.destinationContent) {
            if (destination?.label) {
                this.destinationContent.textContent = destination.label;
                this.destinationContent.classList.add('selected-address');
            } else {
                this.destinationContent.innerHTML = 'Destination <span class="text-blue">address</span>';
                this.destinationContent.classList.remove('selected-address');
            }
        }

        if (origin && destination) {
            this.calculateRoute();
        }
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new BikeRoutingApp();
});