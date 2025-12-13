export class Logger {
  constructor(private readonly context: string) {}

  log(message: string) {
    console.log(`[${this.context}] ${message}`);
  }

  error(message: string, error?: any) {
    console.error(`[${this.context}] ${message}`, error || '');
  }

  warn(message: string) {
    console.warn(`[${this.context}] ${message}`);
  }
}
