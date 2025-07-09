// FINAL AND CORRECTED CODE for: src/js/model.js

import { async } from 'regenerator-runtime';
import { RES_PER_PAGE, SPOONACULAR_API_KEY } from './config.js';
import { AJAX } from './helpers.js';

export const state = {
  recipe: {},
  search: {
    query: '',
    results: [],
    page: 1,
    resultsPerPage: RES_PER_PAGE,
  },
  bookmarks: [],
  timers: [],
};

const createRecipeObject = function (data) {
  // Check if the data is from Spoonacular or our local upload
  const isSpoonacular = 'extendedIngredients' in data;
  
  return {
    id: data.id,
    title: data.title,
    publisher: data.sourceName || data.publisher || 'User',
    sourceUrl: data.sourceUrl,
    image: data.image || data.image_url,
    servings: data.servings,
    cookingTime: data.readyInMinutes || data.cookingTime,
    ingredients: isSpoonacular ? data.extendedIngredients.map(ing => ({
      quantity: ing.amount,
      unit: ing.unit,
      description: ing.originalName,
    })) : data.ingredients,
    nutrition: data.nutrition?.nutrients ? {
        calories: data.nutrition.nutrients.find(n => n.name === 'Calories')?.amount / data.servings || 0,
    } : { calories: 0 }, // Default nutrition for user recipes
    bookmarked: state.bookmarks.some(b => b.id === data.id),
    userGenerated: data.userGenerated || false, // Add userGenerated flag
  };
};

export const loadRecipe = async function (id) {
  try {
    // Check if it's a user-generated recipe from bookmarks first
    const userRecipe = state.bookmarks.find(bm => bm.id === id && bm.userGenerated);
    if (userRecipe) {
      state.recipe = userRecipe;
      return;
    }
    
    const url = `https://api.spoonacular.com/recipes/${id}/information?apiKey=${SPOONACULAR_API_KEY}&includeNutrition=true`;
    const data = await AJAX(url);
    
    state.recipe = createRecipeObject(data);

  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const loadSearchResults = async function (query) {
  try {
    state.search.query = query;
    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${SPOONACULAR_API_KEY}&query=${query}&number=${RES_PER_PAGE * 3}`;
    const data = await AJAX(url);

    state.search.results = data.results.map(rec => ({
      id: rec.id,
      title: rec.title,
      publisher: 'Spoonacular',
      image: rec.image,
    }));
    
    // Also include user's bookmarked recipes in search results if they match
    const userResults = state.bookmarks.filter(bm => bm.userGenerated && bm.title.toLowerCase().includes(query.toLowerCase()));
    state.search.results.unshift(...userResults);

    state.search.page = 1;
  } catch (err) {
    console.error(`${err} 💥💥💥💥`);
    throw err;
  }
};

export const getSearchResultsPage = function (page = state.search.page) {
  state.search.page = page;
  const start = (page - 1) * state.search.resultsPerPage;
  const end = page * state.search.resultsPerPage;
  return state.search.results.slice(start, end);
};

export const updateServings = function (newServings) {
  state.recipe.ingredients.forEach(ing => {
    ing.quantity = (ing.quantity * newServings) / state.recipe.servings;
  });
  state.recipe.servings = newServings;
};

const persistBookmarks = function () {
  localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks));
};

export const addBookmark = function (recipe) {
  state.bookmarks.push(recipe);
  if (recipe.id === state.recipe.id) state.recipe.bookmarked = true;
  persistBookmarks();
};

export const deleteBookmark = function (id) {
  const index = state.bookmarks.findIndex(el => el.id === id);
  state.bookmarks.splice(index, 1);
  if (id === state.recipe.id) state.recipe.bookmarked = false;
  persistBookmarks();
};

// --- NEW UPLOAD RECIPE FUNCTION ---
// In src/js/model.js

export const uploadRecipe = function (newRecipe) {
  try {
    const ingredients = Object.entries(newRecipe)
      .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
      .map(ing => {
        // ... (this part remains the same)
        const ingArr = ing[1].split(',').map(el => el.trim());
        if (ingArr.length !== 3)
          throw new Error('Wrong ingredient format! Please use the correct format :)');
        const [quantity, unit, description] = ingArr;
        return { quantity: quantity ? +quantity : null, unit, description };
      });

    // Create the recipe object, now including calories
    const recipe = {
      id: `user-${Date.now()}`,
      title: newRecipe.title,
      publisher: newRecipe.publisher,
      sourceUrl: newRecipe.sourceUrl,
      image: newRecipe.image,
      servings: +newRecipe.servings,
      cookingTime: +newRecipe.cookingTime,
      ingredients,
      userGenerated: true,
      // --- NEW: Add the nutrition object with the calories from the form ---
      nutrition: {
        calories: +newRecipe.calories || 0 // Get calories, default to 0 if not provided
      }
    };
    
    addBookmark(recipe);
    state.recipe = recipe;

  } catch (err) {
    throw err;
  }
};


export const addTimer = function(label, durationMinutes) {
    const newTimer = { id: `timer-${Date.now()}`, label, duration: durationMinutes * 60, startTime: Date.now() };
    state.timers.push(newTimer);
};

export const deleteTimer = function(id) {
    const index = state.timers.findIndex(timer => timer.id === id);
    if(index > -1) state.timers.splice(index, 1);
};

export const getAiSuggestion = async function(question, recipeTitle) {
  try {
    const res = await fetch('/.netlify/functions/ask-ai', {
      method: 'POST',
      body: JSON.stringify({ question, recipeTitle }),
    });
    if (!res.ok) throw new Error('Network response for AI function was not ok.');
    
    const data = await res.json();
    return data.answer;
  } catch (err) {
    console.error('🤖 AI Fetch Error:', err);
    return 'Sorry, I am unable to connect to the assistant right now.';
  }
};

const initBookmarks = function () {
  const storage = localStorage.getItem('bookmarks');
  if (storage) state.bookmarks = JSON.parse(storage);
};
initBookmarks();