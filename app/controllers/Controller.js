const Photo = require("../models/model");
const path = require("path");
const formidable = require("formidable");
const fs = require("fs");
const imageSize = require("image-size");

require('dotenv').config()

module.exports = {
    showUploadHome: showUploadHome,
    showEdit: showEdit,
    loadSizeToolMenu: loadSizeToolMenu,
    loadBlurMenu: loadBlurMenu,
    loadFilterToolMenu: loadFilterToolMenu,
    loadNoiseToolMenu: loadNoiseToolMenu,
    saveImage: saveImage,
    retrieveImage: retrieveImage
};

// Show the upload home page
function showUploadHome(req, res) {
    res.render("upload_home");
}

// Show the edit page
function showEdit(req, res) {
    res.render("edit_page");
}

// Load the size tool menu
function loadSizeToolMenu(req, res) {
    res.render("size_tool_menu");
}

// Load the blur menu
function loadBlurMenu(req, res) {
    res.render("blur_tool_menu");
}

// Load the noise menu
function loadNoiseToolMenu(req, res) {
    res.render("noise_tool_menu");
}

// Load the filter tool menu
function loadFilterToolMenu(req, res) {
    res.render("filter_tool_menu");
}

// Save the image to the database.
function saveImage(req, res) {
    let form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, "/../../uploads");

    form.on("file", function(name, file) {
        // UPLOADS_LOCAL_PATH is an env variable (your project's path to the uploads folder)
        const localPath = process.env.UPLOADS_LOCAL_PATH;
        let localFileName = file.path.replace(localPath, "");

        imageSize("uploads/" + localFileName, function(err, dimensions) {
            if (!err) {
                let w = dimensions.width;
                let h = dimensions.height;

                let data = new Photo({
                    "fileName": file.name,
                    "filePath": "uploads/" + localFileName,
                    "width": w,
                    "height": h
                });

                console.log(data);
                data.save((error, _) => {
                    if (error)
                        return res.sendStatus(400);
                    else {
                        console.log('Created', data.fileName);
                        res.status(201).send();
                    }
                })
            }
        })
    });

    form.on('error', function(err) {
        console.log('Error occurred during processing - ' + err);
    });

    // Invoked when all the fields have been processed.
    form.on('end', function() {
        console.log('All the request fields have been processed.');
    });

    // Parse the incoming form fields.
    form.parse(req, function(err, fields, files) {
        res.status(200).send();
    });
}

// Retrieve the image from the database
function retrieveImage(req, res) {
    let fileName = req.query.q;
    console.log(fileName);
    Photo.find({ "fileName": fileName }, (error, data) => {
        if (error) {
            return next(error);
        }

        // Delete the _filtered and _modified files of the image
        if (fs.existsSync(data[0].filePath + "_filtered")) {
            fs.unlinkSync(data[0].filePath + "_filtered");
        }
        if (fs.existsSync(data[0].filePath + "_modified")) {
            fs.unlinkSync(data[0].filePath + "_modified");
        }

        console.log(data);
        res.send(data);
    })
}