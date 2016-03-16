/**
 * A model for a post which can be linked to many other database objects
 * @class Post
 */
Post = BaseModel.extendAndSetupCollection("posts", {softRemovable: true, userId: true});

LinkableModel.makeLinkable(Post);
LikeableModel.makeLikeable(Post, "post");
CommentableModel.makeCommentable(Post, "post");
FollowableModel.makeFollowable(Post, "post");
Pinnable.makePinnable(Post, {checkType: 'type'});
Privacy.enablePrivacy(Post, {defaultValue: "friends"});

/**
 * The user that made the post
 * @returns {User} A User instance representing the posting user.
 */
Post.prototype.user = function () {
    return Meteor.users.findOne(this.userId);
};

//create the schema
Post.appendSchema({
    title: {
        type: String,
        max: 300,
        optional: true
    },
    body: {
        type: String,
        max: 2000
    },
    type: {
        type: String,
        defaultValue: "post"
    },
    _lastActivity: {
        type: Date,
        autoValue: function () {
            if (this.isInsert) {
                return new Date();
            }
        }
    }
});

Post.appendSchema(LinkableModel.LinkableSchema);

Post.meteorMethods({
    insert: new ValidatedMethod({
        name: 'posts.insert',
        mixins: [CallPromiseMixin, LoggedInMixin],
        validate: new SimpleSchema({
            doc: {
                type: Object
            },
            'doc.body': Post.getSchemaKey('body'),
            'doc.title': Post.getSchemaKey('title'),
            'doc.type': Post.getSchemaKey('type'),
            'doc.linkedObjectId': Post.getSchemaKey('linkedObjectId'),
            'doc.linkedObjectType': Post.getSchemaKey('linkedObjectType'),
            'doc.privacy': Post.getSchemaKey('privacy'),
            'doc._likeCount': {
                type: Number,
                optional: true
            },
            'doc._commentCount': {
                type: Number,
                optional: true
            }
        }).validator(),
        checkLoggedInError: {
            error: 'notLogged',
            message: 'You need to be logged in to call this method',//Optional
            reason: 'You need to login' //Optional
        },
        run({doc}) {
            var post = new Post(doc);
            // Get the parent object
            var parent = post.linkedObject();

            if (!parent) {
                throw new Meteor.Error("noLinkedObject");
            }

            // object type and id to validate against
            var checkOnType = post.linkedObjectType;
            var checkOnId = parent;

            if (parent.linkedObjectType && parent.linkedObjectId) {
                // Add the linked objects parent as a grandparent
                doc.parentLinkedObjectType = parent.linkedObjectType;
                doc.parentLinkedObjectId = parent.linkedObjectId;

                if (!PostableModel.options[checkOnType] || (PostableModel.options[checkOnType] && !!PostableModel.options[checkOnType].authorizeOnGrandParent)) {
                    // If the linked object has a prent, validate against the parent
                    checkOnType = parent.linkedObjectType;
                    checkOnId = parent.linkedObjectId;
                }
            }

            if (Can.createIn(doc.type, doc, checkOnType, checkOnId)) {
                return Post.collection.insert(doc, (error, result) => {
                    if (!error) {
                        post = Post.createEmpty(result).follow("author");
                    }
                });
            }
        }
    }),
    update: new ValidatedMethod({
        name: 'posts.update',
        mixins: [CallPromiseMixin, LoggedInMixin],
        validate: new SimpleSchema({
            _id: Post.getSchemaKey("_id"),
            doc: {
                type: Object
            },
            'doc.body': Post.getSchemaKeyAsOptional('body'),
            'doc.title': Post.getSchemaKeyAsOptional('title'),
            'doc.privacy': Post.getSchemaKeyAsOptional('privacy')
        }).validator(),
        checkLoggedInError: {
            error: 'notLogged',
            message: 'You need to be logged in to call this method',//Optional
            reason: 'You need to login' //Optional
        },
        run({_id, doc}) {
            console.log(doc);
            // Set userId of to current user
            var post = Post.collection.findOne({_id: _id});

            if (post) {
                // Get the parent object
                var parent = post.linkedObject();

                if (!parent) {
                    throw new Meteor.Error("noLinkedObject");
                }

                // object type and id to validate against
                var checkOnType = post.linkedObjectType;
                var checkOnId = parent;

                if (parent.linkedObjectType && parent.linkedObjectId) {
                    // If the linked object has a prent, validate against the parent
                    checkOnType = parent.linkedObjectType;
                    checkOnId = parent.linkedObjectId;
                }

                if (Can.editIn(post.type, post, checkOnType, checkOnId)) {
                    return Post.collection.update({_id: _id}, {$set: doc});
                }
            } else {
                throw new Meteor.Error(404, "Post not found");
            }
        }
    }),
    remove: new ValidatedMethod({
        name: 'posts.remove',
        mixins: [CallPromiseMixin, LoggedInMixin],
        validate: Post.getSubSchema(["_id"], null, true),
        checkLoggedInError: {
            error: 'notLogged',
            message: 'You need to be logged in to call this method',//Optional
            reason: 'You need to login' //Optional
        },
        run({_id}) {
            var post = Post.collection.findOne({_id: _id});

            var checkOnType = post.parentLinkedObjectType || post.linkedObjectType;
            var checkOnId = post.parentLinkedObjectId || post.linkedObjectId;

            if (Can.deleteIn(post.type, _id, checkOnType, checkOnId)) {
                Post.collection.softRemove({_id: _id}, function (error, result) {
                    if (!error) {
                        //if there are any likes, comments or followers for the deleted post, delete them
                        Comment.collection.remove({linkedObjectId: _id});
                        Like.collection.remove({linkedObjectId: _id});
                        Follower.collection.remove({linkedObjectId: _id});
                    }
                });
            }
        }
    })
});

Can.registerCollection("post", Post.collection);