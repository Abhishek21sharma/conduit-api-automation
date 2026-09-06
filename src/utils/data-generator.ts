import { faker } from "@faker-js/faker";
import articleRequestPayload from "@/request-objects/post-article.json";

export function getNewRandomArticle() {
  const articleRequest = structuredClone(articleRequestPayload);
  articleRequest.article.title = faker.lorem.sentence(5);
  articleRequest.article.description = faker.lorem.sentence(5);
  articleRequest.article.body = faker.lorem.paragraph(3);
  return articleRequest;
}
