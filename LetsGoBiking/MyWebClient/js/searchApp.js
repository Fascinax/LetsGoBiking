import { SearchService } from './searchService.js';

class SearchApp {
    constructor() {
        this.searchTimeout = null;
        this.searchType = new URLSearchParams(window.location.search).get('type') || 'destination';
        this.init();
    }

    init() {
        this.updateFixedLocation();
        this.setupEventListeners();
        this.setupKeyboard();
    }

    setupKeyboard() {
        const keyboard = document.createElement('virtual-keyboard');
        document.getElementById('keyboard')?.appendChild(keyboard);
    }

    updateFixedLocation() {
        const otherType = this.searchType === 'origin' ? 'destination' : 'origin';
        const otherLocation = JSON.parse(localStorage.getItem(`${otherType}Location`) || '{}');

        const fixedLocationText = document.getElementById('otherLocation');
        if (fixedLocationText) {
            fixedLocationText.textContent = otherLocation.label ||
                (otherType === 'destination' ? 'Enter destination' : 'Your location');
        }

        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.placeholder = this.searchType === 'origin' ?
                'Enter departure location' : 'Enter destination';
        }
    }

    setupEventListeners() {
        // Back button
        document.querySelector('.back-button')?.addEventListener('click', () => {
            history.back();
        });

        // Clear button
        document.querySelector('.clear-button')?.addEventListener('click', () => {
            const input = document.querySelector('.search-input');
            if (input) {
                input.value = '';
                input.focus();
                this.clearResults();
            }
        });

        // Search input
        document.querySelector('.search-input')?.addEventListener('input', (e) => {
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
            this.searchTimeout = setTimeout(() => {
                this.performSearch(e.target.value);
            }, 300);
        });

        // Result selection
        document.getElementById('search-results')?.addEventListener('locationSelected', (e) => {
            // Sauvegarder la sélection selon le type
            localStorage.setItem(`${this.searchType}Location`, JSON.stringify(e.detail));
            history.back();
        });
    }

    async performSearch(query) {
        if (!query || query.length < 2) {
            this.clearResults();
            return;
        }

        try {
            const results = await SearchService.search(query);
            this.updateResults(results);
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    updateResults(results) {
        const container = document.getElementById('search-results');
        if (!container) return;

        container.innerHTML = '';
        results.forEach(result => {
            const searchResult = document.createElement('search-result');
            searchResult.setAttribute('label', result.label);
            searchResult.setAttribute('context', result.context || '');

            searchResult.addEventListener('click', () => {
                this.handleLocationSelection(result);
            });

            container.appendChild(searchResult);
        });
    }

    clearResults() {
        const container = document.getElementById('search-results');
        if (container) {
            container.innerHTML = '';
        }
    }

    handleLocationSelection(result) {
        // Sauvegarder la sélection avec toutes les informations nécessaires
        const locationData = {
            label: result.label,
            context: result.context,
            coordinates: result.coordinates
        };

        localStorage.setItem(`${this.searchType}Location`, JSON.stringify(locationData));

        // Retourner à la page précédente
        history.back();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SearchApp();
});