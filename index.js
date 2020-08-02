const express = require("express");
const app = express();
const pg = require("./sql/pg.js");
const s3 = require("./s3.js");
const { s3Url } = require("./config.json");

app.use(express.static("public"));
app.use(express.json());

//////////////////////////////////////////////////////////////////////////////////////////////
////////////////////// File upload boilerplate - DON'T TOUCH /////////////////////////////////
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then(function (uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});
//////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////// Routes ///////////////////////////////////////////////////////////////
app.get("/images", async (req, res) => {
    let result;
    try {
        result = await pg.getImages(req.query.cursor, req.query.limit);
    } catch (err) {
        console.log(err);
    }

    res.json(result.rows);
});

app.get("/image/:id", async (req, res) => {
    let result;
    try {
        result = await pg.getImageData(req.params.id);
    } catch (err) {
        console.log(err);
    }

    res.json(result.rows[0]);
});

app.get("/comments/:id", async (req, res) => {
    let result;
    try {
        result = await pg.getComment(req.params.id);
    } catch (err) {
        console.log(err);
    }

    res.json(result.rows);
});

app.post("/comment", async (req, res) => {
    console.log("req.body", req.body);

    let result;
    try {
        result = await pg.addComment(
            req.body.imageId,
            req.body.username,
            req.body.comment
        );
    } catch (err) {
        console.log(err);
    }
    console.log(result.rows[0]);
    res.json(result.rows[0]);
});

app.post("/upload", uploader.single("file"), s3.upload, async (req, res) => {
    const { filename } = req.file;
    const imageUrl = s3Url + filename;

    if (req.file) {
        let result;
        try {
            result = await pg.addImage(
                imageUrl,
                req.body.username,
                req.body.title,
                req.body.description
            );
        } catch (err) {
            console.log(err);
        }

        res.json(result.rows[0]);
    } else {
        res.json({
            success: false,
        });
        console.log("error in POST");
    }
});

app.listen(8080, () => console.log("Listening"));
