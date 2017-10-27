const express = require('express');
const config = require('config');
const debug = require('debug');
const api = require('../libs/ooyala');
const channels = require('../models/channels');
const {createChannelView, getTimeBase, createChannelHeader} = require('../libs/shared/program');
const {getPcode} = require('../libs/utils');

const router = express.Router();
const print = debug('comment');

router.get('/', (req, res) => {
  print(`/ called`);
  channels.getChannels().then(data => {
    const baseTime = getTimeBase(new Date());
    const initialChannel = data[0].id;
    const view = createChannelView(data, baseTime, initialChannel);
    const header = createChannelHeader(baseTime);
    const embedCode = view[0].programs[0].embedCode;
    const embedToken = api.getTokenRequest(embedCode);
    res.render('program', {
      data: JSON.stringify(data),
      view: JSON.stringify(view),
      baseTime,
      initialChannel,
      channels: view,
      header,
      pcode: getPcode(config.api.key),
      playerBrandingId: config.player.id,
      embedCode,
      embedToken
    });
  }).catch(err => {
    res.render('error', {err});
  });
});

module.exports = router;
