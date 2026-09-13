declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    OWNER_BOOTSTRAP_EMAIL?: string;
    BUCKET?: R2Bucket;
  }
}
