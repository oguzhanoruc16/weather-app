import React from 'react';

const Weather = ({ data }) => {
  return (
    <div className="weather">
      <h2>{data.name}, {data.sys.country}</h2>
      <p>{data.weather[0].description}</p>
      <h3>{data.main.temp}°C</h3>
      <p>Humidity: {data.main.humidity}%</p>
      <p>Wind: {data.wind.speed} m/s</p>
    </div>
  );
};

export default Weather;
