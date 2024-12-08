// js/detailedRoute.js
import { RouteService } from './routeService.js';

class DetailedRouteApp {
    constructor() {
        this.init();
        this.setupEventListeners();
    }

    async init() {
        await this.loadAddresses();
        await this.loadRouteData();
    }

    setupEventListeners() {
        // Gérer le bouton d'échange d'adresses
        const switchBtn = document.querySelector('.switch-btn');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => this.switchAddresses());
        }

        // Gérer le bouton menu
        const menuBtn = document.querySelector('.menu-btn');
        if (menuBtn) {
            menuBtn.addEventListener('click', () => this.showMenu());
        }
    }

    async loadAddresses() {
        const origin = JSON.parse(localStorage.getItem('originLocation'));
        const destination = JSON.parse(localStorage.getItem('destinationLocation'));

        if (origin?.label) {
            document.getElementById('origin-display').textContent = origin.label;
        }
        if (destination?.label) {
            document.getElementById('destination-display').textContent = destination.label;
        }

        this.origin = origin;
        this.destination = destination;
    }

    async loadRouteData() {
        if (!this.origin || !this.destination) {
            this.showError('Veuillez sélectionner une origine et une destination');
            return;
        }

        try {
            this.showLoading(true);
            const startCoords = `${this.origin.longitude},${this.origin.latitude}`;
            const endCoords = `${this.destination.longitude},${this.destination.latitude}`;
            const routeData = await RouteService.getRoute(startCoords, endCoords);
            this.displayRoute(routeData);
        } catch (error) {
            this.showError('Erreur lors du chargement de l\'itinéraire');
            console.error(error);
        } finally {
            this.showLoading(false);
        }
    }

    displayRoute(routeData) {
        const stepsContainer = document.getElementById('route-steps');
        stepsContainer.innerHTML = ''; // Nettoyer le conteneur

        // Calculer l'heure de départ
        const startTime = new Date();

        routeData.steps.forEach((step, index) => {
            const stepElement = this.createStepElement(step, startTime);
            stepsContainer.appendChild(stepElement);

            // Mettre à jour l'heure pour l'étape suivante
            startTime.setSeconds(startTime.getSeconds() + step.duration);
        });

        this.showInstructions(routeData);
    }

    createStepElement(step, time) {
        const div = document.createElement('div');
        div.className = 'step-item';

        div.innerHTML = `
            <span class="step-time">${time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
            <span class="step-name">
                ${step.instruction}
                <small>${(step.distance / 1000).toFixed(2)} km</small>
            </span>
            <div class="step-icon">
                <span class="material-icons">${step.type}</span>
            </div>
        `;

        return div;
    }

    showInstructions(routeData) {
        let steps = "";
        routeData.steps.forEach(step => {
            steps += "- " + step.instruction + "\n";
        });

        const instructionsElement = document.getElementById("instructions");
        instructionsElement.textContent = steps;
        instructionsElement.setAttribute('style', 'white-space: pre-line;');
    }

    switchAddresses() {
        const originElem = document.getElementById('origin-display');
        const destElem = document.getElementById('destination-display');

        // Échanger les textes affichés
        const tempText = originElem.textContent;
        originElem.textContent = destElem.textContent;
        destElem.textContent = tempText;

        // Échanger les données stockées
        const tempLocation = this.origin;
        this.origin = this.destination;
        this.destination = tempLocation;

        // Mettre à jour le localStorage
        localStorage.setItem('originLocation', JSON.stringify(this.origin));
        localStorage.setItem('destinationLocation', JSON.stringify(this.destination));

        // Recharger l'itinéraire
        this.loadRouteData();
    }

    showMenu() {
        // Implémenter le menu contextuel ici
        console.log('Menu clicked');
    }

    showLoading(show) {
        // Tu peux ajouter un indicateur de chargement ici
        const stepsContainer = document.getElementById('route-steps');
        if (show) {
            stepsContainer.innerHTML = '<div class="loading">Chargement de l\'itinéraire...</div>';
        }
    }

    showError(message) {
        const stepsContainer = document.getElementById('route-steps');
        stepsContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
}

// Initialiser l'application quand le DOM est chargé
document.addEventListener('DOMContentLoaded', () => {
    new DetailedRouteApp();
});