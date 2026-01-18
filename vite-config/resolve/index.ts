import { type UserConfig } from 'vite';
import { alias } from './alias';

type ResolveConfig = UserConfig['resolve'];

export const resolve: ResolveConfig = {
  alias,
};
export * from './alias';
