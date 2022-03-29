const mongoose = require('mongoose');

const imageProcSchema = mongoose.Schema({
    fileName: String,
    filePath: String,
    width: Number,
    height: Number
});

const imageModel = mongoose.model('Image-Processing-Toolkit', imageProcSchema);
module.exports = imageModel;