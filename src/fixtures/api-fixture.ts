import { APILogger } from "@/utils/logger";
import { RequestHandler } from "@/utils/request-handler";
import { test as base, expect } from "@playwright/test";
import { config } from "../../api-test.config";
import { createToken } from "@/helpers/create-token";

export type TestOptions = {
  api: RequestHandler;
  Config: typeof config;
};

/**
 * Worker Level scope fixture
 */
export type WorkerScopeOptions = {
  authtoken: string;
};

/**
 * @authtoken  - scope: worker level, create token
 * @api - scope: test level, accepts: request (From playwright), authToken: previous fixture
 * returns: Object of RequestHandler class to work with different APIs
 * @config - scope: test level, use for user/pwd
 */
export const test = base.extend<TestOptions, WorkerScopeOptions>({
  authtoken: [
    async ({}, use) => {
      const authToken = await createToken(config.userEmail, config.userPwd);
      await use(authToken);
    },
    { scope: "worker" },
  ],

  api: async ({ request, authtoken }, use) => {
    const baseURL = "https://conduit-api.bondaracademy.com/api/";
    const logger = new APILogger();
    const requestHandler = new RequestHandler(
      request,
      baseURL,
      logger,
      authtoken,
    );
    await use(requestHandler);
  },
  Config: async ({}, use) => {
    await use(config);
  },
});

export { expect } from "@playwright/test";
