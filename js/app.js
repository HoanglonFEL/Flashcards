document.addEventListener('DOMContentLoaded', () => {
    const showDeckLink = document.getElementById('show-deck-link');
    const createDeckLink = document.getElementById('create-deck-link');
    const dropdownContent = document.querySelector('.dropdown-content');
    const dropbtn = document.querySelector('.dropbtn');

    // Toggle dropdown menu visibility
    dropbtn.addEventListener('click', () => {
        dropdownContent.classList.toggle('show');
    });

    // Event listeners for navigation links
    showDeckLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.route('?page=show-decks');
        window.history.pushState({}, '', '?page=show-decks');
        dropdownContent.classList.remove('show');
    });

    createDeckLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.route('?page=create-deck');
        window.history.pushState({}, '', '?page=create-deck');
        dropdownContent.classList.remove('show');
    });

    // Class for creating a new deck
    class DeckMaker {
        constructor() {
            this.numberOfCards = 0;
            this.errors = [];

            this.generateDeckForm();
            this.addCard();
        }

        generateDeckForm() {
            const content = document.querySelector("#content");
            content.innerHTML = `
                <form class="deck-create-form">
                    <h2>Create a new deck</h2>
                    <div class="deck-name-div">
                        <label for="deck-name">Deck name</label>
                        <input id="deck-name" type="text" name="deck-name" placeholder="Name for your new deck" maxlength="20">
                    </div>
                    <div class="deck-create-cards">
                        <ul>
                        </ul>
                        <button id="add-card" type="button">Add card</button>
                    </div>
                    <div class="error-messages"></div>
                    <button id="deck-submit" type="button">Create deck</button>
                </form>
            `;

            const addCard = document.querySelector("#add-card");
            addCard.addEventListener('click', () => {
                this.addCard();
            });

            const submitDeck = document.querySelector("#deck-submit");
            submitDeck.addEventListener('click', () => {
                this.submitDeck();
            });
        }

        addCard() {
            let cards = document.querySelector(".deck-create-cards ul");
            let card = document.createElement("li");
            card.innerHTML = `
                <div class="card">
                    <label>Front
                        <input class="card-front" type="text" name="card-front" placeholder="Front side of the card" maxlength="40">
                    </label>
                    <label>Back
                        <input class="card-back" type="text" name="card-back" placeholder="Back side of the card" maxlength="40">
                    </label>
                    <button class="remove-card" type="button"><img src="icons/trashcan.svg" alt="Remove card"></button>
                </div>
            `;

            card.classList.add("deck-create-cards");

            const removeCard = card.querySelector(".remove-card");

            // Adds event listener to the remove card button
            removeCard.addEventListener('click', () => {
                card.remove();
                this.numberOfCards--;
                document.querySelector("#add-card").disabled = false;
            });

            cards.appendChild(card);

            const main = document.querySelector('main');
            main.scrollTo(0, main.scrollHeight);
            this.numberOfCards++;

            if (this.numberOfCards >= 99) {
                document.querySelector("#add-card").disabled = true;
            }
        }

        submitDeck() {
            this.errors = [];
            const deckName = document.querySelector("#deck-name").value.trim();
            if (deckName === "" || deckName === undefined) {
                this.errors.push("Fill in the name of the deck");
                this.errorMessage();
                return;
            }
            const cards = document.querySelectorAll(".card");
            let cardArray = [];

            for (const card of cards) {
                const front = card.querySelector(".card-front").value.trim();
                const back = card.querySelector(".card-back").value.trim();
                if (front === "" || back === "") {
                    this.errors.push("All fields have to be filled");
                    this.errorMessage();
                    return;
                }
                cardArray.push({ front: front, back: back });
            }

            if (cardArray.length === 0) {
                this.errors.push("There must be at least 1 card in a deck");
                this.errorMessage();
                return;
            }

            // Save deck to localStorage
            let decks = JSON.parse(localStorage.getItem('decks')) || [];
            decks.push({ name: deckName, cards: cardArray });
            localStorage.setItem('decks', JSON.stringify(decks));
            router.route('?page=show-decks');
            window.history.pushState({}, '', '?page=show-decks');
        }

        errorMessage() {
            let errorText = document.querySelector(".error-messages");
            errorText.innerHTML = '';

            this.errors.forEach(e => {
                let p = document.createElement('p');
                p.textContent = e;
                errorText.appendChild(p);
            });
        }
    }

    // Class for editing an existing deck
    class DeckEditor {
        constructor(deckName) {
            this.numberOfCards = 0;
            this.errors = [];
            this.deckName = deckName;
            this.cards = [];
    
            this.loadDeck();
            this.generateDeckForm();
            this.attachRemoveCardListeners();
        }
    
        loadDeck() {
            let decks = JSON.parse(localStorage.getItem('decks')) || [];
            const deck = decks.find(d => d.name === this.deckName);
            if (deck) {
                this.deckName = deck.name;
                this.cards = deck.cards;
            }
        }
    
        generateDeckForm() {
            const content = document.querySelector("#content");
            content.innerHTML = `
                <form class="deck-create-form">
                    <h2>Edit deck</h2>
                    <div class="deck-name-div">
                        <label for="deck-name">Deck name</label>
                        <input id="deck-name" type="text" name="deck-name" placeholder="Name for your new deck" maxlength="20" value="${this.deckName}">
                    </div>
                    <div class="deck-create-cards">
                        <ul>
                            ${this.cards.map(card => `
                                <li>
                                    <div class="card">
                                        <label>Front
                                            <input class="card-front" type="text" name="card-front" placeholder="Front side of the card" maxlength="40" value="${card.front}">
                                        </label>
                                        <label>Back
                                            <input class="card-back" type="text" name="card-back" placeholder="Back side of the card" maxlength="40" value="${card.back}">
                                        </label>
                                        <button class="remove-card" type="button"><img src="icons/trashcan.svg" alt="Remove card"></button>
                                    </div>
                                </li>
                            `).join('')}
                        </ul>
                        <button id="add-card" type="button">Add card</button>
                    </div>
                    <div class="error-messages"></div>
                    <div class="form-buttons">
                        <button id="deck-submit" type="button">Save changes</button>
                        <button id="deck-cancel" type="button">Cancel</button>
                    </div>
                </form>
            `;
    
            const addCard = document.querySelector("#add-card");
            addCard.addEventListener('click', () => {
                this.addCard();
            });
    
            const submitDeck = document.querySelector("#deck-submit");
            submitDeck.addEventListener('click', () => {
                this.submitDeck();
            });
    
            const cancelDeck = document.querySelector("#deck-cancel");
            cancelDeck.addEventListener('click', () => {
                router.route('?page=show-decks');
                window.history.pushState({}, '', '?page=show-decks');
            });
        }
    
        attachRemoveCardListeners() {
            const removeCardButtons = document.querySelectorAll(".remove-card");
            removeCardButtons.forEach(button => {
                button.addEventListener('click', () => {
                    button.closest('li').remove();
                    this.numberOfCards--;
                    document.querySelector("#add-card").disabled = false;
                });
            });
        }
    
        addCard() {
            let cards = document.querySelector(".deck-create-cards ul");
            let card = document.createElement("li");
            card.innerHTML = `
                <div class="card">
                    <label>Front
                        <input class="card-front" type="text" name="card-front" placeholder="Front side of the card" maxlength="40">
                    </label>
                    <label>Back
                        <input class="card-back" type="text" name="card-back" placeholder="Back side of the card" maxlength="40">
                    </label>
                    <button class="remove-card" type="button"><img src="icons/trashcan.svg" alt="Remove card"></button>
                </div>
            `;
    
            card.classList.add("deck-create-cards");
    
            const removeCard = card.querySelector(".remove-card");
            removeCard.addEventListener('click', () => {
                card.remove();
                this.numberOfCards--;
                document.querySelector("#add-card").disabled = false;
            });
    
            cards.appendChild(card);
    
            const main = document.querySelector('main');
            main.scrollTo(0, main.scrollHeight);
            this.numberOfCards++;
    
            if (this.numberOfCards >= 99) {
                document.querySelector("#add-card").disabled = true;
            }
        }
    
        submitDeck() {
            this.errors = [];
            const deckName = document.querySelector("#deck-name").value.trim();
            if (deckName === "" || deckName === undefined) {
                this.errors.push("Fill in the name of the deck");
                this.errorMessage();
                return;
            }
            const cards = document.querySelectorAll(".card");
            let cardArray = [];
    
            for (const card of cards) {
                const front = card.querySelector(".card-front").value.trim();
                const back = card.querySelector(".card-back").value.trim();
                if (front === "" || back === "") {
                    this.errors.push("All fields have to be filled");
                    this.errorMessage();
                    return;
                }
                cardArray.push({ front: front, back: back });
            }
    
            if (cardArray.length === 0) {
                this.errors.push("There must be at least 1 card in a deck");
                this.errorMessage();
                return;
            }
    
            // Save edited deck to localStorage
            let decks = JSON.parse(localStorage.getItem('decks')) || [];
            const deckIndex = decks.findIndex(d => d.name === this.deckName);
            if (deckIndex > -1) {
                decks[deckIndex] = { name: deckName, cards: cardArray };
            } else {
                decks.push({ name: deckName, cards: cardArray });
            }
            localStorage.setItem('decks', JSON.stringify(decks));
            router.route('?page=show-decks');
            window.history.pushState({}, '', '?page=show-decks');
        }
    
        errorMessage() {
            let errorText = document.querySelector(".error-messages");
            errorText.innerHTML = '';
    
            this.errors.forEach(e => {
                let p = document.createElement('p');
                p.textContent = e;
                errorText.appendChild(p);
            });
        }
    }

    // Class for showing existing decks
    class DeckShower {
        constructor() {
            const decks = JSON.parse(localStorage.getItem('decks')) || [];

            const decksList = document.querySelector('#content');
            if (decks.length === 0) {
                decksList.innerHTML = `
                <div class="animated-arrow"></div>
                <h2>Your Decks</h2>
                <div style="text-align: center;">
                    <svg width="250" height="250" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="12" cy="12" r="10" stroke="black" stroke-width="2" fill="none"/>
                        <circle cx="9" cy="10" r="1" fill="black"/>
                        <circle cx="15" cy="10" r="1" fill="black"/>
                        <path d="M8 16 C10 14, 14 14, 16 16" stroke="black" stroke-width="2" fill="none"/>
                    </svg>
                    <p>There are no decks, create a new one in the menu</p>
                </div>
                `;
                return;
            } else {
                decksList.innerHTML = `
                <h2>Your Decks</h2>
                <ul class="deck-shower-list">
                </ul>
                `;

                const deckShowerList = document.querySelector('.deck-shower-list');
                decks.forEach(deck => {
                    const oneDeck = document.createElement("li");
                    oneDeck.innerHTML = `                   
                    <span class="deck-name">${deck.name}</span>
                    <div class="shower-button-wrapper">
                        <button class="play-button"><img src="icons/play.svg">Play</button>
                        <button class="edit-button"><img src="icons/edit.svg"> Edit</button>
                        <button class="delete-button"><img src="icons/trashcan.svg">Delete</button>
                    </div>
                    `;
                    oneDeck.classList.add("deck-shower-item");
                    deckShowerList.appendChild(oneDeck);
                });

                const deckShowerItems = deckShowerList.querySelectorAll(".deck-shower-item");
                deckShowerItems.forEach(deckShowerItem => {
                    const deckName = deckShowerItem.querySelector(".deck-name").innerText;
                    const playButton = deckShowerItem.querySelector(".play-button");
                    const editButton = deckShowerItem.querySelector(".edit-button");
                    const deleteButton = deckShowerItem.querySelector(".delete-button");

                    playButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        const href = `${window.location.origin}${window.location.pathname}?page=flashcard&deck=${encodeURIComponent(deckName)}`;
                        window.history.pushState({}, '', href);
                        router.route(href);
                    });
    
                    editButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        const href = `${window.location.origin}${window.location.pathname}?page=edit-deck&deck=${encodeURIComponent(deckName)}`;
                        window.history.pushState({}, '', href);
                        router.route(href);
                    });

                    deleteButton.addEventListener('click', (e) => {
                        e.preventDefault();
                        let decks = JSON.parse(localStorage.getItem('decks')) || [];
                        decks = decks.filter(deck => deck.name !== deckName);
                        localStorage.setItem('decks', JSON.stringify(decks));
                        
                        router.route('?page=show-decks')
                    });
                });
            }
        }
    }

    // Class for displaying and interacting with flashcards
    class FlashcardController {
        constructor(deckName) {
            this.deckName = deckName;
            this.cards = []
            this.loadDeck()
            this.shuffleDeck()
            this.currentIndex = 0;
            this.cardIndex = 0;
            this.generateCardHtml()
            this.flashcards = Array.from(document.querySelectorAll('.flash-card'));
            this.counter = document.querySelector(".card-number");
            this.addEventListeners();
            this.renderCard();
        }

        loadDeck() {
            let decks = JSON.parse(localStorage.getItem('decks')) || [];
            const deck = decks.find(d => d.name === this.deckName);
            if (deck) {
                this.cards = deck.cards;
            }
        }

        shuffleDeck() {
            this.cards.sort(() => Math.random() - 0.5);
        }

        generateCardHtml() {
            const main = document.querySelector('#flashcard-container');
            const h2 = document.querySelector('h2');
            h2.innerText = `${this.deckName} Deck`;
            main.innerHTML = `
                <div class="flash-cards-wrapper">
                    <div class="flash-cards">
                        <div class="flash-card" id="flash-card-0">
                            <div class="flash-card-inner">
                                <div class="flash-card-face flash-card-front">
                                    <p></p>
                                </div>
                                <div class="flash-card-face flash-card-back">
                                    <p></p>
                                </div>
                            </div>
                        </div>
                        <div class="flash-card" id="flash-card-1">
                            <div class="flash-card-inner">
                                <div class="flash-card-face flash-card-front">
                                    <p></p>
                                </div>
                                <div class="flash-card-face flash-card-back">
                                    <p></p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="buttons">
                        <button class="btn-card" id="back-btn"><img src='./icons/arrow-left.svg'></button>
                        <p class="card-number"></p>
                        <button class="btn-card" id="forward-btn"><img src='./icons/arrow-right.svg'></button>
                        <audio id='click-sound' src='sounds/sound.mp3'></audio>
                    </div>
                    <span>Click on the card to flip it</span>
                </div>
            `;
        }
        
        addEventListeners() {
            const forwardButton = document.querySelector("#forward-btn");
            const backButton = document.querySelector("#back-btn");
            const clickSound = document.querySelector("#click-sound");
    
            this.flashcards.forEach(flashcard => {
                flashcard.addEventListener('click', () => {
                    flashcard.classList.toggle('flash-card-flip');
                });
            });
    
            forwardButton.addEventListener('click', () => {
                this.nextCard();
                this.playSound(clickSound);
            });
    
            backButton.addEventListener('click', () => {
                this.prevCard();
                this.playSound(clickSound);
            });
        }
    
        nextCard() {
            if (this.cardIndex < this.cards.length - 1) {
                this.cardIndex++;
            } else {
                this.cardIndex = 0;
            }
            this.currentIndex = (this.currentIndex + 1) % 2;
            this.renderCard();
        }
    
        prevCard() {
            if (this.cardIndex > 0) {
                this.cardIndex--;
            } else {
                this.cardIndex = this.cards.length - 1;
            }
            this.currentIndex = (this.currentIndex + 1) % 2;
            this.renderCard();
        }
    
        renderCard() {
            const card = this.cards[this.cardIndex];
            const front = document.querySelector(`#flash-card-${this.currentIndex} .flash-card-front p`);
            const back = document.querySelector(`#flash-card-${this.currentIndex} .flash-card-back p`);
            front.textContent = card.front;
            back.textContent = card.back;
    
            this.changeFontSize(".flash-card-face p");
    
            this.counter.textContent = `${this.cardIndex + 1} / ${this.cards.length}`;
    
            this.flashcards.forEach((flashcard, i) => {
                if (i === this.currentIndex) {
                    flashcard.classList.add('active');
                } else {
                    flashcard.classList.remove('active');
                    flashcard.classList.remove('flash-card-flip');
                }
            });
        }
    
        changeFontSize(selector) {
            document.querySelectorAll(selector).forEach(element => {
                const textLength = element.textContent.length;

                element.style.fontSize = `calc(16px + ${Math.max(7 - textLength, 1)}rem)`;
                element.style.fontWeight = "lighter";
                element.style.wordBreak = 'break-word';
            });
        }
    
        playSound(sound) {
            if (!sound.paused) {
                sound.pause();
                sound.currentTime = 0;
            }
            sound.play();
        }
    }
    
    // Router class to handle navigation between different pages
    class Router {
        constructor({ pages, defaultPage }) {
            this.pages = pages;
            this.defaultPage = defaultPage;
            this.currentPage = null;
    
            // First run
            this.route(window.location.href);
    
            // Listen on URL changes from user clicking back button
            window.addEventListener('popstate', (e) => {
                this.route(window.location.href);
            });
    
            // Listen on URL changes from user clicks
            window.addEventListener('click', (e) => {
                const element = e.target;
                if (element.nodeName === 'A' && element.hasAttribute('data-route-link')) {
                    e.preventDefault();
                    const href = element.getAttribute('href');
                    window.history.pushState({}, '', href);
                    this.route(href);
                }
            });
        }
    
        route(urlString) {

            const url = new URL(urlString, window.location.origin);
            const page = url.searchParams.get('page');
    
            if (this.currentPage) {
                this.currentPage.pageHide();
            }
    
            const page404 = this.pages.find((p) => p.key === '404');
            const pageInstanceMatched = this.pages.find((p) => p.key === (page ?? this.defaultPage));
            const currentPage = pageInstanceMatched ?? page404;
    
            this.currentPage = currentPage;
            this.currentPage.pageShow();
        }
    }

    // Base class for pages
    class Page {
        constructor({ key, title }) {
            this.pageElement = document.querySelector('#content');
            this.title = title;
            this.key = key;
        }

        render() {
            return ``;
        }

        pageShow() {
            this.pageElement.innerHTML = this.render();
            document.title = this.title;
        }

        pageHide() {
            this.pageElement.innerHTML = '';
        }
    }

    // Page class for showing decks
    class PageShowDecks extends Page {
        pageShow() {
            new DeckShower();
            document.title = this.title;
        }
    }

    // Page class for creating a deck
    class PageCreateDeck extends Page {
        pageShow() {
            new DeckMaker();
            document.title = this.title;
        }
    }

    // Page class for showing flashcards
    class PageFlashCard extends Page {
        constructor(settings) {
            super(settings);
            this.controller = null;
        }

        render() {
            return `
                <h2></h2>
                <div id="flashcard-container">
                    <!-- Flashcard content will be rendered here -->
                </div>
            `;
        }

        pageShow() {
            super.pageShow();
            const urlParams = new URLSearchParams(window.location.search);
            const deck = urlParams.get('deck');
            if (deck) {
                 this.controller = new FlashcardController(deck);
            }
        }

        pageHide() {
            super.pageHide();
            this.controller = null;
        }
    }

    // Page class for editing a deck
    class PageEditDeck extends Page {
        pageShow() {
            const urlParams = new URLSearchParams(window.location.search);
            const deck = urlParams.get('deck');  
            
            if (deck) {
                new DeckEditor(deck);
                document.title = this.title;
            }
        }
    }

    // Page class for handling unknown pages
    class PageNotFound extends Page {
        render() {
            return `
                <h2>Not found</h2>
                <p>Unknown page</p>
            `;
        }
    }

    // Initialize the router with page definitions
    const router = new Router({
        pages: [
            new PageShowDecks({ key: 'show-decks', title: 'Your Decks' }),
            new PageCreateDeck({ key: 'create-deck', title: 'Create new Deck' }),
            new PageFlashCard({ key: 'flashcard', title: 'Flashcards' }),
            new PageEditDeck({ key: 'edit-deck', title: 'Edit Deck' }),
            new PageNotFound({ key: '404', title: 'Page not found' })
        ],
        defaultPage: 'show-decks'
    });
});
