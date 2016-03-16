Package.describe({
    name: "coniel:postable",
    summary: "A package for implementing social feeds",
    version: "0.0.1",
    git: "https://github.com/coniel/meteor-postable.git"
});

Package.onUse(function (api) {
    api.versionsFrom("1.2");

    api.use([
        "coniel:can@0.1.0",
        "coniel:base-model@0.3.0",
        "coniel:privacy@0.0.1",
        "coniel:pinnable@0.0.1",
        "coniel:likeable@0.0.1",
        "coniel:commentable@0.0.1",
        "coniel:followable@0.0.1",
        "mdg:validated-method@1.0.1",
        "didericis:callpromise-mixin@0.0.1",
        "tunifight:loggedin-mixin@0.1.0",
        "ecmascript",
        "es5-shim"
    ]);

    api.imply("coniel:likeable");
    api.imply("coniel:commentable");

    api.addFiles("common/postable-model.js");
    api.addFiles("common/post-model.js");

    api.export(["PostableModel", "Post"]);
});
