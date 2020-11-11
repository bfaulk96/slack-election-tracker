import { Candidate } from './candidate';
import { Expose, Type } from 'class-transformer';
import { Maybe } from './types';

export class Election {
  @Expose({ name: 'race_rating' })
  raceRating = ''; // Which way the race is leaning, dem or rep
  @Expose({ name: 'state_id' })
  stateId = ''; // state code
  @Expose({ name: 'state_name' })
  stateName = '';
  @Expose()
  votes = 0;
  @Expose({ name: 'electoral_votes' })
  electoralVotes = 0;
  @Expose({ name: 'precincts_reporting' })
  precinctsReporting = 0;
  @Expose({ name: 'precincts_total' })
  precinctsTotal = 0;
  @Expose({ name: 'reporting_value' })
  reportingValue = ''; // Percentage reporting (appears as a string because value is "X%")
  @Expose({ name: 'leader_margin_votes' })
  leaderMarginVotes = 0; // number of votes leading candidate is winning by
  @Type(() => Candidate)
  @Expose()
  candidates: Candidate[] = [];

  constructor(rawRace: Partial<Election>) {
    Object.assign(this, rawRace);
  }

  getCandidateByName(lastName: string): Maybe<Candidate> {
    return this.candidates.find(
      (c): boolean => c.lastName?.toLowerCase() === lastName?.toLowerCase()
    );
  }
}
