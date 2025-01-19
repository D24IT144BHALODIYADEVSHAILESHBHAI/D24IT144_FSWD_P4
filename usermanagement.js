const http = require('http');
const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, 'users.json');
function getUsers() {
    if (!fs.existsSync(usersFile)) {
        fs.writeFileSync(usersFile, '[]');
    }
    const data = fs.readFileSync(usersFile, 'utf8');
    return JSON.parse(data);
}

function saveUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}
const server = http.createServer((req, res) => {
    const method = req.method;
    const url = req.url;

    if (url === '/users' && method === 'GET') {
        const users = getUsers();
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(users));
    } else if (url === '/users' && method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk;
        });
        req.on('end', () => {
            const newUser = JSON.parse(body);
            const users = getUsers();
            newUser.id = Date.now();
            users.push(newUser);
            saveUsers(users);
            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(newUser));
        });
    } else if (url.startsWith('/users/') && method === 'DELETE') {
        const id = parseInt(url.split('/')[2]);
        const users = getUsers();
        const newUsers = users.filter((user) => user.id !== id);

        if (users.length === newUsers.length) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'User not found' }));
        } else {
            saveUsers(newUsers);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'User deleted successfully' }));
        }
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Route not found' }));
    }
});
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});