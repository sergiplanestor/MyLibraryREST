const mariadb = require('mariadb');


class AppDatabase {

// =====================================================================================================================
// Constructor
// =====================================================================================================================

	constructor() {
		this.pool = mariadb.createPool({
			multipleStatements: true,
			hostname: 'localhost',
			port: 3306,
			user: 'usr_library',
			password: 'h$28be7;&shdH6ab?bB3k_DK',
			database: 'mylibrary_db'
		});
	}

// =====================================================================================================================
// User methods
// =====================================================================================================================

	async insertUser(user) {
		let query = "INSERT INTO user(username, pwd, creation_date) VALUES (?,?,?)";
		if (user) {
			const values = [
				user.username,
				new Buffer(user.pwd),
				user.creation_date
			];
			return await this.execInsert(query, values).catch(AppDatabase.errorHandler());
		}
		return false;
	}

	async fetchUser(username) {
		let query = "SELECT (username, pwd, creation_date) FROM user WHERE username = ?"
		if (username) {
			const values = [
				username
			];
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

// =====================================================================================================================
// Book methods
// =====================================================================================================================

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
			book.thumbnailMain ? new Buffer(book.thumbnailMain) : null,
			book.thumbnailReverse ? new Buffer(book.thumbnailReverse) : null,
			book.editorial ? book.editorial : null,
			book.sinopsis ? book.sinopsis : null,
			book.genre ? book.genre : null,
			book.price ? book.price : null,
			book.publication_date ? book.publication_date : null,
			// TODO: creation_date
			book.priority ? book.priority : null,
			book.read ? book.read : null,
			book.bought ? book.bought : null
		];

		const bookId = await this.execQuery(query, values).catch(AppDatabase.errorHandler());
		if (bookId) {
			let resultCounter = 0;

			for (let i = 0; i < book.tags.length ; i++) {
				const tagId = await this.fetchIdOrInsertTag(book.tags[i]).catch(AppDatabase.errorHandler());
				if (tagId) {
					query = "INSERT INTO book_tag(book, tag) VALUES(?,?)";
					values = [bookId, tagId];
					const queryResult = await this.execInsert(query, values).catch(AppDatabase.errorHandler());
					if (queryResult) resultCounter++;
				}
			}

			return resultCounter === book.tags.length;

		} else {
			return false
		}
	}

	async fetchBooks(userId) {
		let query =   "SELECT " +
			"_id," +
			"title," +
			"author," +
			"thumbnail_main," +
			"thumbnail_secondary," +
			"editorial," +
			"sinopsis," +
			"genre," +
			"price," +
			"publication_date," +
			"creation_date," +
			"book_priority," +
			"already_read," +
			"already_bought FROM book WHERE user = ?";

		const values = [userId];
		const queryResult = await this.execQuery(query, values).catch(AppDatabase.errorHandler());
		const result = [];
		let tags;
		if (queryResult) {
			let item;
			for (let i = 0 ; i < queryResult.length ; i++) {
				item = queryResult[i];
				tags = await this.fetchTagsFromBook(item._id).catch(AppDatabase.errorHandler());
				if (item.thumbnail_main) {
					item.thumbnail_main = Buffer.from(item.thumbnail_main).toString('base64');
				}
				if (item.thumbnail_secondary) {
					item.thumbnail_secondary =Buffer.from(item.thumbnail_secondary).toString('base64');
				}
				result.push(
					{
						title: item.title,
						author: item.author,
						thumbnail_main: item.thumbnail_main,
						thumbnail_secondary: item.thumbnail_secondary,
						editorial: item.editorial,
						sinopsis: item.sinopsis,
						genre: item.genre,
						price: item.price,
						publication_date: item.publication_date,
						creationDate: item.creation_date,
						bookPriority: item.book_priority,
						read: item.already_read,
						bought: item.already_bought,
						tags: tags
					}
				);
			}
			return result;
		}
	}

// =====================================================================================================================
// Tag methods
// =====================================================================================================================

	async insertTag(tag) {
		const query = "INSERT INTO tag(tag) VALUES(?) RETURNING _id";
		const values = [tag.tag];
		return await this.execQuery(query, values).catch(AppDatabase.errorHandler());
	}

	async fetchTagsFromBook(bookId) {

		const tagsId = await this.fetchTagsBook(bookId);
		const result = [];
		if (tagsId) {
			for (let i = 0 ; i < tagsId ; i++) {
				let tag = await this.fetchTagById(tagsId[i]);
				if (tag) {
					result.push(tag);
				}
			}
			return result;
		}
		return null;
	}

	async fetchIdOrInsertTag(tag) {
		const storedTag = await this.fetchTagByName(tag);
		if (storedTag) {
			return storedTag._id;
		} else {
			return await this.insertTag(tag).catch(AppDatabase.errorHandler());
		}
	}

	async fetchTagByName(tag) {
		const query = "SELECT _id, tag FROM tag WHERE tag = ? LIMIT 1";
		const values = [tag.tag];
		const queryResult = await this.execQuery(query, values).catch(AppDatabase.errorHandler());
		if (queryResult && queryResult.length === 1) {
			return queryResult[0];
		}
		return null;
	}

	async fetchTagById(id) {
		const query = "SELECT _id, tag FROM tag WHERE _id = ?";
		const values = [id];
		const queryResult = await this.execQuery(query, values).catch(AppDatabase.errorHandler());
		if (queryResult && queryResult.length === 1) {
			return queryResult[0];
		}
		return null;
	}

// =====================================================================================================================
// Book Tag methods
// =====================================================================================================================

	async fetchTagsBook(bookId) {
		const query = "SELECT tag FROM book_tag WHERE book = ?";
		const values = [bookId];
		const queryResult = await this.execQuery(query, values).catch(AppDatabase.errorHandler());
		if (queryResult) {
			return queryResult;
		}
		return null;
	}

// =====================================================================================================================
// Generic query executors
// =====================================================================================================================

	async execQuery(query, queryValues) {
		let conn = await this.pool.getConnection();
		let queryResult = await conn.query(query, queryValues);
		conn.end();
		return queryResult;
	}

	async execInsert(query, queryValues) {
		// TODO: Check error Handler
		let result = await this.execQuery(query, queryValues).catch(AppDatabase.errorHandler);
		return !!result['affectedRows'];
	}

// =====================================================================================================================
// Static error handler
// =====================================================================================================================

	static errorHandler(error) {
		return error;
	}

}

module.exports = AppDatabase;