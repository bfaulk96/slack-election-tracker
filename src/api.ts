import { logger } from './logging/LoggerService';
import { SlackUser } from './models/slack-user';
import { FunctionResults } from './models/types';
import { respondToHandshake } from './helpers/helpers';
import { SlackSlashCommandBody } from './models/slack-event';
import { stateToRace } from './actions/actions';

export async function getElectionResults(
  user: SlackUser,
  body: SlackSlashCommandBody
): Promise<FunctionResults> {
  try {
    const response: FunctionResults = { status: 200, body: { success: true } };

    // Respond to slack handshake if necessary
    const handshake = respondToHandshake(body, response);
    if (handshake) return handshake;

    const text = body.text?.toLowerCase() ?? '';

    try {
      const results = await stateToRace(text);
      logger.info(JSON.stringify(results, null, 2));

      // response.body = {
      //   response_type: 'in_channel',
      //   text: results,
      // };
    } catch (e) {
      logger.error(e);
      // response.body = {
      //   response_type: 'ephemeral',
      //   text: 'Internal Server Error',
      // };
    }

    return response;
  } catch (e) {
    logger.error(`Error occurred: ${e}`);
    return {
      status: 200,
      body: {
        response_type: 'ephemeral',
        text: 'Internal Server Error',
      },
    };
  }
}
