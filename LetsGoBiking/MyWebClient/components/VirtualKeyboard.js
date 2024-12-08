class VirtualKeyboard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.shadowRoot.innerHTML = `
            <link rel="stylesheet" href="styles/keyboard.css">
            <div class="keyboard">
                <div class="keyboard-row">
                    ${this.createKeys('qwertyuiop')}
                </div>
                <div class="keyboard-row">
                    <div style="width: 5px"></div> <!-- Petit décalage pour la deuxième rangée -->
                    ${this.createKeys('asdfghjkl')}
                </div>
                <div class="keyboard-row">
                    ${this.createKeys('zxcvbnm')}
                </div>
                <div class="keyboard-row">
                    <button class="key special-key">ABC</button>
                    <button class="key space-key">space</button>
                    <button class="key special-key">return</button>
                </div>
            </div>
        `;
        this.setupEventListeners();
    }

    createKeys(letters) {
        return letters.split('').map(letter =>
            `<button class="key">${letter}</button>`
        ).join('');
    }

    setupEventListeners() {
        this.shadowRoot.querySelectorAll('.key').forEach(key => {
            key.addEventListener('click', () => {
                const value = key.textContent;
                const input = document.querySelector('.search-input');
                if (!input) return;

                switch(value) {
                    case 'space':
                        input.value += ' ';
                        break;
                    case 'return':
                        // Gérer le retour
                        break;
                    case 'ABC':
                        // Gérer le changement de clavier
                        break;
                    default:
                        input.value += value;
                }
                input.dispatchEvent(new Event('input'));
            });
        });
    }
}

customElements.define('virtual-keyboard', VirtualKeyboard);