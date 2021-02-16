import { CronJob } from "cron";
import axios from "axios";

export const startCronJob = () => {
  const job = new CronJob("0 */1 * * * *", () => {
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
