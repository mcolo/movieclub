const cronJob = require("cron").CronJob;
const axios = require("axios").default;

export const startCronJob = () => {
  const job = new cronJob("0 */1 * * * *", () => {
    axios
      .get("https://fathomless-reaches-08772.herokuapp.com/keepAlive")
      .then((res) => {})
      .catch((err) => {
        console.log(err);
        job.stop();
      });
  });

  job.start();
};
