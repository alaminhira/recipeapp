'use strict';

const _ = el => document.querySelector(el);

const favItems = document.querySelectorAll('.meals__fav-item');

const body = _('body');
const headerMeals = _('.meals__header');
const inputSearch = _('.meals__search-input');
const btnSearch = _('.meals__search-icon');
const mealsBody = _('.meals__body');
const mealsSearchList = _('.meals__search-list');
const mealsContainer = _('.meals__container');
const mealsMain = _('.meals__main');
const favList = _('.meals__fav-list');
const mealsPopup = _('.meals__popup');
const loader = _('.meals__loader');

const lovedMeals = []

const renderLoader = function(parent) {
    parent.insertAdjacentHTML(
        'beforeend',
        `<div class="meals__loader">
            <i class="fas fa-spinner meals__loader-spinner"></i>
        </div>
        `
    );
}

const hideLoader = data => data && _('.meals__loader').remove();

const getData = async function (url) {
    const res = await fetch(url);
    return await res.json();
}

const calcReadingTime = function (meal) {
    const ingsArr = listIngredients(meal);
    const wordCount = [...meal.strInstructions.split(' '), ...ingsArr].length;

    const WPM = 135 // Let's pretend '180 Word Per Minute' is the average reading speed

    return Math.ceil(wordCount / WPM);
}

const renderSearchedMeals = function(mealsArr) {
    mealsSearchList.style.display = 'block';
    mealsSearchList.innerHTML = '';
    mealsSearchList.insertAdjacentHTML(
        'afterbegin',
        '<i class="fas fa-times meals__search-close"></i>'
    );

    mealsArr.forEach(meal => {
        const readingTime = calcReadingTime(meal);
        const html = `
            <li class="meals__search-item mealItem" data-id="${meal.idMeal}">
                <div class="meals__search-img">
                    <img src="${meal.strMealThumb}" alt="">
                </div>
                <div class="meals__search-details">
                    <p class="meals__search-info">
                        <span>${meal.strArea}</span>
                        <span><i class="far fa-clock"></i>${readingTime} Min Read</span>
                    </p>
                    <h4>${meal.strMeal}</h4>
                </div>
            </li>
            `;
        mealsSearchList.insertAdjacentHTML('beforeend', html);
    })
}

const hideList = function(e) {
    if (!e.target.classList.contains('meals__search-close')) return;

    this.style.display = 'none';
}

let timer = null;
const loadSearchedMeals = function() {
    let input = this.value

    // If there is no input return
    if (!input) return;
    
    // If there is already a timer clear it
    clearTimeout(timer);
    
    // Set a new timer
    timer = setTimeout(async (e) => {
        // Render loader
        renderLoader(mealsBody);

        // Retrive data
        let data = 
            await getData(`https://www.themealdb.com/api/json/v1/1/search.php?s=${input}`);
            
        data = data.meals ? data : await getData(`https://www.themealdb.com/api/json/v1/1/search.php?f=${[...input][0]}`);
        
        // Render meals on UI
        renderSearchedMeals(data.meals);

        // Hide loader
        hideLoader(data);

        // Clear input value
        this.value = '';
    }, 700);
    
}

// HAVE TO POLISH
const listIngredients = function (meal) {
    const ingsArr = [];
    for (let i = 1; i < 20; i++) {
        const ing = meal[`strIngredient${i}`];

        if (!ing) break;
        ingsArr.push(ing);
    }
    return ingsArr;
}

const renderFavMeal = function (meal) {
    const mealItem = `
            <li class="meals__fav-item mealItem" data-id="${meal.idMeal}">
                <img src="${meal.strMealThumb}" alt="Meal">
                <h4>${meal.strMeal}</h4>
            </li>
            `;

    favList.insertAdjacentHTML('afterbegin', mealItem);
}

const toggleFavItem = async function (e) {
    const love = _('.meals__popup-heart');
    if (e.target !== love) return;

    // 1) Add to fav item array
    if (love.classList.contains('far')) {

        // Add love icon
        love.classList.replace('far', 'fas');
        const id = love.closest('.meals__popup-container').dataset.id;
        
        const data = await getData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
        const meal = data.meals[0];
        meal.isLoved = 'fas';
        
        lovedMeals.push(meal);

        // 1) Add to the UI
        renderFavMeal(meal);

        // 3) Remove from fav item array
    } else {
        const id = love.closest('.meals__popup-container').dataset.id;

        // remove love icon
        love.classList.replace('fas', 'far');
        const i = lovedMeals.findIndex(meal => meal.idMeal === id);

        lovedMeals.splice(i, 1);

        // Remove from UI
        _(`[data-id="${id}"]`).remove();
    }
}

const renderMainMeal = async function () {
    // Render loader
    renderLoader(body);
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

const toggleMealsPopup = async function (e) {
    if (!e.target.closest('.mealItem')) return;

    // Render Loader
    renderLoader(body);

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
                <img src="${meal.strMealThumb}" alt="">
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

const init = function () {
    renderMainMeal();
    inputSearch.addEventListener('keyup', loadSearchedMeals);
    mealsSearchList.addEventListener('click', hideList);
    mealsContainer.addEventListener('click', toggleMealsPopup);
    mealsPopup.addEventListener('click', toggleFavItem);
}

init();