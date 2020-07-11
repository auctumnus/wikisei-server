DROP TABLE IF EXISTS pages;
CREATE TABLE pages (
    slug        STRING   PRIMARY KEY
                         UNIQUE
                         NOT NULL,
    name        STRING   NOT NULL,
    markdown    TEXT,
    html        TEXT,
    created     DATETIME NOT NULL,
    updated     DATETIME NOT NULL,
    tags        TEXT
);
