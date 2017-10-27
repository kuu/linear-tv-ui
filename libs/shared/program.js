module.exports = {
  getTimeBase,
  createChannelView
};

function getTimeBase(date) {
  const d = new Date(date.getTime());
  d.setMinutes(Math.floor(date.getMinutes() / 10) * 10);
  d.setSeconds(0);
  d.setMilliseconds(0);
  return d;
}

function formatTime(date) {
  return `${('00' + date.getHours()).slice(-2)}:${('00' + date.getMinutes()).slice(-2)}`;
}

function getView(start, end, duration, programInfo) {
  return {
    displayTime: `${formatTime(start)}-${formatTime(end)}`,
    start,
    duration,
    title: programInfo.title,
    embedCode: programInfo.embed_code
  };
}

function createChannelView(channels, currentTimeBase, selectedChannelId) {
  const view = [];
  for (const channel of channels) {
    const channelView = {
      programs: [],
      id: '',
      selected: false
    };
    const timeBaseEnd = new Date(currentTimeBase.getTime() + 3600000);
    let timeBase = currentTimeBase;
    for (const program of channel.programs) {
      const start = new Date(program.start_time);
      const duration = calculateBoxSize(start, program.duration, currentTimeBase);
      if (!duration) {
        continue;
      }
      const end = new Date(start.getTime() + program.duration * 60000);
      if (start.getTime() > timeBase.getTime()) {
        const idleDuration = (start.getTime() - timeBase.getTime()) / 60000;
        channelView.programs.push(getView(
          timeBase,
          start,
          idleDuration,
          {duration: idleDuration, title: 'Idle time', embed_code: 'lmcXgzNTE65htD8QaqLYu0lj59FODGT4'}
        ));
      }
      channelView.programs.push(getView(start, end, duration, program));
      timeBase = end;
    }
    if (timeBase.getTime() < timeBaseEnd.getTime()) {
      const duration = (timeBaseEnd.getTime() - timeBase.getTime()) / 60000;
      channelView.programs.push(getView(
        timeBase,
        timeBaseEnd,
        duration,
        {duration, title: 'Idle time', embed_code: 'lmcXgzNTE65htD8QaqLYu0lj59FODGT4'}
      ));
    }
    channelView.id = channel.id;
    if (channel.id === selectedChannelId) {
      channelView.selected = true;
    }
    view.push(channelView);
  }
  return view;
}

function calculateBoxSize(start, duration, currentTimeBase) {
  const startTime = getTimeBase(start).getTime();
  const endTime = startTime + duration * 60000;
  const boxStart = currentTimeBase.getTime();
  const boxEnd = boxStart + 3600000; // 1 hour
  let visiblePortion = 0;
  if (startTime < boxStart) {
    visiblePortion = Math.min(endTime, boxEnd) - boxStart;
  } else {
    visiblePortion = Math.min(endTime, boxEnd) - startTime;
  }
  if (visiblePortion <= 0) {
    return 0;
  }
  return Math.ceil(visiblePortion / 600000) * 10;
}
