// const api = require('../libs/ooyala');
const fs = require('fs');
const path = require('path');

module.exports = {
  getChannels() {
    // return api.get('/v2/assets', {where: `labels='Movie'`}, {recursive: true});
    return new Promise((resolve, reject) => {
      const filePath = path.join(__dirname, '../channels.json');
      fs.readFile(filePath, {encoding: 'utf8'}, (err, data) => {
        if (err) {
          return reject(err);
        }
        try {
          const channels = JSON.parse(data);
          resolve(channels);
        } catch (err) {
          reject(err);
        }
      });
    });
  }
};
