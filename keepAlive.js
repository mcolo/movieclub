const cronJob = require("cron").CronJob;
const axios = require("axios").default;

// (() => {
//   const job = new cronJob("0 */20 * * * *", () => {
//     axios
//       .get("https://fathomless-reaches-08772.herokuapp.com/keepalive")
//       .then((res) => {})
//       .catch((err) => {
//         console.log(err);
//         job.stop();
//       });
//   });

//   job.start();
// })();

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
