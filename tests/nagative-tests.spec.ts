import { test, expect } from "@/fixtures/api-fixture";

[
  {
    username: "dd",
    usernameErrorMsg: "is too short (minimum is 3 characters)",
  },
  { username: "ddd", usernameErrorMsg: "" },
  {
    username: "dddddddddd",
    usernameErrorMsg: "",
  },
  {
    username: "ddddddddddddddddddddddd",
    usernameErrorMsg: "is too long (maximum is 20 characters)",
  },
].forEach(({ username, usernameErrorMsg }) => {
  test(`error msg validations for ${username}`, async ({ api }) => {
    const newUSerResponse = await api
      .path("/users")
      .body({
        user: {
          email: "e",
          password: "p",
          username: `${username}`,
        },
      })
      .clearAuth()
      .postRequest(422);

    console.log(newUSerResponse);
    if (username.length === 3 || username.length === 20) {
      expect(newUSerResponse.errors).not.toHaveProperty("username");
    } else {
      expect(newUSerResponse.errors.username[0]).toBe(usernameErrorMsg);
    }
  });
});
