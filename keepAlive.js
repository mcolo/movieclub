const cronJob = require("cron").CronJob;

(() => {
  const job = new cronJob("0 */1 * * * *", () => {
    fetch("https://fathomless-reaches-08772.heroku.app/keepalive")
      .then((res) => {})
      .catch((err) => {});
  });

  job.start();
})();
