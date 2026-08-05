const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

// Create HTML for a weather card
const createWeatherCard = (cityName, weatherItem, index) => {
  const date = weatherItem.dt_txt.split(" ")[0];
  const temperature = weatherItem.main.temp.toFixed(2);
  const windSpeed = weatherItem.wind.speed;
  const humidity = weatherItem.main.humidity;
  const weatherIcon = weatherItem.weather[0].icon;
  const weatherDescription = weatherItem.weather[0].description;

  if (index === 0) {
    return `
      <div class="details">
        <h2>${cityName} (${date})</h2>
        <h4>Temperature: ${temperature}°C</h4>
        <h4>Wind: ${windSpeed} M/S</h4>
        <h4>Humidity: ${humidity}%</h4>
      </div>

      <div class="icon">
        <img
          src="https://openweathermap.org/img/wn/${weatherIcon}@4x.png"
          alt="${weatherDescription}"
        />
        <h4>${weatherDescription}</h4>
      </div>
    `;
  }

  return `
    <li class="card">
      <h3>(${date})</h3>

      <img
        src="https://openweathermap.org/img/wn/${weatherIcon}@2x.png"
        alt="${weatherDescription}"
      />

      <h4>Temp: ${temperature}°C</h4>
      <h4>Wind: ${windSpeed} M/S</h4>
      <h4>Humidity: ${humidity}%</h4>
    </li>
  `;
};

// Get weather details
const getWeatherDetails = async (cityName, lat, lon) => {
  const weatherApiUrl =
    `/.netlify/functions/weather` +
    `?endpoint=weather` +
    `&lat=${lat}` +
    `&lon=${lon}`;

  try {
    const response = await fetch(weatherApiUrl);
    if (!response.ok) {
      throw new Error(`Weather request failed: ${response.status}`);
    }

    const data = await response.json();

    const uniqueForecastDays = [];

    const fiveDaysForecast = data.list.filter((forecast) => {
      const forecastDate = forecast.dt_txt.split(" ")[0];

      if (!uniqueForecastDays.includes(forecastDate)) {
        uniqueForecastDays.push(forecastDate);
        return true;
      }

      return false;
    });

    cityInput.value = "";
    currentWeatherDiv.innerHTML = "";
    weatherCardsDiv.innerHTML = "";

    fiveDaysForecast.forEach((weatherItem, index) => {
      const weatherCard = createWeatherCard(cityName, weatherItem, index);

      if (index === 0) {
        currentWeatherDiv.insertAdjacentHTML("beforeend", weatherCard);
      } else {
        weatherCardsDiv.insertAdjacentHTML("beforeend", weatherCard);
      }
    });
  } catch (error) {
    console.error(error);
    alert("Unable to fetch weather data.");
  }
};

// Get city coordinates
const getCityCoordinates = async () => {
  const cityName = cityInput.value.trim();

  if (!cityName) return;

  const geocodingApiUrl =
    `/.netlify/functions/weather` +
    `?endpoint=geocode` +
    `&city=${encodeURIComponent(cityName)}`;

  try {
    const response = await fetch(geocodingApiUrl);
    if (!response.ok) {
      throw new Error(`Geocoding request failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data.length) {
      alert(`No coordinates found for ${cityName}`);
      return;
    }

    const { name, lat, lon } = data[0];

    await getWeatherDetails(name, lat, lon);
  } catch (error) {
    console.error(error);
    alert("An error occurred while fetching the coordinates.");
  }
};

// Get user's current location
const getUserCoordinates = () => {
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      const reverseGeocodingUrl =
        `/.netlify/functions/weather` +
        `?endpoint=reverse` +
        `&lat=${latitude}` +
        `&lon=${longitude}`;

      try {
        const response3 = await fetch(reverseGeocodingUrl);
        if (!response3.ok) {
          throw new Error(`User Geocoding request failed: ${response3.status}`);
        }

        const data = await response3.json();

        if (!data.length) {
          alert("Could not identify your location.");
          return;
        }

        const { name } = data[0];

        await getWeatherDetails(name, latitude, longitude);
      } catch (error) {
        console.error(error);
        alert("An error occurred while fetching your city.");
      }
    },

    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert(
          "Location permission was denied. Please allow location access and try again.",
        );
      }
    },
  );
};

// Event listeners
searchButton.addEventListener("click", getCityCoordinates);

locationButton.addEventListener("click", getUserCoordinates);

cityInput.addEventListener("keyup", (event) => {
  if (event.key === "Enter") {
    getCityCoordinates();
  }
});
