import { RequestHandler } from "@/utils/request-handler";
import { expect, test } from "@/fixtures/api-fixture";
import { APILogger } from "@/utils/logger";

let authToken: string;

test.beforeAll("Get Token", async ({ api }) => {
  const tokenResponse = await api
    .path("/users/login")
    .body({
      user: {
        email: "abhishek.sharma211093@gmail.com",
        password: "Test12345",
      },
    })
    .postRequest(200);

  authToken = "Token " + tokenResponse.user.token;
});

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
  const createArticleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .body({
      article: {
        title: "Name1",
        description: "It's a test article",
        body: "this will be created in flight by playwright automation..",
        tagList: ["EarlyBirds"],
      },
    })
    .postRequest(201);

  expect(createArticleResponse.article.title).toEqual("Name1");
  const slugId = createArticleResponse.article.slug;

  const articleResponse = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  console.log("article reponse is: " + articleResponse);

  expect(articleResponse.articles[0].title).toEqual("Name1");

  await api
    .path(`/articles/${slugId}`)
    .headers({ Authorization: authToken })
    .delRequest(204);

  const articleResponseTwo = await api
    .path("/articles")
    .headers({ Authorization: authToken })
    .params({ limit: 10, offset: 0 })
    .getRequest(200);

  expect(articleResponseTwo.articles[0].title).not.toEqual("Name1");
});
