/*  # as root */
CREATE DATABASE mylibrary_db;
CREATE USER 'usr_library'@'localhost' IDENTIFIED BY 'h$28be7;&shdH6ab?bB3k_DK';
GRANT ALL ON mylibrary_db.* TO usr_library;
GRANT ALL ON mylibrary_db.* TO 'usr_library'@'localhost';

USE mylibrary_db;

CREATE TABLE user(
    _id INTEGER AUTO_INCREMENT NOT NULL,
    username VARCHAR(100) NOT NULL,
    pwd BLOB NOT NULL,
    creation_date BIGINT NOT NULL,

    CONSTRAINT pk_user PRIMARY KEY (_id),
    CONSTRAINT ak_user UNIQUE (username)
);

CREATE TABLE book(
    _id INTEGER AUTO_INCREMENT NOT NULL,
    user INTEGER NOT NULL,
    title VARCHAR(150) NOT NULL,
    author VARCHAR(150),
    thumbnail_main BLOB DEFAULT NULL,
    thumbnail_secondary BLOB DEFAULT NULL,
    editorial VARCHAR(100) DEFAULT '',
    synopsis VARCHAR(500) DEFAULT '',
    genre VARCHAR(30) NOT NULL,
    price VARCHAR(10) DEFAULT '',
    publication_date BIGINT DEFAULT NULL,
    creation_date BIGINT NOT NULL,
    book_priority VARCHAR(30) NOT NULL DEFAULT 'Medium',
    already_read INTEGER NOT NULL DEFAULT 0,
    already_bought INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT pk_book PRIMARY KEY (_id),
    CONSTRAINT ak_book UNIQUE (title),

    CONSTRAINT fk_book_user FOREIGN KEY (user) REFERENCES user(_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);

CREATE TABLE tag(
    _id INTEGER AUTO_INCREMENT NOT NULL,
    tag VARCHAR(50) NOT NULL,

    CONSTRAINT pk_tag PRIMARY KEY (_id),
    CONSTRAINT ak_tag UNIQUE (tag)
);

CREATE TABLE book_tag(
    book INTEGER NOT NULL,
    tag INTEGER NOT NULL,

    CONSTRAINT pk_tag PRIMARY KEY (book, tag),

    CONSTRAINT fk_book_tag_book FOREIGN KEY (book) REFERENCES book(_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT fk_book_tag_tag FOREIGN KEY (tag) REFERENCES tag(_id)
        ON UPDATE CASCADE
        ON DELETE CASCADE
);
