module.exports = {
  getPcode(key) {
    const idx = key.lastIndexOf('.');
    if (idx === -1) {
      return '';
    }
    return key.slice(0, idx);
  }
};
