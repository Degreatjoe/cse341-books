import {getDb} from "../db/connect.js";

const getAllBooks = async () => {
  const db = getDb();
  return await db.collection('books').find({}).toArray();
};

const getBookById = async (bookid) => {
  const db = getDb();
  return await db.collection('books').findOne({ id: bookid });
};

export { getAllBooks, getBookById };
