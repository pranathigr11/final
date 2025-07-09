// FINAL AND CORRECTED CODE for: src/js/views/recipeView.js

import View from './View.js';
import icons from 'url:../../img/icons.svg';
import { formatIngredientQuantity } from '../helpers.js';

class RecipeView extends View {
  _parentElement = document.querySelector('.recipe');
  _errorMessage = 'We could not find that recipe. Please try another one!';
  _message = '';

  addHandlerRender(handler) {
    ['hashchange', 'load'].forEach(ev => window.addEventListener(ev, handler));
  }

  addHandlerUpdateServings(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--update-servings');
      if (!btn) return;
      const { updateTo } = btn.dataset;
      if (+updateTo > 0) handler(+updateTo);
    });
  }

  addHandlerAddBookmark(handler) {
    this._parentElement.addEventListener('click', function (e) {
      const btn = e.target.closest('.btn--bookmark');
      if (!btn) return;
      handler();
    });
  }

  _generateMarkup() {
    return `
      <figure class="recipe__fig">
        <img src="${this._data.image}" alt="${this._data.title}" class="recipe__img" />
        <h1 class="recipe__title"><span>${this._data.title}</span></h1>
      </figure>

      <div class="recipe__details">
        <div class="recipe__info">
         
           <img class="recipe__info-icon" src="../../../img/clock.png">
         
          <span class="recipe__info-data recipe__info-data--minutes">${this._data.cookingTime}</span>
          <span class="recipe__info-text">minutes</span>
        </div>

        <div class="recipe__info">
         
            <img class="recipe__info-icon" src="../../img/users.png">
          
          <span class="recipe__info-data recipe__info-data--people">${this._data.servings}</span>
          <span class="recipe__info-text">servings</span>

          <div class="recipe__info-buttons">
            <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings - 1}">
               <img  src="../../../img/minus.circle.png">
            </button>
            <button class="btn--tiny btn--update-servings" data-update-to="${this._data.servings + 1}">
              <img  src="../../../img/plus.circle.png">
            </button>
          </div>
        </div>

        <!-- Nutrition Info Display -->
        <div class="recipe__info nutrition__info">
          ${this._data.nutrition && this._data.nutrition.calories > 0 ? `
            
            <span class="recipe__info-data">${Math.round(this._data.nutrition.calories)}</span>
            <span class="recipe__info-text">kcal / serving</span>
          ` : ''}
        </div>

        <!-- User Generated Icon -->
        <div class="recipe__user-generated ${this._data.userGenerated ? '' : 'hidden'}">
          <img src="../../../img/users">
        </div>

        <button class="btn--round btn--bookmark">
        <img src="../../../img/bookmark-fill.png">
        </button>
      </div>

      <div class="recipe__ingredients">
        <h2 class="heading--2">Recipe ingredients</h2>
        <ul class="recipe__ingredient-list">
          ${this._data.ingredients.map(this._generateMarkupIngredient).join('')}
        </ul>
      </div>

      <div class="recipe__directions">
        <h2 class="heading--2">How to cook it</h2>
        <p class="recipe__directions-text">
          This recipe was carefully designed and tested by
          <span class="recipe__publisher">${this._data.publisher}</span>. Please check out directions at their website.
        </p>
        <div class="recipe__directions-buttons">
          <a class="btn--small recipe__btn" href="${this._data.sourceUrl}" target="_blank">
            <span>Directions</span>
            </a>
          <a class="btn--small recipe__btn" href="cook-mode.html?id=${this._data.id}" target="_blank">
            <span>Cooking Mode</span>
            
          </a>
        </div>
      </div>
    `;
  }

  _generateMarkupIngredient(ing) {
    return `
      <li class="recipe__ingredient">
        <svg class="recipe__icon"><use href="${icons}#icon-check"></use></svg>
        <div class="recipe__quantity">${formatIngredientQuantity(ing.quantity)}</div>
        <div class="recipe__description">
          <span class="recipe__unit">${ing.unit}</span>
          ${ing.description}
        </div>
      </li>
    `;
  }
}

export default new RecipeView();