import http from "http";
import os from "os";
import fs from "node:fs/promises";
const filePath = "userData.json";
async function createFile(data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log("File created successfully");
  } catch (err) {
    console.log(err);
  }
}
async function readFile() {
  try {
    const content = await fs.readFile(filePath, "utf8");
    const data = JSON.parse(content);
    return data;
  } catch (err) {
    console.log(err);
    return [];
  }
}
async function run() {
  try {
    await fs.access(filePath);
  } catch {
    await createFile([
      { Name: "Akshat", Role: "Developer" },
      { Name: "Akarsh", Role: "Designer" },
      { Name: "Ansh", Role: "Manager" },
    ]);
  }
  const server = http.createServer(async (req, res) => {
    const url = req.url;
    const method = req.method;
    if (url === "/msg" && method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "text/plain");
      res.end("Hello World");
    } else if (url === "/sys" && method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      const sysInfo = {
        platform: os.platform(),
        uptime: os.uptime(),
      };
      res.end(JSON.stringify(sysInfo));
    } else if (url === "/employee" && method === "GET") {
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      const employees = await readFile();
      res.end(JSON.stringify(employees));
    } else if (url === "/create" && method === "POST") {
      let body = "";
      req.on("data", (chunk) => {
        body += chunk.toString();
      });
      req.on("end", async () => {
        try {
          const user = JSON.parse(body);
          const array = await readFile();
          array.push(user);
          await createFile(array);
          res.statusCode = 201;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: "User added successfully",
              user: user,
            }),
          );
          console.log(array);
        } catch (err) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(
            JSON.stringify({
              message: "Invalid JSON",
            }),
          );
        }
      });
    } else {
      res.statusCode = 404;
      res.setHeader("Content-Type", "text/plain");
      res.end("Route Not Found");
    }
  });
  const port = 3000;
  server.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
  });
}
run();
request.on