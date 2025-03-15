import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const getLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(success, error => setError('Konum alınamadı.'));
    } else {
      setError('Tarayıcı geolokasyon desteği sunmuyor.');
    }
  }, []);

  const success = (position) => {
    const { latitude, longitude } = position.coords;
    setLocation({ latitude, longitude });
  };

  const fetchWeather = (lat, lon, cityName = '') => {
    setIsLoading(true);
    const apiKey = '206d4c2e41c92b7fb28dbe2914354251';
    const url = cityName
      ? `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}&units=metric&lang=tr`
      : `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`;
    
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.cod !== 200) {
          setError('Hava durumu alınamadı.');
        } else {
          setWeather(data);
          setError(null);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError('Hata oluştu. Lütfen tekrar deneyin.');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (location) {
      fetchWeather(location.latitude, location.longitude);
    } else {
      getLocation();
    }
  }, [location, getLocation]); 

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (city.trim() !== '') {
      fetchWeather(location?.latitude, location?.longitude, city);
    }
  };

  const getWeatherIcon = (weather) => {
    if (!weather) return '';
    switch (weather) {
      case 'Clear':
        return '🌞';
      case 'Rain':
        return '🌧️';
      case 'Clouds':
        return '☁️';
      case 'Snow':
        return '❄️';
      default:
        return '🌦️';
    }
  };

  return (
    <div className={`app ${weather?.weather[0].main.toLowerCase()}`}>
      <div className="container">
        <h1 className="title">Hava Durumu</h1>
        
        <form className="search-form" onSubmit={handleCitySearch}>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="search-input"
            placeholder="Şehir Ara"
          />
          <button type="submit" className="search-button">Ara</button>
        </form>

        {isLoading && <p>Yükleniyor...</p>}
        {error && <p className="error">{error}</p>}

        {weather && !isLoading && (
          <div className="weather-info">
            <div className="weather-icon">
              <span>{getWeatherIcon(weather.weather[0].main)}</span>
            </div>
            <div className="weather-details">
              <h2 className="city-name">{weather.name}, {weather.sys.country}</h2>
              <p className="temp">{Math.round(weather.main.temp)}°C</p>
              <p className="description">{weather.weather[0].description}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
