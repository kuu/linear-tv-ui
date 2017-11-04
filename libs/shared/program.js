const IDLE_TIME_ASSET = 'U3Mmk4ZDE6RraNKzalVrPof6xcQPVtmo';

module.exports = {
  getTimeBase,
  createChannelView,
  createChannelHeader,
  IDLE_TIME_ASSET
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

function getView(start, end, duration, programInfo, options = {}) {
  return {
    displayTime: `${options.omitStart ? '' : formatTime(start)}-${options.omitEnd ? '' : formatTime(end)}`,
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
      const [duration, options] = calculateBoxSize(start, program.duration, currentTimeBase);
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
          {duration: idleDuration, title: 'Idle time', embed_code: IDLE_TIME_ASSET},
          {omitStart: channelView.programs.length === 0}
        ));
      }
      channelView.programs.push(getView(start, end, duration, program, options));
      timeBase = end;
    }
    if (timeBase.getTime() < timeBaseEnd.getTime()) {
      const duration = (timeBaseEnd.getTime() - timeBase.getTime()) / 60000;
      channelView.programs.push(getView(
        timeBase,
        timeBaseEnd,
        duration,
        {duration, title: 'Idle time', embed_code: IDLE_TIME_ASSET},
        {omitEnd: true}
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
  let startTime = getTimeBase(start).getTime();
  let endTime = startTime + duration * 60000;
  const boxStart = currentTimeBase.getTime();
  const boxEnd = boxStart + 3600000; // 1 hour
  const options = {};
  if (startTime < boxStart) {
    startTime = boxStart;
    options.omitStart = true;
  }
  if (endTime > boxEnd) {
    endTime = boxEnd;
    options.omitEnd = true;
  }
  const visiblePortion = endTime - startTime;
  if (visiblePortion <= 0) {
    return [0, options];
  }
  return [Math.ceil(visiblePortion / 600000) * 10, options];
}

function createChannelHeader(baseTime) {
  const header = [];
  for (let i = 0; i < 6; i++) {
    header.push({
      duration: 10,
      displayTime: formatTime(new Date(baseTime.getTime() + 600000 * i))
    });
  }
  return header;
}
