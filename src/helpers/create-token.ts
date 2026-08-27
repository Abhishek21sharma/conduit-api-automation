import { APILogger } from "@/utils/logger";
import { RequestHandler } from "@/utils/request-handler";
import { config } from "../../api-test.config";
import { request } from "playwright";

/**
 *
 * @param email
 * @param passwrod
 * @returns token
 * @author Abhishek
 */
export async function createToken(email: string, passwrod: string) {
  const context = await request.newContext();
  const logger = new APILogger();
  const api = new RequestHandler(context, config.apiUrl, logger);
  try {
    const tokenResponse = await api
      .path("/users/login")
      .body({
        user: {
          email: email,
          password: passwrod,
        },
      })
      .postRequest(200);
    return "Token " + tokenResponse.user.token;
  } catch (error) {
    Error.captureStackTrace(error as object, createToken);
    throw error;
  } finally {
    await context.dispose();
  }
}
