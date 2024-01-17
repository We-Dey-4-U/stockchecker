'use strict';

const axios = require('axios');
const Stock = require('../models/stock');
const { anonymizeIP } = require('../utils');

// In-memory storage to track IPs and their likes
const likedIPs = new Set();

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async function (req, res) {
      const { stock, like } = req.query;
      const ip = anonymizeIP(req.ip); // Anonymize the IP

      // Check if IP has already liked
      if (likedIPs.has(ip)) {
        return res.json({ error: 'Only one like per IP is allowed' });
      }

      // Handle scenarios for multiple stocks
      if (Array.isArray(stock)) {
        // Fetch data for each stock
        const stockDataPromises = stock.map(async (symbol) => {
          const stockData = await getStockData(symbol);
          if (!stockData) {
            return null;
          }

          let stockRecord = await Stock.findOne({ stock: symbol });
          if (!stockRecord) {
            stockRecord = await Stock.create({ stock: symbol });
          }

          // Update likes if 'like' is provided
          if (like && !stockRecord.likes.includes(ip)) {
            stockRecord.likes.push(ip);
            likedIPs.add(ip); // Add IP to likedIPs set
            await stockRecord.save();
          }

          return {
            stock: stockData.symbol,
            price: stockData.latestPrice,
            rel_likes: stockRecord.likes.length,
          };
        });

        // Wait for all promises to resolve
        const stockDataArray = await Promise.all(stockDataPromises);

        // Send the response
        return res.json({ stockData: stockDataArray });
      }

      // Handle scenarios for a single stock
      try {
        const stockData = await getStockData(stock);

        if (!stockData) {
          return res.json({ error: 'Invalid stock symbol' });
        }

        let stockRecord = await Stock.findOne({ stock });

        if (!stockRecord) {
          stockRecord = await Stock.create({ stock });
        }

        // Update likes if 'like' is provided
        if (like && !stockRecord.likes.includes(ip)) {
          stockRecord.likes.push(ip);
          likedIPs.add(ip); // Add IP to likedIPs set
          await stockRecord.save();
        }

        // Prepare the response object
        const responseData = {
          stockData: {
            stock: stockData.symbol,
            price: stockData.latestPrice,
            likes: stockRecord.likes.length,
          },
        };

        res.json(responseData);
      } catch (error) {
        console.error(error);
        res.json({ error: 'Internal server error' });
      }
    });
};

async function getStockData(symbol) {
  try {
    const apiUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${symbol}/quote`;
    const response = await axios.get(apiUrl);
    return response.data;
  } catch (error) {
    console.error(error);
    return null;
  }
}