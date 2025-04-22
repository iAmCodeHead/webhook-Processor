import rateLimit from 'express-rate-limit';

const rateLimiter = rateLimit({
  windowMs: 1000, 
  max: 10, // maximum number of request inside a window
  message: 'You have exceeded the 1000 requests in 1 hr limit!', // the message when they exceed limit
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

export default rateLimiter;
