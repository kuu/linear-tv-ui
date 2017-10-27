const program = require('../../libs/shared/program');

setInterval(checkCurrentTime, 10000);
const channelData = JSON.parse(SERVER_CHANNEL_DATA);
let currentChannelView = restoreDateObject(JSON.parse(SERVER_CHANNEL_VIEW));
let currentTimeBase = new Date(SERVER_TIME_BASE);
let selectedChannelId = SERVER_INITIAL_CHANNEL_ID;
let currentEmbedCode = SERVER_EMBED_CODE;

function restoreDateObject(channelViewList) {
  for (const channelView of channelViewList) {
    for (const program of channelView.programs) {
      program.start = new Date(program.start);
    }
  }
  return channelViewList;
}

document.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
    switchChannel(false);
  } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
    switchChannel(true);
  }
});

function checkCurrentTime() {
  const timeBase = program.getTimeBase(new Date());
  if (timeBase.getTime() !== currentTimeBase.getTime()) {
    currentTimeBase = timeBase;
    currentChannelView = program.createChannelView(channelData, currentTimeBase, selectedChannelId);
    renderChannels(currentChannelView);
  }
  swithProgramIfNeeded(currentChannelView);
}

function swithProgramIfNeeded(view) {
  for (const channel of view) {
    if (channel.id !== selectedChannelId) {
      continue;
    }
    const currentTime = new Date();
    const program = channel.programs[0];
    if (program.start.getTime() <= currentTime.getTime() && program.embedCode !== currentEmbedCode) {
      window.ooPlayer.setEmbedCode(program.embedCode);
      currentEmbedCode = program.embedCode;
    }
  }
}

function renderChannels(channels) {
  const destProgram = document.querySelector('.myoo-program-section');
  const container = document.createElement('div');
  container.innerHTML = TVApp.templates.program({channels, data: '', baseTime: '', initialChannel: ''});
  const srcProgram = container.querySelector('.myoo-program-section');
  destProgram.innerHTML = srcProgram.innerHTML;
}

function switchChannel(down) {
  const list = document.querySelectorAll('.box');
  for (let i = 0; i < list.length; i++) {
    const channel = list[i];
    if (channel.classList.contains('selected')) {
      let index = 0;
      if (down) {
        index = i + 1 < list.length ? i + 1 : 0;
      } else {
        index = i - 1 < 0 ? list.length - 1 : i - 1;
      }
      channel.classList.remove('selected');
      list[index].classList.add('selected');
      selectedChannelId = channelData[index].id;
      const embedCode = currentChannelView[index].programs[0].embedCode;
      if (embedCode !== currentEmbedCode) {
        window.ooPlayer.setEmbedCode(embedCode);
        currentEmbedCode = embedCode;
      }
      break;
    }
  }
}
