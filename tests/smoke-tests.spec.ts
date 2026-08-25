import { RequestHandler } from "@/utils/request-handler";
import { expect, test } from "@/fixtures/api-fixture";

test("Get Article", async ({ api }) => {
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  console.log(response);
  expect(response.articles.length).toBeLessThanOrEqual(10);
});
