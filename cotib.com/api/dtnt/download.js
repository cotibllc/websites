// GET /do-the-next-thing/free/dl/<token> (rewritten to /api/dtnt/download?t=<token>).
// Streams the sampler PDF only for a valid, unexpired download token. The PDF
// lives outside the public www folder, so there is no guessable URL for it.
const fs = require('fs');
const path = require('path');
const { missingEnv } = require('../../lib/dtnt/config');
const { readToken } = require('../../lib/dtnt/tokens');
const { states } = require('../../lib/dtnt/pages');
const http = require('../../lib/dtnt/http');

const PDF_PATH = path.join(__dirname, '..', '..', 'private', 'dtnt', 'do-the-next-thing-free-sampler-v2.pdf');
const DOWNLOAD_NAME = 'Do-the-Next-Thing-3-free-prompts.pdf';

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return http.sendHtml(res, 405, states.downloadExpired(), http.PRIVATE_HEADERS);
  }
  const missing = missingEnv('download');
  if (missing.length) {
    http.log('dtnt.download.misconfigured', { missing });
    return http.sendHtml(res, 503, states.paused(), http.PRIVATE_HEADERS);
  }

  const tok = readToken('download', http.query(req, 't'));
  if (!tok.ok) {
    return http.sendHtml(res, tok.reason === 'expired' ? 410 : 404, states.downloadExpired(), http.PRIVATE_HEADERS);
  }

  let pdf;
  try {
    pdf = fs.readFileSync(PDF_PATH);
  } catch (err) {
    http.log('dtnt.download.file_missing', { error: err.message });
    return http.sendHtml(res, 503, states.paused(), http.PRIVATE_HEADERS);
  }

  http.log('dtnt.download', { emailHash: tok.data.eh });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Length', String(pdf.length));
  res.setHeader('Content-Disposition', `attachment; filename="${DOWNLOAD_NAME}"`);
  for (const [k, v] of Object.entries(http.PRIVATE_HEADERS)) res.setHeader(k, v);
  return res.end(req.method === 'HEAD' ? undefined : pdf);
};
