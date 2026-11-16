import { getDb } from '../db/connect.js';

const getAllAuthors = async ({ page = 1, limit = 10 } = {}) => {
  const db = getDb();
  const collection = db.collection('authors');

  const sanitizedPage = Number.isInteger(Number(page)) && Number(page) > 0 ? Number(page) : 1;
  const sanitizedLimit = Number.isInteger(Number(limit)) && Number(limit) > 0 ? Number(limit) : 10;
  const maxLimit = 100;
  const actualLimit = Math.min(sanitizedLimit, maxLimit);

  const totalAuthors = await collection.countDocuments();
  const authors = await collection
    .find({})
    .skip((sanitizedPage - 1) * actualLimit)
    .limit(actualLimit)
    .toArray();

  return {
    authors,
    pagination: {
      page: sanitizedPage,
      limit: actualLimit,
      totalAuthors,
      totalPages: totalAuthors === 0 ? 0 : Math.ceil(totalAuthors / actualLimit),
    },
  };
};

const getAuthorsById = async (authorId) => {
  const db = getDb();
  const collection = db.collection('authors');
  const author = await collection.findOne({ id: authorId });

  return author;
};

const findAuthorByEmail = async (email, excludeAuthorId = null) => {
  const db = getDb();
  const collection = db.collection('authors');
  const query = { email: String(email).trim() };

  if (excludeAuthorId) {
    query.id = { $ne: excludeAuthorId };
  }

  return collection.findOne(query);
};

const addAuthor = async (authorData) => {
  const db = getDb();
  const collection = db.collection('authors');
  const result = await collection.insertOne(authorData);

  return result;
};

const updateAuthor = async (authorId, updatedData) => {
  const db = getDb();
  const collection = db.collection('authors');
  const result = await collection.updateOne({ id: authorId }, { $set: updatedData });

  return result;
};

const deleteAuthor = async (authorId) => {
  const db = getDb();
  const collection = db.collection('authors');
  const result = await collection.deleteOne({ id: authorId });

  return result;
};

const hasBooksForAuthor = async (authorId) => {
  const db = getDb();
  const collection = db.collection('books');
  const book = await collection.findOne({ authorId });

  return Boolean(book);
};

export {
  getAllAuthors,
  getAuthorsById,
  findAuthorByEmail,
  addAuthor,
  updateAuthor,
  deleteAuthor,
  hasBooksForAuthor,
};