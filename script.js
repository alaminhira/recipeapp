'use strict';

const _ = el => document.querySelector(el);

const favItems = document.querySelectorAll('.meals__fav-item');

const body = _('body');
const inputSearch = _('.meals__search-input');
const btnSearch = _('.meals__search-icon');
const mealsContainer = _('.meals__container');
const mealsMain = _('.meals__main');
const favList = _('.meals__fav-list');
const mealsPopup = _('.meals__popup');
const loader = _('.meals__loader');

const lovedMeals = []

const renderLoader = () => {
    loader.classList.add('loading');
}

const hideLoader = data => {
    data && loader.classList.remove('loading');
}

const getData = async function (url) {
    const res = await fetch(url);
    return await res.json();
}

const calcReadingTime = function(meal) {
    const ingsArr = listIngredients(meal);
    const wordCount = [...meal.strInstructions.split(' '), ...ingsArr].length;

    const WPM = 135 // Let's pretend '180 Word Per Minute' is the average reading speed
 
    return Math.ceil(wordCount / WPM);
}

const listIngredients = function(meal) {
    const ingsArr = [];
    for (let i = 1; i < 20; i++) {
        const ing = meal[`strIngredient${i}`];

        if (!ing) break;
        ingsArr.push(ing);
    }
    return ingsArr;
}

const renderFavMeals = async function () {
    const data = await getData(`https://www.themealdb.com/api/json/v1/1/search.php?s=a`);

    const favMeals = data.meals.slice(0, 4);

    favMeals.forEach(meal => {
        const mealItem = `
            <li class="meals__fav-item mealItem" data-id="${meal.idMeal}">
                <img src="${meal.strMealThumb}" alt="Meal">
                <h4>${meal.strMeal}</h4>
            </li>
            `;

        favList.insertAdjacentHTML('afterbegin', mealItem);
    })

}

const toggleFavItem = async function(e) {
    const love = _('.meals__popup-heart');
    if (e.target !== love) return;

    let id = '';
    // 1) Toggle love icon
    if (love.classList.contains('far')) {
        // Add love icon
        love.classList.replace('far', 'fas');
        id = love.closest('.meals__popup-container').dataset.id;

        const data = await getData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const meal = data.meals[0];
        meal.isLoved = 'fas';

        lovedMeals.push(meal);

    } else {
        // remove love icon
        love.classList.replace('fas', 'far');
        const i = lovedMeals.findIndex(meal => meal.idMeal === id);

        console.log(i);
        lovedMeals.splice(i, 1);
    }

    // 2) Add to fav Item
    console.log(lovedMeals)

    // 3) Remove from fav item
}

const renderMainMeal = async function () {
    // Render loader
    renderLoader();
    const data = await getData('https://www.themealdb.com/api/json/v1/1/random.php');

    const meal = data.meals[0];
    const readingTime = calcReadingTime(meal);

    // Hide loader
    hideLoader(meal);

    const mealcard = `
        <div class="meals__card mealItem" data-id="${meal.idMeal}">
            <div class="meals__card-img">
                <img src="${meal.strMealThumb}" alt="">
                <span>${meal.strArea}</span>
            </div>
            <div class="meals__card-footer">
                <h3>${meal.strMeal}</h3>
                <span><i class="far fa-clock"></i> ${readingTime} Min Read</span>
            </div>
        </div>
        `;

    mealsMain.innerHTML = mealcard;
}

const toggleMealsPopup = async function(e) {
    if (!e.target.closest('.mealItem')) return;
    
    // Render Loader
    renderLoader();

    const id = e.target.closest('.mealItem').dataset.id;

    const data = lovedMeals.find(meal => meal.idMeal === id) || await getData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);

    const meal = data.meals ? data.meals[0] : data;

    const clsLoved = meal.isLoved ?? 'far';

    const ingsArr = listIngredients(meal);
    
    // When meal is ready, hide loader
    hideLoader(meal);

    const details = `
        <div class="meals__popup-container" data-id="${meal.idMeal}">
            <h2 class="meals__popup-title">${meal.strMeal}</h2>
            <div class="meals__popup-header">
                <img src="main-meal.jpg" alt="">
                <p class="meals__popup-info">
                    <span>Random Recipe</span>
                    <i class="${clsLoved} fa-heart meals__popup-heart"></i>
                </p>
            </div>
            <p class="meals__popup-details">${meal.strInstructions}</p>
            <div class="meals__popup-ings">
                <h3>Ingredients</h3>
                <ul class="meals__popup-list">
                    ${ingsArr.map(
                        ing => `<li>${ing}</li>`
                    ).join('')}
                </ul>
            </div>
            <i class="fas fa-close meals__popup-close"></i>
        </div>
        `;

    // Open popup
    openPopup(details);

        // Close popup
    _('.meals__popup-close').addEventListener('click', closePopup);
}

const openPopup = details => {
    mealsPopup.innerHTML = details;
    mealsPopup.classList.remove('hidden');
}

const closePopup = () => {
    mealsPopup.classList.add('hidden');
}

const init = function() {
    renderMainMeal();
    renderFavMeals();
    mealsContainer.addEventListener('click', toggleMealsPopup);
    mealsPopup.addEventListener('click', toggleFavItem);
}

init();
