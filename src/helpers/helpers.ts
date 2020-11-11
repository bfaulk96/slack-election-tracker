import { FunctionResults, Maybe } from '../models/types';
import { NowRequest, NowResponse } from '@vercel/node';
import { logger } from '../logging/LoggerService';
import { createHmac, timingSafeEqual } from 'crypto';

export async function validateFromSlack(
  req: NowRequest,
  res: NowResponse
): Promise<Maybe<NowResponse>> {
  try {
    const signingSecret = process.env.SIGNING_SECRET ?? '';
    const bodyStr = await streamToString(req);
    // logger.debug(`Headers: ${JSON.stringify(req.headers, null, 2)}`);
    const ts = parseInt((req.headers['x-slack-request-timestamp'] as string) ?? '0');
    const slackSignature: string = req.headers['x-slack-signature'] as string;

    if (!ts || !slackSignature) {
      const message = 'Missing required headers';
      logger.error(message);
      return res.status(403).send(message);
    }

    const FIVE_MINUTES = 300000; // 60 * 5 * 1000
    if (Math.abs(Date.now() - ts * 1000) > FIVE_MINUTES) {
      const message = 'Blocking potential replay attack';
      logger.error(message);
      return res.status(403).send(message);
    }

    const signatureBaseStr = `v0:${ts}:${bodyStr}`;
    const signature =
      'v0=' + createHmac('sha256', signingSecret).update(signatureBaseStr).digest('hex');
    if (!timingSafeEqual(Buffer.from(slackSignature, 'utf8'), Buffer.from(signature, 'utf8'))) {
      const message = 'Invalid signature';
      logger.error(message);
      return res.status(403).send(message);
    }

    return null;
  } catch (e) {
    logger.error(`An error occurred validating caller: ${e}`);
    return res.status(500).send('Error validating caller');
  }
}

async function streamToString(stream: NowRequest) {
  const chunks: Uint8Array[] = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk: Uint8Array) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
  });
}

export function getBotTokenOrError(response: NowResponse): string | NowResponse {
  const BOT_TOKEN = process.env.BOT_TOKEN;
  if (!BOT_TOKEN) {
    logger.crit('Cannot run app without bot user token');
    return response.status(500).send('Internal Server Error');
  }
  return BOT_TOKEN;
}

export function respondToHandshake(
  body: any, // eslint-disable-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  response: FunctionResults
): Maybe<FunctionResults> {
  const challenge = body?.value?.challenge ?? body?.challenge;
  if (challenge) {
    response.body = { challenge };
    return response;
  }
}
