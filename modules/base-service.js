const { Types: { ObjectId } } = require('mongoose');
const User = require("./User/model");

class BaseService {
	constructor({ model }) {
		this.model = model;
	}

	/**
	 * Create a new document.
	 * @param {Object} data - The data to create the document with.
	 * @returns {Promise<Object>} The created document.
	 */
	async create(data) {
		try {
			if (data.location) {
				data.location = {
					type: "Point",
					coordinates: [data.location[1], data.location[0]]
				};
			}
			return await this.model.create(data);
		} catch (error) {
			throw new Error(`Error creating document: ${error.message}`);
		}
	}

	/**
	 * Update a document by ID.
	 * @param {String} id - The ID of the document to update.
	 * @param {Object} data - The data to update the document with.
	 * @returns {Promise<Object>} The updated document.
	 */
	async update(id, data) {
		try {
			return await this.model.findByIdAndUpdate(id, data, { new: true });
		} catch (error) {
			throw new Error(`Error updating document: ${error.message}`);
		}
	}

	/**
	 * Soft delete documents based on a query (sets isDeleted: true).
	 * @param {Object} queryObj - The query object to find documents to delete.
	 * @returns {Promise<Object>} The result of the deletion operation.
	 */
	async delete(queryObj) {
		try {
			return await this.model.updateMany(queryObj, { isDeleted: true, deletedAt: new Date() });
		} catch (error) {
			throw new Error(`Error deleting documents: ${error.message}`);
		}
	}

	/**
	 * Hard delete documents (permanent deletion).
	 * @param {Object} queryObj - The query object to find documents to delete.
	 * @returns {Promise<Object>} The result of the deletion operation.
	 */
	async hardDelete(queryObj) {
		try {
			return await this.model.deleteMany({ ...queryObj, isDeleted: true });
		} catch (error) {
			throw new Error(`Error hard deleting documents: ${error.message}`);
		}
	}

	/**
	 * Get a document by ID.
	 * @param {String} id - The ID of the document to retrieve.
	 * @param {Object} [options] - Options for the query.
	 * @param {Boolean} [options.lean=false] - Whether to return a lean object.
	 * @returns {Promise<Object>} The retrieved document.
	 */
	async get(id, { lean = false } = {}) {
		try {
			if (lean) {
				return await this.model.findById(id).lean();
			}
			return await this.model.findById(id);
		} catch (error) {
			throw new Error(`Error retrieving document: ${error.message}`);
		}
	}

	/**
	 * List all documents based on given query parameters.
	 * @param {Object} query - The query parameters.
	 * @returns {Promise<Array>} An array of documents that match the criteria.
	 */
	async list(query) {
		try {
			const limit = query.limit ? parseInt(query.limit) : 20;
			const page = query.page ? parseInt(query.page) : 1;
			const sortObj = {};
			if (query.sortBy) {
				sortObj[query.sortBy] = query.sortOrder === "desc" ? -1 : 1;
			}

			if (query.location) {
				delete sortObj.createdAt;
				sortObj.distance = 1;
			}

			if (query._id) query._id = ObjectId.isValid(query._id) ? new ObjectId(query._id) : null;

			const queryObj = { ...query };
			Object.keys(queryObj).forEach((key) => {
				if (!queryObj[key]) delete queryObj[key];
			});

			const excludedFields = [
				"limit", "page", "sort", "sortOrder", "sortBy", "radius",
				"groupBy", "location", "populate", "searchUser", "isAdmin", "includeDeleted"
			];
			excludedFields.forEach((el) => delete queryObj[el]);

			// Soft delete filtering - exclude deleted records unless includeDeleted is true
			if (!query.includeDeleted) {
				queryObj.isDeleted = false;
			}

			if (query.searchUser) {
				const users = await User.find({
					name: { $regex: query.query, $options: "i" },
				});
				const userIds = users.map((user) => user._id);
				queryObj.userId = { $in: userIds };
				delete queryObj.searchUser;
				delete queryObj.query;
			}

			if (query.isInactive || query.isActive) {
				const users = await User.find({
					isActive: query.isActive || false
				});
				const userIds = users.map((user) => user._id);
				queryObj.userId = { $in: userIds };
				delete queryObj.searchUser;
				delete queryObj.query;

				if (query.isInactive) {
					delete queryObj.isInactive;
				} else {
					delete queryObj.isActive;
				}
			}

			if (queryObj.searchInModel) {
				if (queryObj.query) {
					const users = await User.find({
						name: { $regex: queryObj.query, $options: "i" },
					});
					const userIds = users.map((user) => user._id);

					const results = await queryObj.searchInModel.find({ userId: { $in: userIds } }).select("_id");
					const resultIds = results.map((result) => result._id);

					queryObj[`${queryObj.searchInModel.modelName.toLowerCase()}Id`] = { $in: resultIds };
					delete queryObj.searchInModel;
					delete queryObj.query;
				}
			}

			let pipeline = [];

			if (query.location) {
				pipeline.push({
					$geoNear: {
						near: {
							type: "Point",
							coordinates: [query.location[1], query.location[0]],
						},
						distanceField: "distance",
						maxDistance: query.radius ? parseInt(query.radius) : 1000000000,
						spherical: true,
					},
				});
			}

			// Add soft delete filter to aggregation pipeline if not including deleted
			if (!query.includeDeleted) {
				queryObj.isDeleted = false;
			}
			pipeline.push({ $match: queryObj });

			if (query.groupBy) {
				pipeline.push({
					$group: { _id: `$${query.groupBy}`, data: { $push: "$$ROOT" } },
				});
			}

			// Only add sort if sortObj has keys
			if (Object.keys(sortObj).length > 0) {
				pipeline.push({ $sort: sortObj });
			} else {
				// Default sort by createdAt descending
				pipeline.push({ $sort: { createdAt: -1 } });
			}
			pipeline.push({ $skip: (page - 1) * limit });
			pipeline.push({ $limit: limit });

			return await this.model.aggregate(pipeline);
		} catch (error) {
			throw new Error(`Error listing documents: ${error.message}`);
		}
	}
}

module.exports = BaseService;

/**
 * Usage Examples:
 *
 * // Example 1: Creating a new document
 * const userService = new BaseService({ model: User });
 * const newUser = await userService.create({
 *     name: 'John Doe',
 *     email: 'john.doe@example.com',
 *     location: [40.7128, -74.0060]  // Latitude, Longitude
 * });
 *
 * // Example 2: Updating a document by ID
 * const updatedUser = await userService.update('60d5f9c68b5f5c5c4c8c4c8c', {
 *     name: 'Jane Doe',
 *     email: 'jane.doe@example.com'
 * });
 *
 * // Example 3: Deleting documents based on a query
 * const deleteResult = await userService.delete({ isActive: false });
 *
 * // Example 4: Getting a document by ID
 * const user = await userService.get('60d5f9c68b5f5c5c4c8c4c8c', { lean: true });
 *
 * // Example 5: Listing documents with filters and pagination
 * const users = await userService.list({
 *     isActive: true,
 *     limit: 10,
 *     page: 2,
 *     sortBy: 'name',
 *     sortOrder: 'asc',
 *     searchUser: true,
 *     query: 'John'
 * });
 */
