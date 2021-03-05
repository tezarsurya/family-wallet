declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DB_URL: string;
      JWT_SECRET: string;
      PORT: string;
      SMTP_HOST: string;
      SMTP_PORT: string;
      SMTP_USERNAME: string;
      SMTP_PASSWORD: string;
    }
  }
}

export {};
