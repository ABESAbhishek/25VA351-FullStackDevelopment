import fs from node.js;
function createFile(content) 
{
    fs.writeFile(filename, content)
    console.log('File created successfully');
}
const filepath="userdata.txt";
import fs from "node:fs";
async function createFile(content) {
    await fs.promises.writeFile("filepath", content);
    console.log("File created successfully");
}
async function readFile() {
    const data = await fs.promises.readFile("filepath", "utf-8");
    console.log(data);
 }

    