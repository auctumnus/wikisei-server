DROP TABLE IF EXISTS pages;
CREATE TABLE pages (
    name     STRING   PRIMARY KEY
                      UNIQUE
                      NOT NULL,
    markdown TEXT,
    html     TEXT,
    created  DATETIME NOT NULL,
    updated  DATETIME NOT NULL,
    tags     TEXT
);