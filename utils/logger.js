const infoLogger = (...params) => {
  return console.log(...params);
};

const errorLogger = (...params) => {
  return console.error(...params);
};

module.exports = { infoLogger, errorLogger };
