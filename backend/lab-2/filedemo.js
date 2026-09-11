import fs, { appendFile } from "node:fs";
const filepath = "userdata.txt";

async function createfile(content) {
    try {
        await fs.promises.writeFile(filepath, content);
        console.log("File created");
    } catch (error) {
        console.log("Error creating file");
    }
}
async function readfile() {
    try {
        const data = await fs.promises.readFile(filepath, "utf8");
        console.log(data);
    } catch (error) {
        console.log("Error reading file");
    }
}
await createfile("Hello World");
await readfile();
appendFile(filepath, "\nHello World", (err) => {
    if (err) {
        console.log("Error appending to file");
    } else {
        console.log("Data appended to file");
    }
});
function deletefile() {
    fs.unlink(filepath, (err) => {
        if (err) {
            console.log("Error deleting file");
        } else {
            console.log("File deleted");
        }
    });
}