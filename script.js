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
const popupClose = _('.meals__popup-close');

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

const renderMainMeal = async function () {
    const data = await getData('https://www.themealdb.com/api/json/v1/1/random.php');

    const meal = data.meals[0];
    const readingTime = calcReadingTime(meal);

    const mealcard = `
        <div class="meals__card mealItem" data-id="${meal.idMeal}">
            <div class="meals__card-img">
                <img src="${meal.strMealThumb}" alt="">
                <span>${meal.strArea}</span>
            </div>
            <div class="meals__card-footer">
                <h3>${meal.strMeal}</h3>
                <span><i class="far fa-clock"></i> ${readingTime} min read</span>
            </div>
        </div>
        `;

    mealsMain.innerHTML = mealcard;
}

const renderMealsPopup = async function (e) {
    // Guard clause
    if (!e.target.closest('.mealItem')) return;

    const id = e.target.closest('.mealItem').dataset.id;
    
    const data = await getData(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
    const meal = data.meals[0];

    const ingsArr = listIngredients(meal);
    // const readingTime = calcReadingTime(meal, ingsArr); 

    const details = `
        <div class="meals__popup-container">
            <h2 class="meals__popup-title">${meal.strMeal}</h2>
            <div class="meals__card-img">
                <img src="${meal.strMealThumb}" alt="">
                <span>${meal.strArea}</span>
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
        mealsPopup.innerHTML = details;
        mealsPopup.classList.remove('hidden');
        body.classList.add('hidden');

        // Close popup
        if (e.target.matches('.meals__popup-close')) closePupup();
}

const closePupup = function() {
    mealsPopup.classList.add('hidden');
    body.classList.remove('hidden');
}

renderMainMeal();
renderFavMeals();
mealsContainer.addEventListener('click', renderMealsPopup);
mealsPopup.addEventListener('click', closePupup);