import {
  getAllBooks,
  getBookById,
  addBook,
  updateBook,
  deleteBook,
  authorExists,
} from '../models/books.js';

const CREATE_FIELDS = new Set(['id', 'authorId', 'title', 'publicationDate']);
const UPDATE_FIELDS = new Set(['authorId', 'title', 'publicationDate']);

const isValidDate = (value) => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (year < 1 || month < 1 || month > 12) {
    return false;
  }

  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

  return day >= 1 && day <= daysInMonth[month - 1];
};

const validateBookPayload = (payload, mode) => {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Book data must be an object.';
  }

  const allowedFields = mode === 'create' ? CREATE_FIELDS : UPDATE_FIELDS;
  if (Object.keys(payload).some((field) => {
    return !allowedFields.has(field);
  })) {
    return 'Request contains unsupported fields.';
  }

  if (mode === 'create' && (typeof payload.id !== 'string' || !payload.id.trim())) {
    return 'Book id is required.';
  }

  if (typeof payload.authorId !== 'string' || !payload.authorId.trim()) {
    return 'Author id is required.';
  }

  if (typeof payload.title !== 'string' || !payload.title.trim()) {
    return 'Book title is required.';
  }

  if (!isValidDate(payload.publicationDate)) {
    return 'Publication date must be a valid date in YYYY-MM-DD format.';
  }

  return null;
};

const parsePositiveInteger = (value, defaultValue) => {
  if (value === undefined) {
    return defaultValue;
  }

  if (typeof value !== 'string' || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isSafeInteger(parsedValue) ? parsedValue : null;
};

const getAllBooksHandler = async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 10);

  if (page === null || limit === null || limit > 100) {
    return res.status(400).json({ message: 'Page and limit must be positive integers; limit cannot exceed 100.' });
  }

  try {
    const result = await getAllBooks({ page, limit });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve books.' });
  }
};

const getBookByIdHandler = async (req, res) => {
  try {
    const book = await getBookById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json(book);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve book.' });
  }
};

const createBookHandler = async (req, res) => {
  const validationError = validateBookPayload(req.body, 'create');
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const book = {
    id: req.body.id.trim(),
    authorId: req.body.authorId.trim(),
    title: req.body.title.trim(),
    publicationDate: req.body.publicationDate,
  };

  try {
    if (!(await authorExists(book.authorId))) {
      return res.status(400).json({ message: 'Author does not exist.' });
    }

    const createdBook = await addBook(book);
    return res.status(201).json(createdBook);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Book id already exists.' });
    }

    return res.status(500).json({ message: 'Unable to create book.' });
  }
};

const updateBookHandler = async (req, res) => {
  const validationError = validateBookPayload(req.body, 'update');
  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  const bookUpdate = {
    authorId: req.body.authorId.trim(),
    title: req.body.title.trim(),
    publicationDate: req.body.publicationDate,
  };

  try {
    if (!(await getBookById(req.params.id))) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    if (!(await authorExists(bookUpdate.authorId))) {
      return res.status(400).json({ message: 'Author does not exist.' });
    }

    const result = await updateBook(req.params.id, bookUpdate);
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(200).json({ id: req.params.id, ...bookUpdate });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update book.' });
  }
};

const deleteBookHandler = async (req, res) => {
  try {
    const result = await deleteBook(req.params.id);
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Book not found.' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete book.' });
  }
};

export {
  getAllBooksHandler,
  getBookByIdHandler,
  createBookHandler,
  updateBookHandler,
  deleteBookHandler,
};
