const ENV = process.env.TEST_ENV;
const env = ENV || "dev";

const config = {
  apiUrl: "https://conduit-api.bondaracademy.com/api/",
  userEmail: "abhishek.sharma211093@gmail.com",
  userPwd: "Test12345",
};

if (env === "qa") {
  config.userEmail = "qa@gmail.com";
  config.userPwd = "";
}

if (env === "prod") {
  config.userEmail = "prod@gmail.com";
  config.userPwd = "";
}
export { config };
