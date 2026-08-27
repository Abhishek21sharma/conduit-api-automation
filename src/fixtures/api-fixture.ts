import { APILogger } from "@/utils/logger";
import { RequestHandler } from "@/utils/request-handler";
import { test as base, expect } from "@playwright/test";
import { config } from "../../api-test.config";

export type TestOptions = {
  api: RequestHandler;
  Config: typeof config;
};

export const test = base.extend<TestOptions>({
  api: async ({ request }, use) => {
    const baseURL = "https://conduit-api.bondaracademy.com/api/";
    const logger = new APILogger();
    const requestHandler = new RequestHandler(request, baseURL, logger);
    await use(requestHandler);
  },
  Config: async ({}, use) => {
    await use(config);
  },
});

export { expect } from "@playwright/test";
