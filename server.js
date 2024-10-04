const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const methodsPath = path.join(__dirname, 'Methods');

// Function to recursively get all files in a directory
function getFiles(dir) {
    let files = [];
    fs.readdirSync(dir).forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            files = files.concat(getFiles(filePath));
        } else {
            files.push(filePath);
        }
    });
    return files;
}

// Get all files in the Methods directory and its subdirectories
const files = getFiles(methodsPath);

// Use each file as a router
files.forEach(file => {
    const router = require(file);
    const routePath = `/${path.basename(file, path.extname(file))}`;
    
    console.log(`Setting up route: ${routePath} -> ${file}`);
    
    app.use(routePath, router);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;