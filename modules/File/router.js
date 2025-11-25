const router = require('express').Router();
const FileController = require("./controller");
const fileController = new FileController();

/**
 * @route POST /
 * @description Handles file requests. Expects a `requirement` array and a `module` in the request body.
 * @access Private
 */
router.post("/", fileController.request);

/**
 * @route PATCH /uploaded
 * @description Marks multiple files as uploaded. Expects `fileIds` in the request body.
 * @access Private
 */
router.patch("/uploaded", fileController.markUploaded);

/**
 * @route PATCH /:fileId/uploaded
 * @description Marks a single file as uploaded using its `fileId`.
 * @access Private
 */
router.patch("/:fileId/uploaded", fileController.markSingleUploaded);

module.exports = router;
