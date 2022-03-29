const express = require('express'),
      router = express.Router(),
      controller = require('./controllers/Controller'),
      imageJController = require('./controllers/ImageJController');

module.exports = router;

router.get("/", controller.showUploadHome);
router.get("/edit_page", controller.showEdit);
router.get("/size_tool_menu", controller.loadSizeToolMenu);
router.get("/blur_tool_menu", controller.loadBlurMenu);
router.get("/noise_tool_menu", controller.loadNoiseToolMenu);
router.get("/filter_tool_menu", controller.loadFilterToolMenu);

router.get("/server.js", controller.retrieveImage);
router.post("/server.js", controller.saveImage);

// ImageJ processing
router.post("/server.js/imageProcess", imageJController.imageProcess);