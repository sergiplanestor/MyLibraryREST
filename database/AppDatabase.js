const mariadb = require('mariadb');


class AppDatabase {


	constructor() {
		this.pool = mariadb.createPool({
			multipleStatements: true,
			hostname: 'localhost',
			port: 3306,
			user: 'usr_library',
			password: 'h$28be7;&shdH6ab?bB3k_DK',
			database: 'calturbo_db'
		});
	}


	async insertUser(user) {
		let query = "INSERT INTO user(username, pwd, creation_date) VALUES (?,?,?)";
		if (user) {
			const values = [
				user.username,
				new Buffer.from(user.pwd, "base64"),
				// TODO: creation_date
			]
			return await this.execInsert(query, values).catch(AppDatabase.errorHandler());
		}
		return false;
	}

	async fetchUser(username) {
		let query = "SELECT (username, pwd, creation_date) FROM user WHERE username = ?"
		if (username) {
			const values = [
				username
			]
			const queryResult = await this.execQuery(query, values).catch(AppDatabase.errorHandler());
			if (queryResult && queryResult.length === 1) {
				return {
					username: queryResult[0].username,
					pwd: queryResult[0].pwd.toString("base64"),
					creation: queryResult[0].creation_date
				}
			}
		}
		return null
	}

	async insertBook(book) {

		let query = "INSERT INTO book("+
										"user," +
										"title," +
										"author," +
										"thumbnail_main," +
										"thumbnail_secondary," +
										"editorial," +
										"synopsis," +
										"genre," +
										"price," +
										"publication_date," +
										"creation_date," +
										"book_priority," +
										"already_read," +
										"already_bought) " +

					"VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING _id";

		let values = [
			book.user,
			book.title,
			book.author ? book.author : null,
			book.thumbnailMain ? new Buffer(book.thumbnailMain) ? null,
			book.thumbnailReverse ? new Buffer(book.thumbnailReverse) ? null,
			book.editorial ? book.editorial : null,
			book.sinopsis ? book.sinopsis : null,
			book.genre ? book.genre : null,
			book.price ? book.price : null,
			book.publication_date ? book.publication_date : null,
			// TODO: creation_date
			book.priority ? book.priority : null,
			book.read ? book.read : null,
			book.bought ? book.bought : null,
		];

		const bookId = await this.execInsert(query, values).catch(AppDatabase.errorHandler());
		if (bookId) {
			let resultCounter = 0;
			book.tags.forEach(function(tag) {

				const tagId = await this.fetchIdOrInsertTag(tag).catch(AppDatabase.errorHandler());
				if (tagId) {
					query = "INSERT INTO book_tag(book, tag) VALUES(?,?)";
					values = [bookId, tagId];
					const queryResult = await this.execInsert(query, values).catch(AppDatabase.errorHandler());
					if (queryResult) resultCounter++;
				}
			});

			return resultCounter === book.tags.length;

		} else {
		return false
	}

}

async fetchIdOrInsertTag(tag) {
	const storedTag = await this.fetchTagByName(tag);
	if (storedTag) return storedTag._id;
	else await this.insertTag(tag).catch(AppDatabase.errorHandler());
}

async insertTag(tag) {

	const query = "INSERT INTO tag(tag)";

}


async execQuery(query, queryValues) {
	let conn = await this.pool.getConnection();
	let queryResult = await conn.query(query, queryValues);
	conn.end();
	return queryResult;
}

static errorHandler(error) {
	return error;
}

}


module.exports = this;