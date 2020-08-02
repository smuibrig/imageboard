const spicedPg = require("spiced-pg");

const db = spicedPg(
    process.env.DATABASE_URL || `postgres:sophie@localhost:5432/sophie`
);

module.exports.getImages = async (cursor, limit) => {
    console.log("cursor", cursor, "limit", limit);
    return await db.query(
        `
        SELECT * FROM images
        WHERE id > $1
        ORDER BY id ASC
        LIMIT $2
        `,
        [cursor, limit]
    );
};

module.exports.getImageData = async (id) => {
    let result = await db.query(`SELECT * FROM images WHERE id = $1`, [id]);
    return result;
};

exports.addImage = async (url, username, title, description) => {
    let result = await db.query(
        `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *`,
        [url, username, title, description]
    );
    return result;
};

exports.addComment = async (imageId, username, comment) => {
    let result = await db.query(
        `INSERT INTO comments (imageId, username, comment) VALUES ($1, $2, $3) RETURNING *`,
        [imageId, username, comment]
    );
    return result;
};

module.exports.getComment = async (imageId) => {
    let result = await db.query(
        `
        SELECT * FROM comments WHERE imageId = $1
        `,
        [imageId]
    );
    return result;
};
