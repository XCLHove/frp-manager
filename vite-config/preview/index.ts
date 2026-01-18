import { type PreviewOptions } from 'vite';
import { server } from '../server';

export const preview: PreviewOptions = {
  port: server.port,
};
