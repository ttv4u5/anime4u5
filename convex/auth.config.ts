import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: 'https://login.example.com',
      applicationID: 'mock-id',
    },
  ],
} satisfies AuthConfig;
