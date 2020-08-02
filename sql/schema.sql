DROP TABLE IF EXISTS images CASCADE;

CREATE TABLE images (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    username TEXT NOT NULL CHECK (username != ''),
    title TEXT NOT NULL CHECK (title != ''),
    description TEXT NOT NULL CHECK (description != ''),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

DROP TABLE IF EXISTS comments CASCADE;

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    imageId INTEGER NOT NULL REFERENCES images(id),
    username TEXT NOT NULL CHECK (username != ''),
    comment TEXT NOT NULL CHECK (comment != ''),
    created_at TIMESTAMPTZ DEFAULT NOW()
)


