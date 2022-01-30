const vision = require('@google-cloud/vision');
const { rejects } = require('assert');
const fs = require('fs')

const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const hbs = require('hbs');
const multer  = require('multer')

// Creates a client
const client = new vision.ImageAnnotatorClient();

/**
 * TODO(developer): Uncomment the following line before running the sample.
 */

// Performs text detection on the local file

async function getbboxes(fileName) {
    let bboxes = [];
    const [result] = await client.textDetection("public/" + fileName);
    const detections = result.textAnnotations;
    detections.forEach(text => bboxes.push(text['boundingPoly']['vertices']));
    bboxes.shift();
    return bboxes;
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads');
    },
    filename: (req, file, cb) => {
        const { originalname } = file;
        cb(null, originalname);
    }
});

const upload = multer({ storage });

app.set("view engine", "hbs")
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get("/", (req, res) => {
    res.render("index")
})

app.post("/", upload.single('upload_image'), async (req, res) => {
    var reqContent = req.file
    var fileName = reqContent.filename
    var file = 'uploads/' + fileName
    console.log(file);
    let bboxes = await getbboxes(file);
    res.render("solution", {fileName: file, bbox_str: JSON.stringify(bboxes)});
})

app.get("/solution", (req, res) => {
    res.render("solution")
})

app.listen(3000, () => {
    console.log("listening for requests on port 3000")
})