import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [location, setLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState(null);
  const [city, setCity] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiKey = '206d4c2e41c92b7fb28dbe2914354251';

  // Bugünün tarihini ve 5 gün sonrasını hesapla
  const getFormattedDate = (offset) => {
    const today = new Date();
    today.setDate(today.getDate() + offset); // Offset ile günü ilerlet
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const getCurrentDate = () => {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    return `${day}.${month}.${year}`;
  };

  useEffect(() => {
    const getLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error => setError('Konum alınamadı.'));
      } else {
        setError('Tarayıcı geolokasyon desteği sunmuyor.');
      }
    };

    const success = (position) => {
      const { latitude, longitude } = position.coords;
      setLocation({ latitude, longitude });
    };

    if (!location) {
      getLocation();
    }
  }, [location]);

  const fetchWeather = (lat, lon, cityName = '') => {
    setIsLoading(true);
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

  const fetchForecast = (lat, lon, cityName = '') => {
    setIsLoading(true);
    const url = cityName
      ? `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${apiKey}&units=metric&lang=tr`
      : `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=tr`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.cod !== '200') {
          setError('Hava tahmini alınamadı.');
        } else {
          setForecast(data);
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
      fetchForecast(location.latitude, location.longitude);
    }
  }, [location]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (city.trim() !== '') {
      // Şehir araması yapıldığında, location null olabilir, bu yüzden kontrol ekliyoruz
      if (location) {
        fetchWeather(location.latitude, location.longitude, city);
        fetchForecast(location.latitude, location.longitude, city);
      } else {
        setError('Konum alınamadı. Şehir araması yaparken konum bilgisi gereklidir.');
      }
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

        {/* Sağ üst köşede günün tarihi */}
        <div className="current-date">
          {getCurrentDate()}
        </div>

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

        {forecast && !isLoading && (
          <div className="forecast-info">
            <h2 className="forecast-title">5 Günlük Tahmin</h2>
            <div className="forecast-cards">
              {forecast.list.slice(0, 5).map((item, index) => (
                <div key={index} className="forecast-card">
                  <p>{getFormattedDate(index + 1)}</p> {/* Tarih burada güncelleniyor */}
                  <p>{Math.round(item.main.temp)}°C</p>
                  <p>{item.weather[0].description}</p>
                  <p>Rüzgar: {item.wind.speed} m/s</p>
                  <p>Nem: {item.main.humidity}%</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
