const whitelist = [
  "http://localhost:8080",
  "http://localhost",
  "http://192.168.1.2:8080",
  "http://192.168.1.2",
  "https://competent-jackson-ccddd8.netlify.app",
  "https://movieclub.link",
];

export const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
};
