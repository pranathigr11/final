

// CORRECTED and COMPLETE aiView.js

import View from './View.js';
import icons from 'url:../../img/icons.svg';

class AiView extends View {
  _parentElement = document.querySelector('.ai-modal');
  _overlay = document.querySelector('.ai-overlay');
  _window = document.querySelector('.ai-modal');

  constructor() {
    super();
    this._addHandlerHideWindow();
  }

  toggleWindow() {
    this._overlay.classList.toggle('hidden');
    this._window.classList.toggle('hidden');
  }

  // --- THIS METHOD IS NOW CORRECT ---
  _addHandlerHideWindow() {
    // Listen for clicks on the dark background
    this._overlay.addEventListener('click', this.toggleWindow.bind(this));
    
    // Listen for clicks specifically on the '×' close button
    this._parentElement.addEventListener('click', e => {
      if (e.target.closest('.btn--close-modal')) {
        this.toggleWindow();
      }
    });
  }
  
  addHandlerSubmitQuery(handler) {
    this._parentElement.addEventListener('submit', async function(e) {
      e.preventDefault();
      const form = e.target.closest('.ai-form');
      if (!form) return;
      
      const input = form.querySelector('.ai-form__input');
      const question = input.value;
      if (!question) return;

      input.value = '';
      await handler(question);
    });
  }

  renderAnswer(answer) {
    const answerEl = this._parentElement.querySelector('.ai-answer p');
    const spinner = this._parentElement.querySelector('.spinner--tiny');
    spinner.classList.add('hidden');
    answerEl.textContent = answer;
  }

  renderLoading() {
    const answerEl = this._parentElement.querySelector('.ai-answer p');
    const spinner = this._parentElement.querySelector('.spinner--tiny');
    answerEl.textContent = '';
    spinner.classList.remove('hidden');
  }

  _generateMarkup() {
    const recipeTitle = this._data.title;
    return `
      <button class="btn--close-modal">×</button> <!-- Note the HTML entity for the '×' symbol -->
      <h3 class="upload__heading">AI Chef's Assistant</h3>
      <p class="tool__description">Ask a question about the recipe: "${recipeTitle}"</p>
      <form class="ai-form">
        <input type="text" class="ai-form__input" required placeholder="e.g., What can I use instead of leeks?">
        <button class="btn">Ask</button>
      </form>
      <div class="ai-answer">
        <div class="spinner--tiny hidden"></div>
        <p></p>
      </div>
    `;
  }
}

export default new AiView();