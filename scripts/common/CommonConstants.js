// @ts-check

const { host } = window.location;

export const isDev = host === 'localhost:3000';

export const isProd = !isDev;

// DEBUG = useDebug -- specify debug mode. Don't use it for production!
export const useDebug = true && isDev;

/** Timestamp ticks for one day (24 hours) */
export const dailyTicks = 24 * 60 * 60 * 1000;
