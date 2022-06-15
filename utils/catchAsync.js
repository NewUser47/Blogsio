/* eslint-disable */
//this function is to catch errors in asynchronous functions
//we do not need to immediately call this function, so we wait until express calls it. Therefore, we return another fn and not call it immediately.
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};
