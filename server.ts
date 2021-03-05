import express from "express";
import dotenv from "dotenv";
import router from "./routes";
import cors from "cors";
import mongoose from "mongoose";
import cron from "node-cron";
import { BudgetModel } from "./db/BudgetModel";

// config
dotenv.config();
const app = express();

// database
const dbUrl = process.env.DB_URL;
mongoose
  .connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then((result) => console.log("Database Connected"))
  .catch((err) => {
    console.log(err);
  });

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);

// cron job
cron.schedule(
  "0 0 1 * *",
  () => {
    const dateNow = Date.now();
    BudgetModel.find({ active: true })
      .select("_id end_date")
      .exec((err, budget) => {
        if (err) {
          console.log(err.message);
        } else if (budget === null || undefined) {
          console.log("no data");
        } else {
          budget.map((data) => {
            if (data.get("end_date") <= dateNow)
              BudgetModel.findOneAndUpdate(
                { _id: data.get("_id") },
                { active: false }
              ).exec((err, update) => {
                if (err) {
                  console.log(err.message);
                } else {
                  console.log(
                    `Budget with id ${update.get("_id")} deactivated`
                  );
                }
              });
          });
        }
      });
  },
  { timezone: "Asia/Jakarta" }
);

cron.schedule(
  "0 0 1 * *",
  () => {
    const dateNow = Date.now();
    BudgetModel.find({ active: false })
      .select("_id start_date")
      .exec((err, budget) => {
        if (err) {
          console.log(err.message);
        } else if (budget === null || undefined) {
          console.log("no data");
        } else {
          budget.map((data) => {
            if (data.get("start_date") == dateNow) {
              BudgetModel.findOneAndUpdate(
                { _id: data.get("_id") },
                { active: true }
              ).exec((err, update) => {
                if (err) {
                  console.log(err.message);
                } else {
                  console.log(`Budget with id ${update.get("_id")} activated`);
                }
              });
            }
          });
        }
      });
  },
  { timezone: "Asia/Jakarta" }
);

// Routes
app.use(router);

const port = process.env.PORT;
app.listen(port, () => console.log(`Listening to port ${port}`));
