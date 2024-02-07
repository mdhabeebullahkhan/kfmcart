const { createSecureHeaders } = require("next-secure-headers");


module.exports = {
    poweredByHeader: false,
    async headers() {
        return [{
            source: '/(.*)',
            // headers: createSecureHeaders({
            //     forceHTTPSRedirect: [true, { maxAge: 63072000, includeSubDomains: true }],
            //     referrerPolicy: "same-origin",
            //     frameGuard: "deny",
            //     noopen: "noopen",
            //     nosniff: "nosniff",
            //     xssProtection: "block-rendering",

            // }),

            headers: [
                // Allow for specific domains to have access or * for all
                {
                  key: "Access-Control-Allow-Origin",
                  value: "*",
                  // DOES NOT WORK
                  // value: process.env.ALLOWED_ORIGIN,
                },
                // Allows for specific methods accepted
                {
                  key: "Access-Control-Allow-Methods",
                  value: "GET, POST, PUT, DELETE, OPTIONS",
                },
                // Allows for specific headers accepted (These are a few standard ones)
                {
                  key: "Access-Control-Allow-Headers",
                  value: "Content-Type, Authorization",
                },
              ],
        }]
    },
}