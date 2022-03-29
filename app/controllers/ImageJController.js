const Photo = require("../models/model");
const java = require("java");
const fs = require("fs");

import waifu2x from "waifu2x";
import dotenv from "dotenv";

let config = dotenv.config();
config = {};
config.imagej_dir = process.env.IMAGEJ_DIR;
config.headless = true;

module.exports = {
    imageProcess: imageProcess
};

// Process the image
function imageProcess(req, res) {
    console.log('==> Starting ImageJ');
    const imagej = require("imagej")(config);

    imagej.on('ready', function(ij) {
        Photo.find({ "fileName": req.body.fileName }, (error, data) => {

            if (error) {
                return next(error);
            }

            // Assign filepath of output file according to preview flag
            const filePath = data[0].filePath;
            const width = data[0].width;
            const height = data[0].height;
            let outFile = filePath; // Output file path for Waifu2x
            let preview = req.body.preview; // Preview flag
            if (preview == 1) {
                outFile = filePath.substring(0, 7) + "/preview" + filePath.substring(7);
            }

            data = {
                filePath: filePath,
                width: width,
                height: height
            }

            if (req.body.processOption === "scale") {
                // Waifu2x smart scale
                if (req.body.width.endsWith("x")) {
                    waifuScale(req.body.width, preview, data, filePath, outFile, width, height, ij, res);
                } else {
                    // ImageJ flexible scale for specified width and height
                    scaleImage(filePath, parseInt(req.body.width), parseInt(req.body.height), preview, function() {
                        if (preview == 1) {
                            data.filePath = filePath + "_modified";
                        }
                        data.width = parseInt(req.body.width);
                        data.height = parseInt(req.body.height);
                        res.send(data);
                    })
                }
            } else if (req.body.processOption === "blur") {
                blurImage(filePath, parseInt(req.body.sigma), preview, function() {
                    if (preview == 1) {
                        data.filePath = filePath + "_modified";
                    }
                    res.send(data);
                })
            } else if (req.body.processOption === "noise") {
                noiseImage(filePath, parseInt(req.body.standardDev), preview, function() {
                    if (preview == 1) {
                        data.filePath = filePath + "_modified";
                    }
                    res.send(data);
                })
            } else if (req.body.processOption === "denoise") {
                // Denoise
                let theta = req.body.theta;
                if (theta >= 0 && theta <= 3) {
                    if (preview == 1) {
                        waifu2x.upscaleImage(filePath, "uploads/preview", { noise: theta, scale: 1.0 });
                    } else {
                        waifu2x.upscaleImage(filePath, "uploads", { noise: theta, scale: 1.0 });
                    }
                }
                waifuRename(outFile)
                data.filePath = outFile;
                ij.context().dispose();
                res.send(data);
            } else if (req.body.processOption === "filters") {
                applyFilters(filePath, function() {
                    res.send(data);
                })
            } else if (req.body.processOption === "no filter") {
                noFilter(filePath, function() {
                    res.send(data);
                })
            } else if (req.body.processOption === "vertical mirror") {
                verticalMirror(filePath, function() {
                    res.send(data);
                })
            } else if (req.body.processOption === "horizontal mirror") {
                horizontalMirror(filePath, function() {
                    res.send(data);
                })
            } else if (req.body.processOption === "grayscale") {
                grayScale(filePath, function() {
                    res.send(data);
                })
            } else if (req.body.processOption === "invert") {
                invert(filePath, function() {
                    res.send(data);
                })
            } else if (req.body.processOption === "smooth") {
                smooth(filePath, function() {
                    res.send(data);
                })
            } else if (req.body.processOption === "sharpen") {
                sharpen(filePath, function() {
                    res.send(data);
                })
            }
        })
    })
}

// Upscale image with Waifu2x (scale factor)
function waifuScale(factor, preview, data, filePath, outFile, width, height, ij, res) {
    factor = parseFloat(factor.substring(0, 3));
    if (preview == 1) {
        waifu2x.upscaleImage(filePath, "uploads/preview", { noise: 0, scale: factor });
    } else {
        waifu2x.upscaleImage(filePath, "uploads", { noise: 0, scale: factor });
    }
    waifuRename(outFile);
    data.filePath = outFile;
    data.width = parseInt(width * factor);
    data.height = parseInt(height * factor);
    ij.context().dispose();
    res.send(data);
}

// Rename files made by Waifu2x
function waifuRename(outFile) {
    // File path generated by waifu2x
    let waifuPath = outFile.substring(0, outFile.length - 5) + "2x" + outFile.substring(outFile.length - 5, outFile.length) + ".png";
    // Rename file generated by waifu2x with original name and overwrite
    fs.rename(waifuPath, outFile, (err) => {
        if (err) {
            console.log(err);
        }
    })
}

// Scale the image with ImageJ (specified width and height).
function scaleImage(filePath, width, height, preview, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageProcessor = java.import("ij.process.ImageProcessor");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let imp = opener.openImage(filePath);

    let ip = imp.getProcessor();
    ip.setInterpolationMethod(ImageProcessor.BILINEAR);
    ip = ip.resize(width, height);

    let newImage = ip.getBufferedImage();
    if (preview == 1) {
        ImageIO.write(newImage, "png", new File(filePath + "_modified"));
    } else {
        ImageIO.write(newImage, "png", new File(filePath));
    }

    ij.context().dispose();
    _callback();
}

// Blur the image
function blurImage(filePath, sigma, preview, _callback) {
    const Opener = java.import("ij.io.Opener");
    const GaussianBlur = java.import('ij.plugin.filter.GaussianBlur');
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let g = new GaussianBlur();
    let imp = opener.openImage(filePath);

    let ip = imp.getProcessor();
    g.blurGaussian(ip, Math.log(sigma + 1));

    let newImage = ip.getBufferedImage();

    if (preview == 1) {
        ImageIO.write(newImage, "png", new File(filePath + "_modified"));
    } else {
        ImageIO.write(newImage, "png", new File(filePath));
    }

    ij.context().dispose();
    _callback();
}

// Add/Remove Noise
function noiseImage(filePath, standardDev, preview, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let imp = opener.openImage(filePath);

    let ip = imp.getProcessor();

    // Add noise
    if (standardDev != 0) {
        ip.noise(standardDev / 2)
    }

    let newImage = ip.getBufferedImage();
    if (preview == 1) {
        ImageIO.write(newImage, "png", new File(filePath + "_modified"));
    } else {
        ImageIO.write(newImage, "png", new File(filePath));
    }

    ij.context().dispose();
    _callback();
}

// Apply filters to the image
function applyFilters(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    if (fs.existsSync(filePath + "_filtered")) {
        let opener = new Opener();

        let imp = opener.openImage(filePath + "_filtered");

        let ip = imp.getProcessor();

        let newImage = ip.getBufferedImage();
        ImageIO.write(newImage, "png", new File(filePath));

        fs.unlinkSync(filePath + "_filtered");
        ij.context().dispose();
    }

    _callback();
}

// Vertical mirror
function verticalMirror(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let imp;

    if (fs.existsSync(filePath + "_filtered")) {
        imp = opener.openImage(filePath + "_filtered");
    } else {
        imp = opener.openImage(filePath);
    }

    let ip = imp.getProcessor();

    ip.flipVertical();

    let newImage = ip.getBufferedImage();
    ImageIO.write(newImage, "png", new File(filePath + "_filtered"));

    ij.context().dispose();
    _callback();
}

// Horizontal mirror
function horizontalMirror(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let imp;

    if (fs.existsSync(filePath + "_filtered")) {
        imp = opener.openImage(filePath + "_filtered");
    } else {
        imp = opener.openImage(filePath);
    }

    let ip = imp.getProcessor();

    ip.flipHorizontal();

    let newImage = ip.getBufferedImage();
    ImageIO.write(newImage, "png", new File(filePath + "_filtered"));

    ij.context().dispose();
    _callback();
}

// Apply no filter to the image
function noFilter(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    if (fs.existsSync(filePath + "_filtered")) {
        let opener = new Opener();
        let imp = opener.openImage(filePath);

        let ip = imp.getProcessor();

        ip.flipHorizontal();

        let newImage = ip.getBufferedImage();
        ImageIO.write(newImage, "png", new File(filePath + "_filtered"));

        fs.unlinkSync(filePath + "_filtered");
        ij.context().dispose();
    }

    _callback();
}

// Grayscale
function grayScale(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    const ImageConverter = java.import("ij.process.ImageConverter");
    let opener = new Opener();
    let imp;

    if (fs.existsSync(filePath + "_filtered")) {
        imp = opener.openImage(filePath + "_filtered");
    } else {
        imp = opener.openImage(filePath);
    }

    let imc = new ImageConverter(imp);

    imc.convertToGray32();

    let ip = imp.getProcessor();

    let newImage = ip.getBufferedImage();
    ImageIO.write(newImage, "png", new File(filePath + "_filtered"));

    ij.context().dispose();
    _callback();
}

// Invert the image
function invert(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let imp;

    if (fs.existsSync(filePath + "_filtered")) {
        imp = opener.openImage(filePath + "_filtered");
    } else {
        imp = opener.openImage(filePath);
    }

    let ip = imp.getProcessor();

    ip.invert();

    let newImage = ip.getBufferedImage();
    ImageIO.write(newImage, "png", new File(filePath + "_filtered"));

    ij.context().dispose();
    _callback();
}

// Smooth the image
function smooth(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let imp;

    if (fs.existsSync(filePath + "_filtered")) {
        imp = opener.openImage(filePath + "_filtered");
    } else {
        imp = opener.openImage(filePath);
    }

    let ip = imp.getProcessor();

    ip.smooth();

    let newImage = ip.getBufferedImage();
    ImageIO.write(newImage, "png", new File(filePath + "_filtered"));

    ij.context().dispose();
    _callback();
}

// Sharpen the image
function sharpen(filePath, _callback) {
    const Opener = java.import("ij.io.Opener");
    const ImageIO = java.import("javax.imageio.ImageIO");
    const File = java.import("java.io.File");
    let opener = new Opener();
    let imp;

    if (fs.existsSync(filePath + "_filtered")) {
        imp = opener.openImage(filePath + "_filtered");
    } else {
        imp = opener.openImage(filePath);
    }

    let ip = imp.getProcessor();

    ip.sharpen();

    let newImage = ip.getBufferedImage();
    ImageIO.write(newImage, "png", new File(filePath + "_filtered"));

    ij.context().dispose();
    _callback();
}