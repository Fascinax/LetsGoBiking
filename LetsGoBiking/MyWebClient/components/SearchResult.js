class SearchResult extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        const label = this.getAttribute('label') || '';
        const context = this.getAttribute('context') || '';

        this.shadowRoot.innerHTML = `
            <style>
                .result-item {
                    display: flex;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid #f0f0f0;
                    cursor: pointer;
                }
                .result-item:hover {
                    background: #f8f9fa;
                }
                .result-icon {
                    width: 20px;
                    height: 20px;
                    margin-right: 12px;
                    color: #666;
                }
                .result-content {
                    flex: 1;
                }
                .result-label {
                    font-size: 15px;
                    color: #202124;
                }
                .result-context {
                    font-size: 13px;
                    color: #5f6368;
                    margin-top: 2px;
                }
            </style>
            <div class="result-item">
                <div class="result-icon">📍</div>
                <div class="result-content">
                    <div class="result-label">${label}</div>
                    <div class="result-context">${context}</div>
                </div>
            </div>
        `;

        this.shadowRoot.querySelector('.result-item').addEventListener('click', () => {
            // Envoyer l'événement de sélection
            this.dispatchEvent(new CustomEvent('locationSelected', {
                bubbles: true,
                composed: true,
                detail: {
                    label,
                    context
                }
            }));
        });
    }
}

customElements.define('search-result', SearchResult);