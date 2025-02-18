import express, { json } from "express";
import bodyParser from "body-parser";
import { handleWebhook } from "./handleWebhook";
import logger from "morgan";

const app = express();

app.use(logger("dev"));
app.use(json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post("/webhook", handleWebhook);

app.use("/", (req, res) => {
  return res.send("Welcome to My Auto Trader");
});

// errors & edge cases
app.use((err, req, res) => {
  res.status(err.status || 500);
  res.json({
    err: {
      message: err.message,
    },
  });
});

app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.message = "404";
  next(error);
  res.status(404).send({
    message: "Route Not Found",
  });
});

export default app;

