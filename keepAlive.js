const cron = require("cron");
const axios = require("axios").default;

// globals
const url = "https://fathomless-reaches-08772.heroku.app/keepalive";

(() => {
  const cronJob = cron.CronJob("0 */1 * * * *", () => {
    axios(url).then((res) => {});
  });

  cronJob.start();
})();
