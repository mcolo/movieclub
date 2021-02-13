const cronJob = require("cron").CronJob;
const axios = require("axios").default;

// globals
const url = "https://fathomless-reaches-08772.heroku.app/keepalive";

(() => {
  const job = new cronJob("0 */1 * * * *", () => {
    axios(url).then((res) => {});
  });

  job.start();
})();
