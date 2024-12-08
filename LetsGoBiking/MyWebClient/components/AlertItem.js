export class AlertItem extends HTMLElement {
    constructor() {
        super();
    }

    set data(alertData) {
        this.innerHTML = `
            <div class="alert-item">
                <div class="alert-icon">
                    <span class="material-icons">error_outline</span>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alertData.title}</div>
                    <div class="alert-description">${alertData.description}</div>
                </div>
            </div>
        `;
    }
}

customElements.define('alert-item', AlertItem);