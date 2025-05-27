const apiKey = 'DBELFYET2HB66AN6SZC56BC6M';
const form = document.getElementById('search-form');
const input = document.getElementById('location-input');
const weatherDisplay = document.getElementById('weather-display');
const forecastDisplay = document.getElementById('forecast-display');
const toggleButton = document.getElementById('toggle-units');
const loadingIndicator = document.getElementById('loading');
const errorMessage = document.getElementById('error-message');

let currentUnit = 'metric'; // metric = Celsius, us = Fahrenheit
let lastLocation = '';

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const location = input.value.trim();
    clearDisplays();

    if (!location) {
        showError('Please enter a location.');
        input.classList.add('error');
        return;
    }

    input.classList.remove('error');
    showLoading();

    fetchWeatherData(location, currentUnit)
    .then(data => {
        hideLoading();
        processAndDisplayWeather(data, currentUnit);
        lastLocation = location;
    })
    .catch(err => {
        hideLoading();
        if (err.message === 'Location not found') {
            showError(`Could not find "${location}". Please check the spelling and try again.`);
        }
        else {
            showError('An error occurred while fetching weather data. Please try again.');
        }
        input.classList.add('error');
    });
});

toggleButton.addEventListener('click', () => {
    currentUnit = currentUnit === 'metric' ? 'us' : 'metric';
    toggleButton.textContent = currentUnit === 'metric' ? 'Switch to °F' : 'Switch to °C';
    if (lastLocation) {
        clearDisplays();
        showLoading();
        fetchWeatherData(lastLocation, currentUnit)
        .then(data => {
            hideLoading();
            processAndDisplayWeather(data, currentUnit);
        })
        .catch(err => {
            hideLoading();
            showError('Location not found. Please try again.');
        });
    }
});

//      API FETCH FUNCTION
async function fetchWeatherData(location, unitGroup) {
    const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${encodeURIComponent(location)}?unitGroup=${unitGroup}&key=${apiKey}&include=current,days&elements=datetime,temp,humidity,windspeed,precipprob,conditions,icon`;
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Location not found');
    }
    const data = await response.json();
    console.log(data);
    return data;
}

//          PROCESS DATA FUNCTIONS

function processCurrentWeather(data) {
    const current = data.currentConditions;
    return {
        location: data.resolvedAddress,
        conditions: current.conditions,
        temperature: current.temp,
        humidity: current.humidity,
        windspeed: current.windspeed,
        precipprob: current.precipprob,
        icon: current.icon,
    };
}

function processForecast(data) {
    return data.days.slice(1, 8).map(day => ({
        date: day.datetime,
        conditions: day.conditions,
        temp: day.temp,
        humidity: day.humidity,
        windspeed: day.windspeed,
        precipprob: day.precipprob,
        icon: day.icon,
    }));
}

//           DISPLAY FUNCTIONS

function processAndDisplayWeather(data, unitGroup) {
    const current = processCurrentWeather(data);
    const forecast = processForecast(data);
    displayCurrentWeather(current, unitGroup);
    displayForecast(forecast, unitGroup);
}

function displayCurrentWeather(weather, unitGroup) {
    const tempUnit = unitGroup === 'metric' ? '°C' : '°F';
    weatherDisplay.innerHTML = `
        <h2>${weather.location}</h2>
        <p>${weather.conditions}</p>
        <p>Temperature: ${weather.temperature} ${tempUnit}</p>
        <p>Humidity: ${weather.humidity}%</p>
        <p>Chance of Rain: ${weather.precipprob || 0}%</p>
        <p>Wind Speed: ${weather.windspeed} ${unitGroup === 'metric' ? 'km/h' : 'mph'}</p>
    `;
}

function displayForecast(forecastArray, unitGroup) {
    const tempUnit = unitGroup === 'metric' ? '°C' : '°F';
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    const forecastHTML = forecastArray.map(day => {
        const dateObj = new Date(day.date);
        const dayName = daysOfWeek[dateObj.getDay()];
        return `
            <div class="forecast-day">
            <h3>${dayName}</h3>
            <p>${day.conditions}</p>
            <p><strong>${day.temp} ${tempUnit}</strong></p>
            <p>💧 ${day.humidity}%</p>
            <p>🌧️ ${day.precipprob || 0}%</p>
            <p>💨 ${day.windspeed} ${unitGroup === 'metric' ? 'km/h' : 'mph'}</p>
            </div>
        `;
    }).join('');

    forecastDisplay.innerHTML = `
        <h2>7-Day Forecast</h2>
        <div class="forecast-days-wrapper">${forecastHTML}</div>
    `;
}

//          HELPER FUNCTIONS

function showLoading() {
    loadingIndicator.classList.remove('hidden');
    errorMessage.classList.add('hidden');
}
  
function hideLoading() {
    loadingIndicator.classList.add('hidden');
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.remove('hidden');
}

function clearDisplays() {
    weatherDisplay.innerHTML = '';
    forecastDisplay.innerHTML = '';
    errorMessage.classList.add('hidden');
}