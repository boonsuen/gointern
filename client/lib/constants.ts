export const API_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:4000/api'
    : 'https://53lhr13ezc.execute-api.us-east-1.amazonaws.com/api';
