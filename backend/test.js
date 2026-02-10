const admin = require("./config/firebase");

async function test() {
  try {
    const user = await admin.auth().createUser({
      email: "testuser@example.com",
      password: "123456",
      displayName: "Test User"
    });
    console.log("User created:", user.uid);
  } catch (err) {
    console.error(err);
  }
}

test();
