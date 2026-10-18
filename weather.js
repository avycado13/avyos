const searchForm = document.getElementById("weather-search");
const cityInput = document.getElementById("weather-city");
const status = document.getElementById("weather-status");
const results = document.getElementById("weather-results");
const locationName = document.getElementById("weather-location");
const temperature = document.getElementById("weather-temperature");
const condition = document.getElementById("weather-condition");
const details = document.getElementById("weather-details");
const forecast = document.getElementById("weather-forecast");

const conditions = {
	0: "Clear sky", 1: "Mostly clear", 2: "Partly cloudy", 3: "Overcast",
	45: "Fog", 48: "Freezing fog", 51: "Light drizzle", 53: "Drizzle",
	55: "Heavy drizzle", 56: "Freezing drizzle", 57: "Heavy freezing drizzle",
	61: "Light rain", 63: "Rain", 65: "Heavy rain", 66: "Freezing rain",
	67: "Heavy freezing rain", 71: "Light snow", 73: "Snow", 75: "Heavy snow",
	77: "Snow grains", 80: "Light showers", 81: "Showers", 82: "Heavy showers",
	85: "Snow showers", 86: "Heavy snow showers", 95: "Thunderstorm",
	96: "Thunderstorm with hail", 99: "Thunderstorm with heavy hail",
};

function describeWeather(code) {
	return conditions[code] ?? "Weather unavailable";
}

async function getJson(url, signal) {
	const response = await fetch(url, { signal });
	if (!response.ok) throw new Error("Weather service is unavailable. Please try again.");
	return response.json();
}

let activeRequest;
let hasLoaded = false;

async function loadWeather(city) {
	activeRequest?.abort();
	const controller = new AbortController();
	activeRequest = controller;
	status.textContent = "Loading weather…";
	results.hidden = true;

	try {
		const geocodeUrl = new URL("https://geocoding-api.open-meteo.com/v1/search");
		geocodeUrl.search = new URLSearchParams({ name: city, count: "1", language: "en", format: "json" });
		const places = await getJson(geocodeUrl, controller.signal);
		const place = places.results?.[0];
		if (!place) throw new Error(`No city found for “${city}”. Try another search.`);

		const forecastUrl = new URL("https://api.open-meteo.com/v1/forecast");
		forecastUrl.search = new URLSearchParams({
			latitude: place.latitude,
			longitude: place.longitude,
			current: "temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code",
			daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
			temperature_unit: "fahrenheit",
			wind_speed_unit: "mph",
			timezone: "auto",
			forecast_days: "5",
		});
		const weather = await getJson(forecastUrl, controller.signal);
		if (!weather.current || !weather.daily?.time) {
			throw new Error("Forecast is unavailable for this city. Please try again.");
		}

		locationName.textContent = [place.name, place.admin1, place.country].filter(Boolean).join(", ");
		temperature.textContent = `${Math.round(weather.current.temperature_2m)}°F`;
		condition.textContent = describeWeather(weather.current.weather_code);
		details.textContent = `Feels like ${Math.round(weather.current.apparent_temperature)}°F · Humidity ${weather.current.relative_humidity_2m}% · Wind ${Math.round(weather.current.wind_speed_10m)} mph`;
		forecast.replaceChildren();
		weather.daily.time.forEach((day, index) => {
			const row = document.createElement("li");
			const date = new Date(`${day}T12:00:00Z`).toLocaleDateString("en-US", {
				weekday: "short", month: "short", day: "numeric", timeZone: "UTC",
			});
			const rain = weather.daily.precipitation_probability_max?.[index];
			row.textContent = `${date} · ${describeWeather(weather.daily.weather_code[index])} · ${Math.round(weather.daily.temperature_2m_max[index])}° / ${Math.round(weather.daily.temperature_2m_min[index])}°F${rain == null ? "" : ` · Rain ${rain}%`}`;
			forecast.append(row);
		});
		status.textContent = "";
		results.hidden = false;
	} catch (error) {
		if (activeRequest === controller && error.name !== "AbortError") {
			status.textContent = error.message || "Could not load weather. Please try again.";
		}
	} finally {
		if (activeRequest === controller) activeRequest = undefined;
	}
}

searchForm.addEventListener("submit", (event) => {
	event.preventDefault();
	const city = cityInput.value.trim();
	if (city) void loadWeather(city);
});

document.getElementById("weatheropen").addEventListener("click", () => {
	if (!hasLoaded) {
		hasLoaded = true;
		void loadWeather(cityInput.value.trim());
	}
});
