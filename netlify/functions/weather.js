export default async (request) => {
  const url = new URL(request.url);

  const endpoint = url.searchParams.get("endpoint");
  const city = url.searchParams.get("city");
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  const API_KEY = process.env.OPENWEATHER_API_KEY;

  let openWeatherUrl;

  if (endpoint === "geocode") {
    openWeatherUrl =
      `https://api.openweathermap.org/geo/1.0/direct` +
      `?q=${encodeURIComponent(city)}` +
      `&limit=1` +
      `&appid=${API_KEY}`;
  }

  if (endpoint === "weather") {
    openWeatherUrl =
      `https://api.openweathermap.org/data/2.5/forecast` +
      `?lat=${lat}` +
      `&lon=${lon}` +
      `&appid=${API_KEY}` +
      `&units=metric`;
  }

  if (endpoint === "reverse") {
    openWeatherUrl =
      `https://api.openweathermap.org/geo/1.0/reverse` +
      `?lat=${lat}` +
      `&lon=${lon}` +
      `&limit=1` +
      `&appid=${API_KEY}`;
  }

  if (!openWeatherUrl) {
    return new Response(
      JSON.stringify({
        error: "Invalid API request",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  try {
    const response = await fetch(openWeatherUrl);

    if (!response.ok) {
      throw new Error(`OpenWeather request failed: ${response.status}`);
    }

    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({
        error: "Unable to fetch weather data",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
};
