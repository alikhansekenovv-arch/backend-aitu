console.log('🔥 SERVER.JS FILE LOADED 🔥');
const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

function firstOrNA(arr) {
  return Array.isArray(arr) && arr.length > 0 ? arr[0] : 'N/A';
}

app.get('/api/user-data', async (req, res) => {
  console.log('--- /api/user-data CALLED ---');

  try {
    // 1) Random User
    const randomUserResponse = await axios.get('https://randomuser.me/api/');
    const userRaw = randomUserResponse.data.results[0];
    const userCountry = userRaw.location.country;

    const user = {
      firstName: userRaw.name.first,
      lastName: userRaw.name.last,
      gender: userRaw.gender,
      profilePicture: userRaw.picture.large,
      age: userRaw.dob.age,
      dateOfBirth: userRaw.dob.date,
      city: userRaw.location.city,
      country: userCountry,
      fullAddress: `${userRaw.location.street.name} ${userRaw.location.street.number}, ${userRaw.location.postcode}`
    };

    // 2) REST Countries (не даём упасть всему запросу)
    let country = {
      countryName: userCountry,
      capital: 'N/A',
      languages: [],
      currency: { code: 'N/A', name: 'N/A', symbol: '' },
      flagUrl: ''
    };

    try {
      const countryResponse = await axios.get(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(userCountry)}`
      );

      const countryRaw = countryResponse.data[0];
      const languagesObj = countryRaw?.languages || {};
      const currenciesObj = countryRaw?.currencies || {};
      const currencyCodes = Object.keys(currenciesObj);
      const mainCurrencyCode = currencyCodes[0] || 'N/A';
      const mainCurrency = currenciesObj[mainCurrencyCode] || {};

      country = {
        countryName: countryRaw?.name?.common || userCountry,
        capital: Array.isArray(countryRaw?.capital) ? countryRaw.capital[0] : 'N/A',
        languages: Object.values(languagesObj),
        currency: {
          code: mainCurrencyCode,
          name: mainCurrency.name || 'N/A',
          symbol: mainCurrency.symbol || ''
        },
        flagUrl: countryRaw?.flags?.png || countryRaw?.flags?.svg || ''
      };
    } catch (e) {
      console.log('REST Countries failed:', e.message);
    }

    // 3) Exchange Rates
    let exchangeRates = { base: country.currency.code, toUSD: null, toKZT: null };

    try {
      const exchangeApiKey = process.env.EXCHANGE_RATE_API_KEY;
      if (exchangeApiKey && country.currency.code !== 'N/A') {
        const exchangeResponse = await axios.get(
          `https://v6.exchangerate-api.com/v6/${exchangeApiKey}/latest/${country.currency.code}`
        );
        const rates = exchangeResponse.data.conversion_rates || {};
        exchangeRates.toUSD = rates.USD || null;
        exchangeRates.toKZT = rates.KZT || null;
      }
    } catch (e) {
      console.log('ExchangeRate failed:', e.message);
    }

    // 4) News
    let news = [];
    try {
      const newsApiKey = process.env.NEWS_API_KEY;
      if (newsApiKey) {
        const newsResponse = await axios.get('https://newsapi.org/v2/everything', {
          params: { q: userCountry, language: 'en', pageSize: 5, apiKey: newsApiKey }
        });
        news = (newsResponse.data.articles || []).map(a => ({
          title: a.title,
          description: a.description,
          url: a.url,
          imageUrl: a.urlToImage,
          sourceName: a.source?.name
        }));
      }
    } catch (e) {
      console.log('NewsAPI failed:', e.message);
    }

    // ✅ ОДИН ответ — строго здесь
    return res.json({ user, country, exchangeRates, news });

  } catch (error) {
    console.error('FATAL ERROR in /api/user-data:', error.message);

    // ✅ и ОДИН ответ при ошибке — строго здесь
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
