// api/statuses.js
// Vercel KV serverless function — handles GET and POST for lead statuses + outreach log
// Vercel KV automatically injects KV_REST_API_URL and KV_REST_API_TOKEN env vars

import { kv } from "@vercel/kv";

const STATUS_KEY   = "leadflow:statuses";
const OUTREACH_KEY = "leadflow:outreach";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // ── GET: return both statuses and outreach log in one round-trip ──
  if (req.method === "GET") {
    try {
      const [statuses, outreach] = await Promise.all([
        kv.get(STATUS_KEY),
        kv.get(OUTREACH_KEY),
      ]);
      return res.status(200).json({
        statuses: statuses || {},
        outreach: outreach || [],
      });
    } catch (err) {
      console.error("KV GET error:", err);
      return res.status(500).json({ error: "Failed to load data" });
    }
  }

  // ── POST: save statuses and/or outreach log ──
  if (req.method === "POST") {
    try {
      const body = req.body;
      if (typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ error: "Expected a JSON object" });
      }

      const ops = [];

      // statuses field: { id: { status, replied } }
      if (body.statuses !== undefined) {
        if (typeof body.statuses !== "object" || Array.isArray(body.statuses)) {
          return res.status(400).json({ error: "statuses must be an object" });
        }
        ops.push(kv.set(STATUS_KEY, body.statuses));
      }

      // outreach field: array of log entries
      if (body.outreach !== undefined) {
        if (!Array.isArray(body.outreach)) {
          return res.status(400).json({ error: "outreach must be an array" });
        }
        // Keep last 500 entries max
        ops.push(kv.set(OUTREACH_KEY, body.outreach.slice(0, 500)));
      }

      await Promise.all(ops);
      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("KV SET error:", err);
      return res.status(500).json({ error: "Failed to save data" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
