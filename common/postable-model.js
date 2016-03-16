PostableModel = {
    options: {}
};

PostableModel.makePostable = function (model, type, options) {
    if (model.appendSchema && type) {
        LinkableModel.registerLinkableType(model, type);
        PostableModel.options[type] = options;
        _.extend(model.prototype, postableMethods);
    } else {
        throw new Meteor.Error("makePostableFailed", "Could not make model postable. Please make sure you passed in a model and type");
    }
};


var postableMethods = {
    /**
     * Create and link a post
     * @param {String} body The body text of the post
     */
    addPost: function (doc) {
        var type = this._objectType;
        new Post(_.extend(doc, {linkedObjectId: this._id, linkedObjectType: type})).save();
    },
    /**
     * Get the posts for a model that is able to be posted on
     * @param   {Number}       limit     The maximum number of records to return
     * @param   {Number}       skip      The number of records to skip
     * @param   {String}       sortBy    The field on which to sort
     * @param   {Number}       sortOrder The order in which to sort. 1 for ascending and -1 for descending
     * @returns {Mongo.Cursor} A cursor that returns post instances
     */
    posts: function (limit, skip, sortBy, sortOrder) {
        var options = {};

        if (limit) {
            options.limit = limit;
        }

        if (skip) {
            options.skip = skip;
        }

        if (sortBy && sortOrder) {
            options.sort = {};
            options.sort[sortBy] = sortOrder;
        }

        return PostsCollection.find({linkedObjectId: this._id}, options);
    }
};