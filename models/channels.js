const api = require('../libs/ooyala');

const CHANNEL_A = '97b4fe3bcbe4cba9414687c173a77dd';
const CHANNEL_B = '5e04b33156a746649250474ec29b2e85';
const CHANNEL_C = '2ce74616ccd94c36a5fab42407cf7df0';

function getDuration(start, end) {
  return (end.getTime() - start.getTime()) / 60000;
}

function createProgram(data) {
  return {
    start_time: data.start_time,
    duration: getDuration(new Date(data.start_time), new Date(data.end_time)),
    title: data.name,
    embed_code: data.embed_code
  };
}

module.exports = {
  getChannels() {
    return api.get('/v3/events', {limit: 500}, {recursive: true})
    .then(events => {
      const channelA = [];
      const channelB = [];
      const channelC = [];
      for (const event of events) {
        if (event.track_id === CHANNEL_A) {
          channelA.push(createProgram(event.program));
        } else if (event.track_id === CHANNEL_B) {
          channelB.push(createProgram(event.program));
        } else if (event.track_id === CHANNEL_C) {
          channelC.push(createProgram(event.program));
        }
      }
      return [
        {id: CHANNEL_A, name: 'Channel A', programs: channelA},
        {id: CHANNEL_B, name: 'Channel B', programs: channelB},
        {id: CHANNEL_C, name: 'Channel C', programs: channelC}
      ];
    });
    /*
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
    */
  }
};
