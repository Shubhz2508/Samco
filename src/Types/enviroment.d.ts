//Environment variable types

declare global {
    namespace NodeJS {
      interface ProcessEnv {
        NODE_ENV: "development" | "production";
        PORT?: string;
        LOGSDB: string;
        USER_SEQUEL_URL: string;
        BROKERS_SEQUEL_URL: string;
        HIDE_JWT_SECRET: string;
        JWT_SECRET: string;
        SAMCO_APP_ID: string;
        SAMCO_APP_SECRET: string;
        DEMAT_SECRET: string;
        ANGLETACTICURL: string;
        REDIS_CONN: string;
      }
    }
  }
  
  // If this file has no import/export statements (i.e. is a script)
  // convert it into a module by adding an empty export statement.
  export {};