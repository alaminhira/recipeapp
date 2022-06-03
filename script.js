'use strict';

const _ = el => document.querySelector(el);

const favItems = document.querySelectorAll('.meals__fav-item');

const containerMeals = _('.meals__container');
const favList = _('.meals__fav-list');
const inputSearch = _('.meals__search-input');
const btnSearch =_('.meals__search-icon');

const getData = async function(url) {
    const res = await fetch(url);

    return await res.json();
}

const renderFavMeals = async function() {
    const data = await getData(`https://www.themealdb.com/api/json/v1/1/search.php?s=a`);

    const favMeals = data.meals.slice(0, 4);

    favMeals.forEach(meal => {
        const html = `
            <li class="meals__fav-item">
                <img src="${meal.strMealThumb}" alt="Meal">
                <h4>${meal.strMeal}</h4>
            </li>
            `;

        favList.insertAdjacentHTML('afterbegin', html);
    })

}

const renderMainMeal = async function() {
    const data = await getData('https://www.themealdb.com/api/json/v1/1/random.php');

    const meal = data.meals[0];
    console.log(meal.strInstructions)

    const mealcard = `
        <div class="meals__card">
            <div class="meals__card-img">
                <img src="${meal.strMealThumb}" alt="">
                <span>${meal.strArea}</span>
            </div>
            <div class="meals__card-footer">
                <h3>${meal.strMeal}</h3>
                <i class="far fa-heart"></i>
            </div>
        </div>
        `;
    
    containerMeals.insertAdjacentHTML('beforeend', mealcard);
}
renderMainMeal();
renderFavMeals();
