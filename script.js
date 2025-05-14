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
    updateBackground(current.conditions);
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
            <p>Temp: ${day.temp} ${tempUnit}</p>
            <p>Humidity: ${day.humidity}%</p>
            <p>Chance of Rain: ${day.precipprob || 0}%</p>
            <p>Wind: ${day.windspeed} ${unitGroup === 'metric' ? 'km/h' : 'mph'}</p>
            </div>
        `;
    }).join('');

    forecastDisplay.innerHTML = `<h2>7-Day Forecast</h2>${forecastHTML}`;
}

//           BACKGROUND FUNCTION

function updateBackground(condition) {
    let bgImage = '';
    let bgColor = '#333';
  
    if (condition.includes('Clear')) {
        bgImage = 'url(https://images.unsplash.com/photo-1504384308090-c894fdcc538d)';
        bgColor = '#87CEEB';
    } else if (condition.includes('Cloud')) {
        bgImage = 'url(https://images.unsplash.com/photo-1499346030926-9a72daac6c63)';
        bgColor = '#777';
    } else if (condition.includes('Rain')) {
        bgImage = 'url(https://images.unsplash.com/photo-1505483531331-3df5bcca84d7)';
        bgColor = '#3a3a3a';
    } else if (condition.includes('Snow')) {
        bgImage = 'url(https://images.unsplash.com/photo-1608889175441-6d9cba14992a)';
        bgColor = '#dfe6e9';
    }
  
    document.body.style.backgroundImage = bgImage;
    document.body.style.backgroundColor = bgColor;
}