import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(
  new DynamoDBClient({}),
  {
    marshallOptions: { removeUndefinedValues: true }
  }
);

function jsonResponse(statusCode, bodyObj) {
  return {
    statusCode,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(bodyObj)
  };
}

function nowIso() {
  return new Date().toISOString();
}

function parseJsonSafe(s) {
  if (!s) return null;
  try { return JSON.parse(s); } catch { return null; }
}

/**
 * Normalized request shape (used by both Lambda and ECS adapters)
 * {
 *   method: "GET"|"POST"|"PUT",
 *   path: "/bench/cpu" | "/bench/write" | "/bench/update",
 *   query: { ... },
 *   headers: { ... },
 *   bodyText: string | null
 * }
 */
export async function coreHandler(req) {
  const start = Date.now();
  const mode = process.env.MODE || "unknown";

  // ----- GET /bench/cpu?work=500000 -----
  if (req.method === "GET" && req.path === "/bench/cpu") {
    const work = Math.max(0, Math.min(50_000_000, Number(req.query.work ?? 500000)));
    let x = 0;
    for (let i = 0; i < work; i++) x += (i % 7);

    return jsonResponse(200, {
      ok: true,
      mode,
      endpoint: "cpu",
      work,
      x,
      duration_ms: Date.now() - start,
      ts: nowIso()
    });
  }

  // ----- POST /bench/write -----
  if (req.method === "POST" && req.path === "/bench/write") {
    const table = process.env.BENCH_WRITE_TABLE;
    if (!table) return jsonResponse(500, { ok: false, error: "BENCH_WRITE_TABLE not set" });

    const body = parseJsonSafe(req.bodyText);
    if (!body?.pk || !body?.sk) {
      return jsonResponse(400, { ok: false, error: "Body must include pk and sk" });
    }

    const item = {
      pk: String(body.pk),
      sk: String(body.sk),
      payload: body.payload ?? null,
      createdAt: nowIso()
    };

    await ddb.send(new PutCommand({
      TableName: table,
      Item: item
    }));

    return jsonResponse(200, {
      ok: true,
      mode,
      endpoint: "write",
      table,
      pk: item.pk,
      sk: item.sk,
      duration_ms: Date.now() - start,
      ts: nowIso()
    });
  }

  // ----- PUT /bench/update -----
  if (req.method === "PUT" && req.path === "/bench/update") {
    const table = process.env.BENCH_UPDATE_TABLE;
    if (!table) return jsonResponse(500, { ok: false, error: "BENCH_UPDATE_TABLE not set" });

    const body = parseJsonSafe(req.bodyText);
    if (!body?.pk || !body?.sk) {
      return jsonResponse(400, { ok: false, error: "Body must include pk and sk" });
    }

    const pk = String(body.pk);
    const sk = String(body.sk);
    const newPayload = body.payload ?? null;

    await ddb.send(new UpdateCommand({
      TableName: table,
      Key: { pk, sk },
      UpdateExpression: "SET #p = :p, #u = :u",
      ExpressionAttributeNames: { "#p": "payload", "#u": "updatedAt" },
      ExpressionAttributeValues: { ":p": newPayload, ":u": nowIso() }
    }));

    return jsonResponse(200, {
      ok: true,
      mode,
      endpoint: "update",
      table,
      pk,
      sk,
      duration_ms: Date.now() - start,
      ts: nowIso()
    });
  }

  return jsonResponse(404, {
    ok: false,
    mode,
    error: "Not found",
    method: req.method,
    path: req.path,
    ts: nowIso()
  });
}
