import { RequestHandler } from "@/utils/request-handler";
import { expect, test } from "@/fixtures/api-fixture";
import { APILogger } from "@/utils/logger";
import { createToken } from "@/helpers/create-token";
import articleRequestPayload from "@/request-objects/post-article.json";

// let authToken: string;

// test.beforeAll("Get Token", async ({ api, Config }) => {
//   authToken = await createToken(Config.userEmail, Config.userPwd);
// });

test("Get Article", async ({ api }) => {
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  console.log(response);
  expect(response.articles.length).toBeLessThanOrEqual(10);
});

test("logger", () => {
  const logger = new APILogger();
  logger.logRequest(
    "Get",
    "https://example.com/",
    { Authorization: "Token" },
    { data: "value" },
  );

  logger.logResponse(200, { data: "value", id: "AA0X99L45JJOKP0234" });

  const logs = logger.getRecentLogs();
  console.log(logs);
});

test("Create and Delete Article", async ({ api }) => {
  //for Ci stablity - best to create it's own object
  const dataRequest = JSON.parse(JSON.stringify(articleRequestPayload));
  dataRequest.article.title = "updated title";

  //or we can use this: DOT operation will work good
  const dataRequestUpdated = structuredClone(articleRequestPayload);
  dataRequestUpdated.article.title = "updated title";
  const createArticleResponse = await api
    .path("/articles")
    //.headers({ Authorization: authToken }) --> this is by default handled in the request
    .body(articleRequestPayload)
    .postRequest(201);

  expect(createArticleResponse.article.title).toEqual("Name1");
  const slugId = createArticleResponse.article.slug;

  const articleResponse = await api
    .path("/articles")
    // .headers({ Authorization: authToken }) --> by default handled in the request
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  console.log("article reponse is: " + articleResponse);

  expect(articleResponse.articles[0].title).toEqual("Name1");

  await api
    .path(`/articles/${slugId}`)
    //.headers({ Authorization: authToken }) --> by default handled in the request
    .delRequest(204);

  const articleResponseTwo = await api
    .path("/articles")
    // .headers({ Authorization: authToken }) --> by default handled in the request
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articleResponseTwo.articles[0].title).not.toEqual("Name1");
});
