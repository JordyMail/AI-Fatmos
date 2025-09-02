import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { handleQuestionnaireSubmit, handleQuestionnaireGet } from "./routes/questionnaire";
import { handleHistoryGet, handleReportsGet, handleExportData, handleSessionDetail } from "./routes/reports";
import { handleCheckOut, handleGetCheckInData } from "./routes/checkout";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // AI-FatMoS Questionnaire API
  app.post("/api/v1/questionnaires", handleQuestionnaireSubmit);
  app.get("/api/v1/questionnaires", handleQuestionnaireGet);

  // AI-FatMoS Reports & History API
  app.get("/api/v1/history", handleHistoryGet);
  app.get("/api/v1/reports", handleReportsGet);
  app.get("/api/v1/export", handleExportData);
  app.get("/api/v1/sessions/:session_id", handleSessionDetail);

  // AI-FatMoS Check-out API
  app.post("/api/v1/checkout", handleCheckOut);
  app.get("/api/v1/checkin-data", handleGetCheckInData);

  return app;
}
