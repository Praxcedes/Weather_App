const API_KEY = "YOUR_OWN_API_KEY"; // Replace with your OpenWeatherMap API key
const BASE_URL = "https://api.open-meteo.com/v1/forecast?latitude=-1.2833&longitude=36.8167&hourly=temperature_2m";

const weatherForm = document.getElementById("weatherForm");
const cityInput = document.getElementById("cityInput");
const weatherDisplay = document.getElementById("weatherDisplay");
const errorMessage = document.getElementById("errorMessage");

document.getElementById("weatherForm").addEventListener("submit", function (e) {
  e.preventDefault(); // prevent form from reloading the page

  const city = document.getElementById("cityInput").value.trim();
  if (city !== "") {
    getWeather(city);
  }
});

function getWeather(city) {
  const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;

  fetch(geoUrl)
    .then(response => response.json())
    .then(geoData => {
      if (!geoData.results || geoData.results.length === 0) {
        throw new Error("City not found.");
      }

      const { latitude, longitude, name, country } = geoData.results[0];
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&hourly=relativehumidity_2m`;

      return fetch(weatherUrl)
        .then(response => response.json())
        .then(weatherData => {
          displayWeather(weatherData, name, country, latitude, longitude);
        });
    })
    .catch(error => {
      showError(error.message);
    });
}

function displayWeather(data, cityName, countryCode) {
  document.getElementById("errorMessage").classList.add("hidden");

  const weather = data.current_weather;
  const humidity = data.hourly.relativehumidity_2m[0];

  //  Get weather code for description and icon
  const weatherCode = weather.weathercode;
  const weatherInfo = getWeatherDescriptionAndIcon(weatherCode);

  weatherDisplay.innerHTML = `
    <div class="weather-card">
      <h3>${cityName}, ${countryCode}</h3>
      <img src="${weatherInfo.icon}" alt="${weatherInfo.description}" width="60" />
      <p><strong>Description:</strong> ${weatherInfo.description}</p>
      <p><strong>Temp:</strong> ${weather.temperature}°C</p>
      <p><strong>Humidity:</strong> ${humidity}%</p>
      <p><strong>Wind:</strong> ${weather.windspeed} m/s</p>
      <p><strong>Time:</strong> ${weather.time}</p>
      <div class="button-group">
        <button id="editBtn">Edit</button>
        <button id="deleteBtn">Delete</button>
      </div>
    </div>
  `;

  // Add functionality to Delete button
  document.getElementById("deleteBtn").addEventListener("click", function () {
    weatherDisplay.innerHTML = ""; // Clear the displayed weather
  });

  // Add functionality to Edit button
  document.getElementById("editBtn").addEventListener("click", function () {
    cityInput.value = cityName; // Pre-fill input with current city
    cityInput.focus();          // Focus input field for editing
  });
}

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.remove("hidden");

  weatherDisplay.innerHTML = "";
}

//  Map weather codes to descriptions and icons
function getWeatherDescriptionAndIcon(code) {
  const weatherMap = {
    0: { description: "Clear sky", icon: "https://cdn-icons-png.flaticon.com/512/869/869869.png" },
    1: { description: "Mainly clear", icon: "https://cdn-icons-png.flaticon.com/512/1163/1163661.png" },
    2: { description: "Partly cloudy", icon: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png" },
    3: { description: "Overcast", icon: "https://cdn-icons-png.flaticon.com/512/414/414825.png" },
    45: { description: "Fog", icon: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png" },
    48: { description: "Depositing rime fog", icon: "https://cdn-icons-png.flaticon.com/512/4005/4005901.png" },
    51: { description: "Light drizzle", icon: "https://cdn-icons-png.flaticon.com/512/4150/4150897.png" },
    61: { description: "Slight rain", icon: "https://cdn-icons-png.flaticon.com/512/414/414974.png" },
    71: { description: "Slight snow fall", icon: "https://cdn-icons-png.flaticon.com/512/642/642102.png" },
    80: { description: "Rain showers", icon: "https://cdn-icons-png.flaticon.com/512/1163/1163624.png" },
    95: { description: "Thunderstorm", icon: "https://cdn-icons-png.flaticon.com/512/1146/1146869.png" },
  
  };

  return weatherMap[code] || { description: "Unknown", icon: "https://cdn-icons-png.flaticon.com/512/252/252035.png" };
}
