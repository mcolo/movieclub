const whitelist = [
  "http://localhost:8080",
  "http://localhost",
  "http://192.168.1.2:8080",
  "http://192.168.1.2",
  "https://competent-jackson-ccddd8.netlify.app",
];

export const corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("\n\n ORIGIN: \n " + origin + "\n\n");
      callback(new Error("Not allowed by CORS"));
    }
  },
};