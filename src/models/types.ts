import { ObjectId } from 'mongodb';

export type EmojiMappings = Record<string, string | undefined>;

export interface EmojiMappingsDbo {
  _id: ObjectId;
  teamId: string;
  mappings: EmojiMappings;
  created: Date;
  lastUpdated: Date;
}

export interface FunctionResults {
  status: number;
  body: string | any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export enum Methods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
}

export const CommandTypes = {
  ADD: ['add', 'a', 'new', 'create', 'n', 'c'],
  REMOVE: ['delete', 'remove', 'r', 'd'],
  UPDATE: ['update', 'u', 'overwrite', 'change'],
  BULK_ADD: ['bulk-add', 'ba'],
  BULK_REMOVE: ['bulk-remove', 'br'],
};

export type Maybe<T> = T | undefined | null;
