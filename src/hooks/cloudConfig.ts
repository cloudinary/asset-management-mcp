export class CloudConfig {
    cloudName: string;
    apiKey: string;
    apiSecret: string;

    constructor() {
        this.cloudName = "";
        this.apiKey = "";
        this.apiSecret = "";

        // Access process through globalThis
        const process = (globalThis as any)?.process;

        // First, try to parse CLOUDINARY_URL if it exists
        let envVar: string | undefined = undefined;

        if (process?.env?.CLOUDINARY_URL) {
            envVar = process.env.CLOUDINARY_URL;
        }

        if (envVar) {
            try {
                const url = new URL(envVar);
                this.cloudName = url.host;
                this.apiKey = url.username || "";
                this.apiSecret = url.password || "";
            } catch (error) {
                throw new Error(`Invalid CLOUDINARY_URL: '${envVar}'`);
            }
        }

        // Then, check for individual environment variables (these take precedence)
        if (process?.env) {
            if (process.env.CLOUDINARY_CLOUD_NAME) {
                this.cloudName = process.env.CLOUDINARY_CLOUD_NAME;
            }
            if (process.env.CLOUDINARY_API_KEY) {
                this.apiKey = process.env.CLOUDINARY_API_KEY;
            }
            if (process.env.CLOUDINARY_API_SECRET) {
                this.apiSecret = process.env.CLOUDINARY_API_SECRET;
            }
        }

        // Automatically set CLOUDINARY_CLOUD_NAME if not already set
        // This ensures the SDK can find cloudName during initialization
        if (this.cloudName && process?.env && !process.env.CLOUDINARY_CLOUD_NAME) {
            process.env.CLOUDINARY_CLOUD_NAME = this.cloudName;
        }
    }
}
