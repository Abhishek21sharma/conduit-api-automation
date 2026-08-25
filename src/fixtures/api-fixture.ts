import { RequestHandler } from "@/utils/request-handler";
import { test as base, expect } from "@playwright/test";

export type TestOptions = {
  api: RequestHandler;
};

export const test = base.extend<TestOptions>({
  api: async ({ request }, use) => {
    const baseURL = "https://conduit-api.bondaracademy.com/api/";
    const requestHandler = new RequestHandler(request, baseURL);
    await use(requestHandler);
  },
});

export { expect } from "@playwright/test";
