// import { logger } from '../logging/LoggerService';
// import fetch from 'node-fetch';
// import { SlackUser } from '../models/slack-user';
//
// export async function addMultipleReactions(
//   user: SlackUser,
//   channel: string,
//   timestamp: string,
//   emojis: string[]
// ): Promise<void> {
//   for (const emoji of emojis) {
//     await getData(user, channel, timestamp, emoji);
//   }
// }
//
// // React to a message in Slack
// export async function getData(
//   user: SlackUser,
//   channel: string,
//   timestamp: string,
//   name: string
// ): Promise<unknown> {
//   try {
//     const url = 'https://slack.com/api/reactions.add';
//
//     const response = await fetch(url, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json; charset=utf-8',
//         Authorization: `Bearer ${user.token}`,
//       },
//       redirect: 'follow', // manual, *follow, error
//       body: JSON.stringify({
//         channel,
//         name,
//         timestamp,
//       }),
//     });
//
//     const jsonResponse = await response.json();
//     if (!jsonResponse.ok)
//       logger.error(`Slack responded with an error: ${JSON.stringify(jsonResponse)}`);
//     else logger.debug(JSON.stringify(jsonResponse));
//     return jsonResponse;
//   } catch (e) {
//     logger.error(`Error occurred calling Slack API: ${e}`);
//     return { success: false };
//   }
// }

import { stateCodes, stateNames } from '../models/states';
import { Election } from '../models/election';
import { plainToClass } from 'class-transformer';

export async function stateToRace(state: string): Promise<Election> {
  state = state.toLowerCase();
  // Try to find by state code first
  if (!stateCodes.some((stateCode: string): boolean => stateCode.toLowerCase() === state)) {
    // Then try to find by name
    state = stateNames[state]?.toLowerCase();
    if (!state) {
      // If neither are found, then the user fucked up
      throw new Error(`Invalid state provided: '${state}'`);
    }
  }

  const res = await fetch(
    'https://static01.nyt.com/elections-assets/2020/data/api/2020-11-03/national-map-page/national/president.json'
  );
  const json = await res.json();

  const race: Partial<Election> = json.data.races.find(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (race: Record<string, any>): boolean => race.state_id?.toLowerCase() === state
  );

  if (!race) {
    throw new Error('What the heck, is this a new state??');
  }

  return plainToClass(Election, race, { excludeExtraneousValues: true });
}
