// Write your code here
// Write your code here
const baseUrl = 'https://api.openbrewerydb.org/breweries'

const selectStateForm = document.querySelector('#select-state-form')
const filterSectionEl = document.querySelector('.filters-section')
const filterByCityForm = document.querySelector('#filter-by-city-form')

const titleEl = document.querySelector('.title')
const searchBarEl = document.querySelector('.search-bar')
const breweryListWrapper = document.querySelector('.brewery-list-wrapper')
const breweryList = document.querySelector('.breweries-list')

const filterByType = document.querySelector('#filter-by-type')
const searchForm = document.querySelector('#search-breweries-form')

const state = {
    breweries: [],
    selectedState: null,
    breweryTypes: ['micro', 'regional', 'brewpub'],
    selectedBreweryType: '',
    selectedCities: [],
    search: ''
}

// LINK DOM WITH STATE:
// 1) When state changes, the DOM should reflect that
// 2) When the DOM changes, the state should reflect that

// QUESTIONS TO ANSWER:
// Q: What kind of breweries should we be showing?
// A: state.selectedBreweryType

// Q: Is there a brewery type selected?
// A: state.selectedBreweryType !== ''

// Q: Which one?
// A: state.selectedBreweryType

// Q: Are there any cities selected?
// A: state.selectedCities.length > 0

// Q: Which cities are selected?
// A: state.selectedCities

// Q: What breweries am I looking for?
// A: state.search

// getBreweriesToDisplay :: () => breweries
// returns only the breweries we want to put on the page
function getBreweriesToDisplay() {
    let breweriesToDisplay = state.breweries

    breweriesToDisplay = breweriesToDisplay.filter(brewery =>
        state.breweryTypes.includes(brewery.brewery_type)
    )

    if (state.selectedBreweryType !== '') {
        breweriesToDisplay = breweriesToDisplay.filter(
            brewery => brewery.brewery_type === state.selectedBreweryType
        )
    }

    if (state.selectedCities.length > 0) {
        breweriesToDisplay = breweriesToDisplay.filter(brewery =>
            state.selectedCities.includes(brewery.city)
        )
    }

    breweriesToDisplay = breweriesToDisplay.filter(brewery =>
        brewery.name.toLowerCase().includes(state.search.toLowerCase())
    )

    breweriesToDisplay = breweriesToDisplay.slice(0, 10)

    return breweriesToDisplay
}

// HELPER FUNCTIONS

// getCitiesFromBreweries :: (breweries: array) => cities: array
// get a unique list of cities based on the available breweries
function getCitiesFromBreweries(breweries) {
    let cities = []

    for (const brewery of breweries) {
        if (!cities.includes(brewery.city)) {
            cities.push(brewery.city)
        }
    }

    cities.sort()

    return cities
}

// SERVER FUNCTIONS
function fetchBreweries() {
    return fetch(baseUrl).then(resp => resp.json())
}

function fetchBreweriesByState(state) {
    return fetch(`${baseUrl}?by_state=${state}&per_page=50`).then(resp =>
        resp.json()
    )
}

// RENDER FUNCTIONS

function renderCityCheckbox(city) {
    const inputEl = document.createElement('input')
    inputEl.setAttribute('type', 'checkbox')
    inputEl.setAttribute('class', 'city-checkbox')
    inputEl.setAttribute('name', city)
    inputEl.setAttribute('value', city)
    inputEl.setAttribute('id', city)

    // link the checkbox with the *selectedCities* state
    if (state.selectedCities.includes(city)) inputEl.checked = true

    const labelEl = document.createElement('label')
    labelEl.setAttribute('for', city)
    labelEl.textContent = city

    inputEl.addEventListener('change', function () {
        // update state.selectedCities
        const cityCheckboxes = document.querySelectorAll('.city-checkbox')
        let selectedCities = []
        for (const checkbox of cityCheckboxes) {
            if (checkbox.checked) selectedCities.push(checkbox.value)
        }

        // link the current state of the checkboxes with *state.selectedSCities*
        state.selectedCities = selectedCities

        // render
        render()
    })

    filterByCityForm.append(inputEl, labelEl)
}

function renderFilterSection() {
    if (state.breweries.length !== 0) {
        filterSectionEl.style.display = 'block'
    } else {
        filterSectionEl.style.display = 'none'
    }

    // changing the value of the <select> in the DOM to what is in state
    filterByType.value = state.selectedBreweryType

    // destroy all the checkboxes
    filterByCityForm.innerHTML = ''

    // render all the checkboxes again
    const cities = getCitiesFromBreweries(state.breweries)

    for (const city of cities) {
        renderCityCheckbox(city)
    }
}

function renderSearchInput() {
    searchForm.search.value = state.search
}

function renderBreweryItem(brewery) {
    const liEl = document.createElement('li')

    const breweryTitle = document.createElement('h2')
    breweryTitle.textContent = brewery.name

    const typeEl = document.createElement('div')
    typeEl.setAttribute('class', 'type')
    typeEl.textContent = brewery.brewery_type

    const addressEl = document.createElement('section')
    addressEl.setAttribute('class', 'address')

    const addressTitle = document.createElement('h3')
    addressTitle.textContent = 'Address:'

    const addressFirstLine = document.createElement('p')
    addressFirstLine.textContent = brewery.street

    const addressSecondLine = document.createElement('p')
    const addressSecondLineStrong = document.createElement('strong')
    addressSecondLineStrong.textContent = `${brewery.city}, ${brewery.postal_code}`

    addressSecondLine.append(addressSecondLineStrong)
    addressEl.append(addressTitle, addressFirstLine, addressSecondLine)

    const phoneEl = document.createElement('section')
    phoneEl.setAttribute('class', 'phone')

    const phoneTitle = document.createElement('h3')
    phoneTitle.textContent = 'Phone:'
    const phoneNumberEl = document.createElement('p')
    phoneNumberEl.textContent = brewery.phone

    phoneEl.append(phoneTitle, phoneNumberEl)

    const linkEl = document.createElement('section')
    linkEl.setAttribute('class', 'link')

    const aEl = document.createElement('a')
    aEl.setAttribute('href', brewery.website_url)
    aEl.setAttribute('target', '_blank')
    aEl.textContent = 'Visit Website'

    linkEl.append(aEl)

    liEl.append(breweryTitle, typeEl, addressEl, phoneEl, linkEl)

    breweryList.append(liEl)
}

function renderBreweryList() {
    // hide or show the elements
    if (state.breweries.length > 0) {
        titleEl.style.display = 'block'
        searchBarEl.style.display = 'block'
        breweryListWrapper.style.display = 'block'
    } else {
        titleEl.style.display = 'none'
        searchBarEl.style.display = 'none'
        breweryListWrapper.style.display = 'none'
    }

    // clear the list in the DOM
    breweryList.innerHTML = ''

    // recreate the list
    const breweriesToDisplay = getBreweriesToDisplay()

    for (const brewery of breweriesToDisplay) {
        renderBreweryItem(brewery)
    }
}

function render() {
    renderFilterSection()
    renderBreweryList()
    renderSearchInput()
}

function listenToSelectStateForm() {
    selectStateForm.addEventListener('submit', function (event) {
        event.preventDefault()
        state.selectedState = selectStateForm['select-state'].value

        fetchBreweriesByState(state.selectedState) // Promise<breweries>
            .then(function (breweries) {
                state.breweries = breweries
                state.selectedCities = []
                state.selectedBreweryType = ''
                state.search = ''
                render()
            })
    })
}

function listenToFilterByType() {
    filterByType.addEventListener('change', function () {
        // change state
        state.selectedBreweryType = filterByType.value

        // render
        render()
    })
}

function listenToSearchInput() {
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault()

        // update state
        state.search = searchForm.search.value
        // render
        render()
    })
}

function init() {
    render()
    listenToSelectStateForm()
    listenToFilterByType()
    listenToSearchInput()
}

init()
