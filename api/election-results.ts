import 'reflect-metadata';
import { NowRequest, NowRequestBody, NowResponse } from '@vercel/node';
import { getBotTokenOrError, validateFromSlack } from '../src/helpers/helpers';
import { SlackUser } from '../src/models/slack-user';
import { logger } from '../src/logging/LoggerService';
import { Methods } from '../src/models/types';
import { getElectionResults } from '../src/api';

export default async (request: NowRequest, response: NowResponse): Promise<NowResponse> => {
  const validationErr = await validateFromSlack(request, response);
  if (validationErr) return validationErr;

  const token = getBotTokenOrError(response);
  if (typeof token !== 'string') return token;
  const user = new SlackUser(token);

  logger.info(`${request?.method ?? 'UNKNOWN METHOD'} ${request?.url}`);

  if (request?.method !== Methods.POST) return response.status(405).send('Method Not Allowed');

  const body: NowRequestBody = request?.body;

  const { status, body: responseBody } = await getElectionResults(user, body);
  return response.status(status).send(responseBody);
};
