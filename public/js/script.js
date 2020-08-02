(function () {
    Vue.component("modal-component", {
        template: "#modal-template",
        props: ["id"],
        data: function () {
            return {
                url: "",
                title: "",
                description: "",
                username: "",
                comments: [],
                c_username: "",
                c_comment: "",
            };
        },
        mounted: function () {
            const self = this;
            console.log("this.id: ", this.id);
            axios
                .get(`/image/${this.id}`)
                .then(function (result) {
                    console.log(result.data);
                    self.url = result.data.url;
                    self.title = result.data.title;
                    self.description = result.data.description;
                    self.username = result.data.username;
                })
                .catch(function (err) {
                    console.log("error: ", err);
                });
            axios
                .get(`/comments/${this.id}`)
                .then(function (result) {
                    self.comments = result.data;
                })
                .catch(function (err) {
                    console.log(err);
                });
        },
        methods: {
            closeModal: function () {
                this.$emit("close");
            },
            submitComment: function () {
                const self = this;
                axios
                    .post("/comment", {
                        imageId: this.id,
                        username: this.c_username,
                        comment: this.c_comment,
                    })
                    .then(function (result) {
                        console.log(result);
                        self.comments.unshift(result.data);
                        self.c_username = "";
                        self.c_comment = "";
                    })
                    .catch(function (err) {
                        console.log(err);
                    });
            },
        },
    });

    Vue.use(window.infiniteScroll);

    new Vue({
        el: "#main",
        data: {
            images: [],
            title: "",
            description: "",
            username: "",
            file: null,
            imgID: null,
            busy: false,
        },
        methods: {
            handleClick: function (e) {
                var self = this;

                // prevents the page from reloading
                e.preventDefault();

                // we NEED to use FormData ONLY when we send a file to the server
                var formData = new FormData();
                formData.append("title", this.title);
                formData.append("description", this.description);
                formData.append("username", this.username);
                formData.append("file", this.file);

                axios
                    .post("/upload", formData)
                    .then(function (resp) {
                        self.images.push(resp.data);
                        self.title = "";
                        self.description = "";
                        self.username = "";
                        self.file = "";
                    })
                    .catch(function (err) {
                        console.log("err in POST /upload: ", err);
                    });
            },

            handleChange: function (e) {
                this.file = e.target.files[0];
            },
            setImageID: function (id) {
                this.imgID = id;
                console.log(id);
            },
            closeComp: function () {
                this.imgID = null;
            },
            loadMore: function () {
                var self = this;

                if (self.busy) {
                    return;
                }

                self.busy = true;

                let cursor = 0;
                if (self.images.length > 0) {
                    cursor = self.images[self.images.length - 1].id;
                }

                axios
                    .get("/images", {
                        params: { cursor: cursor, limit: 9 },
                    })
                    .then(function (res) {
                        res.data.forEach(function (img) {
                            self.images.push(img);
                        });
                        self.busy = false;
                    });
            },
        },
    });
})();
