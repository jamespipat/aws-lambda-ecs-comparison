import { coreHandler } from "../src/core.js";

export const handler = async (event) => {
  const method = event?.requestContext?.http?.method || "GET";
  const rawPath = event?.rawPath || "/";
  const query = event?.queryStringParameters || {};
  const headers = event?.headers || {};
  const bodyText = event?.isBase64Encoded
    ? Buffer.from(event.body || "", "base64").toString("utf-8")
    : (event.body || null);

  return coreHandler({
    method,
    path: rawPath,
    query,
    headers,
    bodyText
  });
};
