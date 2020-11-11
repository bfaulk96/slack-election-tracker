import { Expose } from 'class-transformer';

export class Candidate {
  @Expose({ name: 'last_name' })
  lastName = ''; // "Biden"
  @Expose()
  votes = 0;
  @Expose()
  percent = 0;
  @Expose({ name: 'absentee_votes' })
  absenteeVotes = 0;
  @Expose({ name: 'absentee_percent' })
  absenteePercent = 0;
  @Expose()
  pronoun = '';

  constructor(rawCandidate: Partial<Candidate>) {
    Object.assign(this, rawCandidate);
  }
}
