// FINAL AND CORRECTED CODE for: src/js/views/cookingView.js

import View from './View.js';
import icons from 'url:../../img/icons.svg';
import { formatIngredientQuantity } from '../helpers.js'; 

class CookingView extends View {
  _parentElement = document.querySelector('.cooking-container');
  _errorMessage = 'Could not load recipe. Please go back and try again.';

  addHandlerCheckIngredient(handler) {
    this._parentElement.addEventListener('change', function(e) {
        if (!e.target.matches('.ingredient-checkbox')) return;
        const listItem = e.target.closest('.cooking-ingredient');
        listItem.classList.toggle('cooking-ingredient--checked');
    });
  }

  addHandlerAddTimer(handler) {
    this._parentElement.addEventListener('submit', function(e) {
        e.preventDefault();
        const form = e.target.closest('.timer-form');
        if (!form) return;

        const labelInput = form.querySelector('.timer-form__input--label');
        const durationInput = form.querySelector('.timer-form__input--duration');
        const label = labelInput.value;
        const duration = +durationInput.value;

        if(!label || !duration || duration <= 0) return alert('Please provide a valid label and duration.');
        handler(label, duration);

        labelInput.value = '';
        durationInput.value = '';
    });
  }
  
  addHandlerAskAI(handler) {
    this._parentElement.addEventListener('click', function(e) {
      const btn = e.target.closest('.btn--ask-ai');
      if (!btn) return;
      handler(); 
    });
  }

  _generateMarkup() {
    return `
      <a href="index.html#${this._data.id}" class="btn--inline btn--back">
         <span>Back to Recipe</span>
      </a>
      <h1 class="cooking-title"><span>${this._data.title}</span></h1>
      
      <div class="cooking-grid">
        <!-- Ingredients Column -->
        <div class="cooking-section">
            <h2 class="heading--2">Ingredients Checklist</h2>
            <ul class="cooking-ingredient-list">
                ${this._data.ingredients.map(ing => this._generateMarkupIngredient(ing)).join('')}
            </ul>
        </div>

        <!-- Tools Column -->
        <div class="cooking-section">
            <h2 class="heading--2">Cooking Tools</h2>
            <div class="tool">
              <h3 class="tool__title">Cooking Timers</h3>
              <form class="timer-form">
                  <div class="timer-form__group">
                      <input type="text" class="timer-form__input timer-form__input--label" placeholder="Timer for..." required>
                      <input type="number" min="1" class="timer-form__input timer-form__input--duration" placeholder="minutes" required>
                  </div>
                  <button class="btn--small">
                      <span>Add Timer</span>
                     
                  </button>
              </form>
            </div>
            <div class="tool">
              <h3 class="tool__title">AI Assistant</h3>
              <p class="tool__description">Need a substitute for an ingredient or a wine pairing suggestion? Ask our chef's assistant!</p>
              <button class="btn--small btn--ask-ai">
                <span>Ask AI Specialist</span>
                  </button>
            </div>
        </div>

        <!-- Info Column -->
        <div class="cooking-section">
            <h2 class="heading--2">Recipe Info</h2>
            ${this._generateMarkupNutrition()}
            <div class="tool">
              <h3 class="tool__title">Original Directions</h3>
              <p class="tool__description">This recipe was designed by <strong>${this._data.publisher}</strong>. View their original instructions for detailed steps.</p>
              <a class="btn--small" href="${this._data.sourceUrl}" target="_blank">
                <span>View Source</span>
                </a>
            </div>
        </div>
      </div>
    `;
  }

  _generateMarkupIngredient(ing) {
    return `
      <li class="cooking-ingredient">
        <label>
          <input type="checkbox" class="ingredient-checkbox" />
          <span class="recipe__quantity">${formatIngredientQuantity(ing.quantity)}</span>
          <span class="recipe__unit">${ing.unit}</span>
          ${ing.description}
        </label>
      </li>
    `;
  }

  _generateMarkupNutrition() {
    const nutrition = this._data.nutrition;
    
    if (!nutrition) return `<div class="tool"><div class="spinner--tiny"></div><p>Loading nutrition...</p></div>`;
    
    if (nutrition.error) return `<div class="tool"><p>Could not load nutrition data.</p></div>`;
    
    // The <p> tag now has the correct class
    return `
      <div class="tool">
        <h3 class="tool__title">Nutrition (per serving)</h3>
        <p class="nutrition-fact"><strong>Calories:</strong> ${Math.round(nutrition.calories)}</p>
      </div>
    `;
  }
}

export default new CookingView();