const infoLogger = (...params) => {
  if (process.env.NODE_ENV !== "test") {
    return console.log(...params);
  }
};

const errorLogger = (...params) => {
  if (process.env.NODE_ENV) {
    return console.error(...params);
  }
};

module.exports = { infoLogger, errorLogger };
