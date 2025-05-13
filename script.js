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