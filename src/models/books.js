import { getDb } from '../db/connect.js';

const getAllBooks = async ({ page = 1, limit = 10 } = {}) => {
  const collection = getDb().collection('books');
  const totalBooks = await collection.countDocuments();
  const books = await collection
    .find({}, { projection: { _id: 0 } })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return {
    books,
    pagination: {
      page,
      limit,
      totalBooks,
      totalPages: totalBooks === 0 ? 0 : Math.ceil(totalBooks / limit),
    },
  };
};

const getBookById = async (bookId) => {
  return getDb().collection('books').findOne({ id: bookId }, { projection: { _id: 0 } });
};

const addBook = async (bookData) => {
  await getDb().collection('books').insertOne(bookData);
  return bookData;
};

const updateBook = async (bookId, bookData) => {
  const result = await getDb()
    .collection('books')
    .updateOne({ id: bookId }, { $set: bookData });

  return result;
};

const deleteBook = async (bookId) => {
  return getDb().collection('books').deleteOne({ id: bookId });
};

const authorExists = async (authorId) => {
  const author = await getDb().collection('authors').findOne(
    { id: authorId },
    { projection: { _id: 1 } },
  );

  return Boolean(author);
};

export { getAllBooks, getBookById, addBook, updateBook, deleteBook, authorExists };
