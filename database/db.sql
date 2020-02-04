CREATE TABLE user(
    _id INTEGER AUTO_INCREMENT NOT NULL,
    username VARCHAR(100) NOT NULL,
    pwd BLOB NOT NULL,
    creation_date BIGINTEGER NOT NULL

    CONSTRAINT pk_user PRIMARY KEY (_id),
    CONSTRAINT ak_user UNIQUE (username)
)

CREATE TABLE book(
    _id INTEGER AUTO_INCREMENT NOT NULL,
    user INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(150),
    thumbnail_main BLOB DEFAULT NULL,
    thumbnail_secondary BLOB DEFAULT NULL,
    editorial VARCHAR(100) DEFAULT '',
    sinopsis VARCHAR(500) DEFAULT '',
    genre VARCHAR NOT NULL DEFAULT 0,
    price VARCHAR(10) DEFAULT '',
    publication_date BIGINTEGER DEFAULT NULL,
    creation_date BIGINTEGER NOT NULL,
    book_priority VARCHAR NOT NULL DEFAULT 0,
    already_read INTEGER NOT NULL DEFAULT 0,
    already_bought INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT pk_book PRIMARY KEY (_id),
    CONSTRAINT ak_book UNIQUE (title),

    CONSTRAINT fk_book_user FOREIGN KEY (user) REFERENCES user(_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
);

CREATE TABLE tag(
    _id INTEGER AUTO_INCREMENT NOT NULL,
    tag VARCHAR(50) NOT NULL

    CONSTRAINT pk_tag PRIMARY KEY (_id)
    CONSTRAINT ak_tag UNIQUE (tag)
);

CREATE TABLE book_tag(
    book INTEGER NOT NULL,
    tag INTEGER NOT NULL

    CONSTRAINT pk_tag PRIMARY KEY (book, tag),

    CONSTRAINT fk_book_tag_book FOREIGN KEY (book) REFERENCES book(_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_book_tag_tag FOREIGN KEY (tag) REFERENCES tag(_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
