const mongoose = require('mongoose');
const { Schema } = mongoose;

class BaseModel {
    constructor(schemaDefinition, options = {}) {
        const defaultOptions = {
            timestamps: true, // Add createdAt and updatedAt fields
            toJSON: { virtuals: true }, // Include virtuals in JSON
            toObject: { virtuals: true }, // Include virtuals in objects
        };
        this.schema = new Schema(schemaDefinition, { ...defaultOptions, ...options });
        this.addCommonMethods();
    }

    addCommonMethods() {
        // Add soft delete fields
        this.schema.add({ 
            isDeleted: { type: Boolean, default: false, index: true },
            deletedAt: { type: Date, default: null }
        });

        // Instance methods
        this.schema.methods.softDelete = async function () { 
            this.isDeleted = true; 
            this.deletedAt = new Date();
            await this.save(); 
        };
        
        this.schema.methods.restore = async function () { 
            this.isDeleted = false; 
            this.deletedAt = null;
            await this.save(); 
        };
        
        this.schema.methods.hardDelete = async function () { 
            await this.remove(); 
        };

        this.schema.statics.find = function (conditions = {}, ...args) {
            if (!('isDeleted' in conditions)) conditions.isDeleted = false;
            return mongoose.Model.find.call(this, conditions, ...args);
        };

        this.schema.statics.findById = function (id, ...args) {
            return this.findOne({ _id: id, isDeleted: false }, ...args);
        };

        this.schema.statics.findOne = function (conditions = {}, ...args) {
            if (!('isDeleted' in conditions)) conditions.isDeleted = false;
            return mongoose.Model.findOne.call(this, conditions, ...args);
        };

        this.schema.statics.findOneAndDelete = function (conditions = {}, options = {}) {
            if (!('isDeleted' in conditions)) {
                return this.findOneAndUpdate(conditions, { isDeleted: true, deletedAt: new Date() }, { ...options, new: true });
            }
            return mongoose.Model.findOneAndDelete.call(this, conditions, options);
        };

        this.schema.statics.findByIdAndDelete = function (id, options = {}) {
            return this.findByIdAndUpdate(id, { isDeleted: true, deletedAt: new Date() }, { ...options, new: true });
        };

        this.schema.statics.deleteOne = function (conditions = {}, options = {}) {
            if (!('isDeleted' in conditions)) {
                return this.updateOne(conditions, { isDeleted: true, deletedAt: new Date() }, options);
            }
            return mongoose.Model.deleteOne.call(this, conditions, options);
        };

        this.schema.statics.deleteMany = function (conditions = {}, options = {}) {
            if (!('isDeleted' in conditions)) {
                return this.updateMany(conditions, { isDeleted: true, deletedAt: new Date() }, options);
            }
            return mongoose.Model.deleteMany.call(this, conditions, options);
        };

        this.schema.statics.hardDeleteOne = function (conditions = {}) {
            return mongoose.Model.deleteOne.call(this, conditions);
        };

        this.schema.statics.hardDeleteMany = function (conditions = {}) {
            return mongoose.Model.deleteMany.call(this, conditions);
        };

        this.schema.pre('save', function (next) {
            if (this.isNew) {
                // Custom logic for new documents
            }
            next();
        });
    }

    initModel(modelName) {
        return mongoose.model(modelName, this.schema);
    }
}

module.exports = BaseModel;
