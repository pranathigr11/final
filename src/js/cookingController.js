// MODIFIED AND COMPLETE CODE FOR: src/js/cookingController.js

import * as model from './model.js';
import cookingView from './views/cookingView.js';
import timerView from './views/timerView.js';
import aiView from './views/aiView.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// --- MAIN CONTROLLER ---
const controlCookingPage = async function() {
  try {
    // 1) Get recipe ID from URL
    const id = new URLSearchParams(window.location.search).get('id');
    if (!id) return;

    // 2) Render a spinner
    cookingView.renderSpinner();
    
    // 3) Load the recipe data (which now includes nutrition!)
    await model.loadRecipe(id);
    
    // 4) Render the entire page once all data is loaded
    cookingView.render(model.state.recipe);

  } catch (err) {
    console.error('💥', err);
    cookingView.renderError(err.message);
  }
};

// --- TIMER CONTROLLERS ---
const controlAddTimer = function(label, duration) {
  model.addTimer(label, duration);
  timerView.render(model.state.timers);
  timerView.runTimers();
};

const controlDeleteTimer = function(id) {
  model.deleteTimer(id);
  timerView.render(model.state.timers);
  if (model.state.timers.length > 0) {
      timerView.runTimers();
  }
};

// --- AI CONTROLLERS ---
const controlShowAIModal = function() {
    aiView.render(model.state.recipe);
    aiView.toggleWindow();
}

const controlGetAISuggestion = async function(question) {
    aiView.renderLoading();
    const answer = await model.getAiSuggestion(question, model.state.recipe.title);
    aiView.renderAnswer(answer);
}

// --- INITIALIZATION ---
const init = function() {
  controlCookingPage();

  // Attach all event handlers
  cookingView.addHandlerCheckIngredient();
  cookingView.addHandlerAddTimer(controlAddTimer);
  cookingView.addHandlerAskAI(controlShowAIModal);

  timerView.addHandlerRemoveTimer(controlDeleteTimer);

  aiView.addHandlerSubmitQuery(controlGetAISuggestion);
};
init();