

export class AdventureEngine {
    constructor() {
        this.adventureData = null;
        this.currentAdventureId = null;
        this.state = {
            currentNodeId: null,
            inventory: [],
            flags: {},
            history: [] // For undo/backtracking potentially
        };
        this.dom = {
            container: null,
            image: null,
            text: null,
            choices: null,
            log: null,
            input: null
        };
    }

    async init(containerId) {
        this.dom.container = document.getElementById(containerId);
        if (!this.dom.container) return;

        // Create UI structure if not present
        this.setupUI();

        // Load story data
        try {
            const response = await fetch('data/story_adventures.json');
            this.adventureData = await response.json();
        } catch (error) {
            console.error('Failed to load story adventures:', error);
        }

        // Check for saved state
        this.loadState();
    }

    setupUI() {
        this.dom.container.innerHTML = `
            <div class="adventure-engine-layout">
                <div class="adventure-visuals">
                    <img id="adventureImage" src="" alt="Scene Image" class="scene-image">
                </div>
                <div class="adventure-narrative">
                    <div id="adventureText" class="story-text"></div>
                    <div id="adventureChoices" class="choice-container"></div>
                </div>
                <div class="adventure-sidebar">
                    <div id="adventureLog" class="adventure-log"></div>
                    <div class="adventure-controls">
                        <textarea id="adventureInput" placeholder="Type a note or roll dice (e.g. /roll d20)..."></textarea>
                        <button onclick="window.adventureEngine.handleInput()" class="btn-small">Send</button>
                    </div>
                </div>
            </div>
        `;

        this.dom.image = document.getElementById('adventureImage');
        this.dom.text = document.getElementById('adventureText');
        this.dom.choices = document.getElementById('adventureChoices');
        this.dom.log = document.getElementById('adventureLog');
        this.dom.input = document.getElementById('adventureInput');

        // Styles for the new engine
        const style = document.createElement('style');
        style.textContent = `
            .adventure-engine-layout {
                display: grid;
                grid-template-columns: 2fr 1fr;
                gap: 20px;
                height: 70vh;
            }
            .adventure-visuals {
                grid-column: 1 / -1;
                height: 200px;
                background: #1a1a1a;
                border-radius: 8px;
                overflow: hidden;
                display:flex;
                justify-content:center;
                align-items:center;
            }
            .scene-image {
                max-width: 100%;
                max-height: 100%;
                object-fit: contain; /* Changed to contain to show full placeholder */
            }
            .adventure-narrative {
                background: var(--bg-secondary);
                padding: 20px;
                border-radius: 8px;
                overflow-y: auto;
                border: 1px solid var(--border-color);
            }
            .story-text {
                font-size: 1.1em;
                line-height: 1.6;
                margin-bottom: 20px;
                white-space: pre-line;
            }
            .choice-container {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .choice-btn {
                text-align: left;
                padding: 12px;
                background: var(--bg-tertiary);
                border: 1px solid var(--accent-blue);
                color: var(--text-primary);
                cursor: pointer;
                border-radius: 4px;
                transition: all 0.2s;
            }
            .choice-btn:hover {
                background: var(--accent-blue);
                color: white;
            }
            .adventure-sidebar {
                display: flex;
                flex-direction: column;
                gap: 10px;
            }
            .adventure-log {
                flex-grow: 1;
                background: var(--bg-secondary);
                border: 1px solid var(--border-color);
                border-radius: 8px;
                padding: 10px;
                font-family: monospace;
                overflow-y: auto;
                font-size: 0.9em;
            }
            .adventure-controls {
                display: flex;
                gap: 5px;
            }
            #adventureInput {
                flex-grow: 1;
                resize: none;
                height: 40px;
                padding: 5px;
                border-radius: 4px;
                border: 1px solid var(--border-color);
                background: var(--bg-primary);
                color: var(--text-primary);
            }
        `;
        document.head.appendChild(style);
    }

    startAdventure(adventureId) {
        if (!this.adventureData || !this.adventureData[adventureId]) {
            console.error('Adventure not found:', adventureId);
            return;
        }

        this.currentAdventureId = adventureId;
        const adventure = this.adventureData[adventureId];

        // Reset or load state
        const savedState = this.loadState();
        if (savedState && savedState.id === adventureId) {
            this.state = savedState;
            this.log('Loaded saved game.');
        } else {
            this.state = {
                currentNodeId: adventure.startingNode,
                inventory: [],
                flags: {},
                history: [],
                id: adventureId
            };
            this.log(`Started adventure: ${adventure.title}`);
        }

        this.renderNode();
    }

    renderNode() {
        const adventure = this.adventureData[this.currentAdventureId];
        const node = adventure.nodes[this.state.currentNodeId];

        if (!node) {
            console.error('Node not found:', this.state.currentNodeId);
            return;
        }

        // Update Text
        this.dom.text.innerText = node.text;

        // Update Image
        if (node.image) {
            this.dom.image.src = node.image;
            this.dom.image.style.display = 'block';
        } else {
            this.dom.image.style.display = 'none';
        }

        // Render Choices
        this.dom.choices.innerHTML = '';
        if (node.options) {
            node.options.forEach((option, index) => {
                if (this.checkRequirements(option.req)) {
                    const btn = document.createElement('button');
                    btn.className = 'choice-btn';
                    btn.innerText = option.text;
                    btn.onclick = () => this.makeChoice(index);
                    this.dom.choices.appendChild(btn);
                }
            });
        }
    }

    checkRequirements(req) {
        if (!req) return true;
        // Implement logic to check flags/skills if needed
        return true;
    }

    makeChoice(optionIndex) {
        const adventure = this.adventureData[this.currentAdventureId];
        const node = adventure.nodes[this.state.currentNodeId];
        const option = node.options[optionIndex];

        if (!option) return;

        // Verify dice check if present
        if (option.check) {
            // For now, simple random pass/fail logic or manual override?
            // Let's just auto-roll for visualization
            const roll = Math.floor(Math.random() * 20) + 1;
            const passed = roll >= option.check.dc;
            this.log(`Rolled ${roll} vs DC ${option.check.dc} (${option.check.skill}). ${passed ? 'Success!' : 'Failure.'}`);

            // If failure, does it have a fail target? If not, assume success for MVP or block?
            // For MVP simplicity, let's just log it. Real engine would branch.
        }

        this.state.history.push(this.state.currentNodeId);
        this.state.currentNodeId = option.target;

        this.saveState();
        this.renderNode();
    }

    handleInput() {
        const input = this.dom.input.value.trim();
        if (!input) return;

        this.log(`> ${input}`);

        if (input.startsWith('/roll')) {
            // Simple dice parser
            // /roll d20, /roll 2d6+3
            // Very basic implementation
            const parts = input.split(' ');
            if (parts.length > 1) {
                const dice = parts[1]; // e.g., "d20"
                if (dice === 'd20') {
                    const result = Math.floor(Math.random() * 20) + 1;
                    this.log(`Rolled d20: ${result}`);
                } else {
                    this.log('Unknown dice. Try /roll d20');
                }
            }
        }

        this.dom.input.value = '';
    }

    log(message) {
        const entry = document.createElement('div');
        entry.textContent = message;
        this.dom.log.appendChild(entry);
        this.dom.log.scrollTop = this.dom.log.scrollHeight;
    }

    saveState() {
        localStorage.setItem('currentAdventureState', JSON.stringify(this.state));
    }

    loadState() {
        const saved = localStorage.getItem('currentAdventureState');
        return saved ? JSON.parse(saved) : null;
    }
}

// Singleton instance
window.adventureEngine = new AdventureEngine();
