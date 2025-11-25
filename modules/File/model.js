const schema = require('./schema');
const BaseModel = require('../base-model'); // Adjust the path as needed


// Extend the BaseModel to create the Sample model
class FileModel extends BaseModel {
	constructor() {
		// Pass the schema definition to the BaseModel constructor
		super(schema);

		// Add any specific schema methods, hooks, or virtuals here if needed
		this.schema.methods.customMethod = function () {
			// Custom instance method logic
		};

		// Initialize the Mongoose model
		this.model = this.initModel('File');
	}
}

// Export the Mongoose model
module.exports = new FileModel().model;
