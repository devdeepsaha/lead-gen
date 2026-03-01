// api/statuses.js
// Vercel KV serverless function — handles GET and POST for lead statuses
// Vercel KV automatically injects KV_REST_API_URL and KV_REST_API_TOKEN env vars

import { kv } from "@vercel/kv";

const KEY = "leadflow:statuses";

export default async function handler(req, res) {
  // Allow requests from same origin (your Vercel domain)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method === "GET") {
    try {
      const statuses = await kv.get(KEY);
      return res.status(200).json(statuses || {});
    } catch (err) {
      console.error("KV GET error:", err);
      return res.status(500).json({ error: "Failed to load statuses" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body;
      if (typeof body !== "object" || Array.isArray(body)) {
        return res.status(400).json({ error: "Expected a JSON object of { id: status }" });
      }
      await kv.set(KEY, body);
      return res.status(200).json({ ok: true, saved: Object.keys(body).length });
    } catch (err) {
      console.error("KV SET error:", err);
      return res.status(500).json({ error: "Failed to save statuses" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
