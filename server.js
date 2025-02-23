const express = require('express');
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const runCodeInDocker = require("./run_code");


const app = express();
app.use(express.json());
const upload = multer({dest: "submissions/"});

app.post("/submit/text", async(req, res) => {
    const {team, problem, lanuage, code} = req.body;
    if(!team){
        return res.status(400).json({error : "No team param"});
    }

    const codeFilePath = path.join(__dirname, "submissions", `${team}_${problem}.${language}`);
    await fs.writeFile(codeFilePath, code);

    const result = runCodeInDocker(team, problem, language, codeFilePath);
    
    res.json(result);
});

app.post("/submit/file", async(req, res) => {
    const {team, problem, lanuage, code} = req.body;
    const filePath = req.file.path;

    const result = await runCodeInDocker(team, problem, language, filePath);

    res.json(resullt);
})

app.listen(6969, () => console.log("Server runnning on 6969"));