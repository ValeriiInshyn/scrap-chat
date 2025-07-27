// Custom middleware functions

// Request logger middleware
const requestLogger = (req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
};

const validateApiKey = (req, res, next) => {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey) {
    return res.status(401).json({
      error: "API key is required",
      message: "Please provide an API key in the x-api-key header",
    });
  }

  next();
};

const rateLimiter = (req, res, next) => {
  next();
};

module.exports = {
  requestLogger,
  validateApiKey,
  rateLimiter,
};
