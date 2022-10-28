const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const bcrypt = require("bcrypt");
const app = express();

app.use(express.json());

const dbPath = path.join(__dirname, "userData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("server running at port 3000");
    });
  } catch ({ e }) {
    console.log(`Dberror:${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//User authentication

app.post("/register/", async (request, response) => {
  const { username, name, password, gender, location } = request.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const selectUserQuery = `
    select * from user
    where username=${username};`;
  const dbUser = await db.get(selectUserQuery);

  if (dbUser === undefined) {
    const newUser = `
        insert into user 
        (username,name,password,gender,location)
        values
        ('${username}',
         '${name}',
          '${hashedPassword}',
          '${gender}',
          '${location}')`;
    await db.run(newUser);
    response.send("User created successfully");
  } else if (dbUser !== undefined) {
    response.status(400);
    response.send("Password is too short");
  } else {
    response.status(400);
    response.send("User already exists");
  }
});
