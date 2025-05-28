import { development, production } from '../app.config';

export const config = process.env.NODE_ENV === 'production' ? production : development;
