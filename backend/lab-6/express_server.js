import express from "express";
import cors from "cors";

const app = express();
const port = 3002;

app.use(cors());
app.use(express.json());

const users = [
  {
    id: 1,
    name: "Aniket",
    email: "aniket@example.com"
  }
];

const userRouter = express.Router();

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Welcome to the Express server!"
  });
});

app.get("/users", (req, res) => {
  try {
    res.status(200).json({
      message: "data received",
      userData: users
    });
  } catch (error) {
    res.status(500).json({
      message: "Error",
      error: error.message
    });
  }
});

app.get("/user/:id", (req, res) => {
  try {
    const id = req.params.id;

    const user = users.find((u) => u.id == id);

    if (!user) {
      return res.status(400).json({
        message: "user not found "
      });
    }

    res.status(200).json({
      message: "data received",
      user
    });
  } catch (err) {
    console.error("Error", err.message);
  }
});

app.put("/edit/:id", (req, res) => {
  try {
    const id = req.params.id;
    const { name, email } = req.body;

    const user = users.findIndex((u) => u.id == id);

    if (user === -1) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    users[user] = {
      id,
      name,
      email
    };

    return res.status(200).json({
      message: "User updated",
      user: users[user]
    });
  } catch (err) {
    console.error("Error", err.message);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

app.delete("/delete/:id", (req, res) => {
  try {
    const id = req.params.id;

    const userIndex = users.findIndex((u) => u.id == id);

    if (userIndex === -1) {
      return res.status(400).json({
        message: "User not found"
      });
    }

    users.splice(userIndex, 1);

    return res.status(200).json({
      message: "User deleted"
    });
  } catch (err) {
    console.error("Error", err.message);

    return res.status(500).json({
      message: "Internal server error"
    });
  }
});

userRouter.get("/", (req, res) => {
  res.json(users);
});

userRouter.get("/:id", (req, res) => {
  const user = users.find(
    (item) => item.id === Number(req.params.id)
  );

  if (!user) {
    return res.status(404).json({
      message: "User not found"
    });
  }

  res.json(user);
});

userRouter.post("/", (req, res) => {
  const { name, email } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      message: "Name and email are required"
    });
  }

  const newUser = {
    id: users.length + 1,
    name,
    email
  };

  users.push(newUser);

  res.status(201).json({
    message: "User created",
    user: newUser
  });
});

app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.json({
    message: "Express server is running"
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});