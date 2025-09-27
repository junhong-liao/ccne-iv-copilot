type LogMeta = Record<string, unknown> | undefined;

function formatMeta(meta?: LogMeta) {
  if (!meta) return "";
  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
}

export const logger = {
  info(event: string, meta?: LogMeta) {
    console.info(`[${event}]`, formatMeta(meta));
  },
  error(event: string, meta?: LogMeta) {
    console.error(`[${event}]`, formatMeta(meta));
  },
};

