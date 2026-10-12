import express from "express";
import cors from "cors";
import "dotenv/config";
import { tripsRouter } from "./routes/trips.js";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/trips", tripsRouter);

const port = process.env.PORT || 8080;
app.listen(port, () => console.log(`Trip planner backend running on :${port}`));
