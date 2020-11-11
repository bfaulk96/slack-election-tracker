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
      const res = await stateToRace(text);
      logger.info(JSON.stringify(res, null, 2));

      let emojiIndicator = ':large_blue_circle:';
      let lean = 'Democrat';

      if (!res.raceRating.includes('lean-dem')) {
        emojiIndicator = ':red_circle:';
        lean = 'Republican';
      }

      const firstSection = `${emojiIndicator} ${res.stateName} is currently leaning *${lean}* by a margin of *${res.leaderMarginVotes}* votes (${res.reportingValue} reporting)`;
      const metaData = `State's EVs: ${res.electoralVotes} | Total Votes: ${res.votes}`;

      const candidateSections = res.candidates
        .filter((c) => c.lastName.toLowerCase() !== 'write-ins' && c.percent > 0.5)
        .map((c) => ({
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `*${c.lastName}*: ${c.votes} votes (${c.percent}%) – ${c.absenteeVotes} absentee votes (${c.absenteePercent}%)`,
          },
        }));

      response.body = {
        response_type: 'in_channel',
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: `${firstSection}\n${metaData}`,
            },
          },
          {
            type: 'divider',
          },
          ...candidateSections,
        ],
      };
    } catch (e) {
      logger.error(e);
      response.body = {
        response_type: 'ephemeral',
        text: e.toString(),
      };
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
