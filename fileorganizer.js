const http = require("http");
const fs = require("fs");
const path = require("path");

// Path to the JSON file for storing user data
const dataFilePath = path.join(__dirname, "users.json");

// Initialize the JSON file if it doesn't exist
if (!fs.existsSync(dataFilePath)) {
  fs.writeFileSync(dataFilePath, JSON.stringify([]), "utf8");
}

// Helper function to read users from the file
const readUsers = () => {
  const data = fs.readFileSync(dataFilePath, "utf8");
  return JSON.parse(data);
};

// Helper function to write users to the file
const writeUsers = (users) => {
  fs.writeFileSync(dataFilePath, JSON.stringify(users, null, 2), "utf8");
};

// Create HTTP server
const server = http.createServer((req, res) => {
  const urlParts = req.url.split("/");
  const method = req.method;

  // Handle GET /users
  if (method === "GET" && req.url === "/users") {
    const users = readUsers();
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(users));
  }

  // Handle POST /users
  else if (method === "POST" && req.url === "/users") {
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      try {
        const newUser = JSON.parse(body);
        if (!newUser.id || !newUser.name) {
          res.writeHead(400, { "Content-Type": "application/json" });
          return res.end(JSON.stringify({ error: "Invalid user data" }));
        }

        const users = readUsers();
        users.push(newUser);
        writeUsers(users);

        res.writeHead(201, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "User added successfully" }));
      } catch (err) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid JSON format" }));
      }
    });
  }

  // Handle DELETE /users/:id
  else if (method === "DELETE" && urlParts[1] === "users" && urlParts[2]) {
    const userId = urlParts[2];
    const users = readUsers();
    const filteredUsers = users.filter((user) => user.id !== userId);

    if (filteredUsers.length === users.length) {
      res.writeHead(404, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "User not found" }));
    }

    writeUsers(filteredUsers);
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "User deleted successfully" }));
  }

  // Handle unsupported routes
  else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found" }));
  }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
