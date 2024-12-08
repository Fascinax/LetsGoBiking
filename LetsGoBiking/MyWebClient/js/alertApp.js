import { AlertItem } from '../components/AlertItem.js';

class AlertApp {
    constructor() {
        this.alerts = [
            {
                title: "Ralentissement",
                description: "Trafic dense sur l'A6b direction Paris"
            },
            {
                title: "Travaux",
                description: "Avenue des Champs-Élysées fermée jusqu'à 18h"
            },
            {
                title: "Accident",
                description: "Collision sur le périphérique extérieur"
            },
            {
                title: "Transport",
                description: "Ligne 1 du métro: trafic interrompu"
            },
            {
                title: "Manifestation",
                description: "Rassemblement place de la République"
            },
            {
                title: "Météo",
                description: "Vigilance orange: orages violents"
            },
            {
                title: "Circulation",
                description: "Boulevard Haussmann: voie de bus uniquement"
            },
            {
                title: "Panne",
                description: "Station de métro Châtelet: escalators en panne"
            },
            {
                title: "Déviation",
                description: "Rue de Rivoli: déviation mise en place"
            },
            {
                title: "Station Vélib",
                description: "Station #12045 hors service pour maintenance"
            },
            {
                title: "Bus",
                description: "Ligne 38: perturbations importantes"
            },
            {
                title: "RER",
                description: "RER B: trafic ralenti suite incident technique"
            },
            {
                title: "Zone Piétonne",
                description: "Quartier Marais: zone piétonne temporaire"
            },
            {
                title: "Stationnement",
                description: "Parking Opéra: complet jusqu'à 18h"
            },
            {
                title: "Pollution",
                description: "Pic de pollution: vitesse limitée à 70km/h"
            }
        ];
        this.init();
    }

    init() {
        this.renderSearchBar();
        this.renderAlerts();
        this.setupEventListeners();
        this.setupScroll();
    }

    renderSearchBar() {
        const container = document.querySelector('.phone-container');
        if (!container) {
            console.error('Container not found');
            return;
        }

        const searchBar = document.createElement('div');
        searchBar.className = 'search-bar';
        searchBar.innerHTML = `
            <div class="location-container">
                <span class="material-icons location-icon">place</span>
                <span class="location-text">Your location</span>
            </div>
            <button class="icon-button clear-button">
                <span class="material-icons">close</span>
            </button>
            <button class="icon-button menu-button">
                <span class="material-icons">more_vert</span>
            </button>
        `;

        container.insertBefore(searchBar, container.firstChild);
    }

    renderAlerts() {
        const container = document.getElementById('alerts-container');
        if (!container) {
            console.error('Alerts container not found');
            return;
        }

        container.innerHTML = '';

        this.alerts.forEach(alert => {
            const alertElement = document.createElement('alert-item');
            alertElement.data = alert;
            container.appendChild(alertElement);
        });
    }

    setupScroll() {
        const container = document.getElementById('alerts-container');
        if (!container) return;

        // Ajout de l'effet de défilement doux
        container.style.scrollBehavior = 'smooth';

        // Gestion du défilement par toucher (pour mobile)
        let touchstart = 0;
        let touchmove = 0;

        container.addEventListener('touchstart', (e) => {
            touchstart = e.changedTouches[0].screenY;
        }, { passive: true });

        container.addEventListener('touchmove', (e) => {
            touchmove = e.changedTouches[0].screenY;
            const distance = touchstart - touchmove;
            container.scrollTop += distance / 2;
            touchstart = touchmove;
        }, { passive: true });

        // Ajout d'un indicateur de défilement
        const scrollIndicator = document.createElement('div');
        scrollIndicator.className = 'scroll-indicator';
        container.parentElement.appendChild(scrollIndicator);

        container.addEventListener('scroll', () => {
            const maxScroll = container.scrollHeight - container.clientHeight;
            const scrollPercentage = (container.scrollTop / maxScroll) * 100;
            scrollIndicator.style.width = `${scrollPercentage}%`;
        });
    }

    setupEventListeners() {
        const clearButton = document.querySelector('.clear-button');
        const menuButton = document.querySelector('.menu-button');

        if (clearButton) {
            clearButton.addEventListener('click', () => {
                console.log('Clear button clicked');
            });
        }

        if (menuButton) {
            menuButton.addEventListener('click', () => {
                console.log('Menu button clicked');
            });
        }

        // Ajout d'événements pour les alertes
        document.querySelectorAll('alert-item').forEach(alert => {
            alert.addEventListener('click', () => {
                alert.classList.toggle('expanded');
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AlertApp();
});