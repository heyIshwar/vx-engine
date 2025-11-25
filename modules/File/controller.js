const FileService = require("./service");
const { BadRequestParameterError } = require("../../lib/errors");
const fileService = new FileService();

class Controller {
    /**
     * Handles the file request from the user.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    async request(req, res, next) {
        try {
            const { requirement, module } = req.body;
            const userId = req.user._id;

            if (!requirement.length || !module) {
                return next(new BadRequestParameterError());
            }

            const modifiedRequirements = requirement.map((item) => {
                return {
                    ...item,
                    module,
                    userId,
                };
            });

            const response = await fileService.request({ requirement: modifiedRequirements, userId, module });
            return res.json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marks files as uploaded.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    async markUploaded(req, res, next) {
        try {
            const { fileIds } = req.body;
            const userId = req.user._id;
            const response = await fileService.markUploaded({ fileIds, userId });
            return res.json({ data: response });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Marks a single file as uploaded.
     * @param {Object} req - Express request object.
     * @param {Object} res - Express response object.
     * @param {Function} next - Express next middleware function.
     */
    async markSingleUploaded(req, res, next) {
        try {
            const { fileId } = req.params;
            const userId = req.user._id;
            const response = await fileService.markUploaded({ fileIds: [fileId], userId });
            return res.json({ data: response });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = Controller;
