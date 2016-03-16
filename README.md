# Postable #

A package for creating a social network style news feed. Originally based on the [socialize:feed](https://atmospherejs.com/socialize/feed) package but heavily modified so that posts can be attached to any model (not just users), uses (validated) Meteor methods rather than client side operations and [coniel:can](https://atmospherejs.com/coniel/can) for authorization.

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ javascript
var Group = BaseModel.extendAndSetupCollection("groups");
PostableModel.makePostable(Group, "group");
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

## Post (class) - Extends [BaseModel][1] - Implements [CommentableModel][2], [LikeableModel][3], [FollowableModel][4], [Privacy][5], [Pinnable][6]##

### Instance Methods ###

**user()** - The use who created the post. Poster may return the same as user if the user created the post in their own feed.


### Instance Methods ###

**addPost(&lt;String&gt; body)** - Add a post to the model.
**posts(limit, skip, sortBy, sortOrder)** - Get the posts belonging to this model.

```javascript
var group = Group.collection.findOne();
group.addPost({body: "Hello everyone!"});
```

## Publications ##

Publications have been removed to allow the use of your choice of publication package.

[1]: https://github.com/coniel/meteor-base-model
[2]: https://github.com/coniel/meteor-commentable
[3]: https://github.com/coniel/meteor-likeable
[4]: https://github.com/coniel/meteor-followable
[5]: https://github.com/coniel/meteor-privacy
[6]: https://github.com/coniel/meteor-pinnable