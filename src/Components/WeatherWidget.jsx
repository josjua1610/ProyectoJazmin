// components/WeatherWidget.jsx
import React, { useEffect, useState } from 'react';

export default function WeatherWidget() {
  const [weather, setWeather] = useState(null);

  useEffect(() => {
    fetch('https://api.openweathermap.org/data/2.5/weather?q=Mexico City&appid=TU_API_KEY&units=metric')
      .then(res => res.json())
      .then(data => setWeather(data))
      .catch(console.error);
  }, []);

  if (!weather) return <p>Cargando clima...</p>;

  return (
    <div>
      <h3>Clima en {weather.name}</h3>
      <p>{weather.weather[0].description}</p>
      <p>Temperatura: {weather.main.temp} °C</p>
    </div>
  );
}
