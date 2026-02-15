import express from "express";
import { coreHandler } from "../src/core.js";

const app = express();
app.use(express.text({ type: "*/*" })); // keep raw body for parity

function toNormalized(req) {
  return {
    method: req.method,
    path: req.path,
    query: req.query || {},
    headers: req.headers || {},
    bodyText: typeof req.body === "string" ? req.body : JSON.stringify(req.body ?? null)
  };
}

app.get("/bench/cpu", async (req, res) => {
  const r = await coreHandler(toNormalized(req));
  res.status(r.statusCode).set(r.headers).send(r.body);
});

app.post("/bench/write", async (req, res) => {
  const r = await coreHandler(toNormalized(req));
  res.status(r.statusCode).set(r.headers).send(r.body);
});

app.put("/bench/update", async (req, res) => {
  const r = await coreHandler(toNormalized(req));
  res.status(r.statusCode).set(r.headers).send(r.body);
});

app.get("/health", (_req, res) => res.status(200).send("ok"));

const port = process.env.PORT ? Number(process.env.PORT) : 8080;
app.listen(port, () => console.log(`bench server listening on ${port}`));
