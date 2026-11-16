import {
  getAllAuthors as getAllAuthorsFromDb,
  getAuthorsById as getAuthorsByIdFromDb,
  findAuthorByEmail,
  addAuthor as addAuthorToDb,
  updateAuthor as updateAuthorInDb,
  deleteAuthor as deleteAuthorFromDb,
  hasBooksForAuthor,
} from '../models/authors.js';

const ALLOWED_CREATE_FIELDS = new Set(['id', 'firstName', 'lastName', 'email', 'birthYear']);
const ALLOWED_UPDATE_FIELDS = new Set(['firstName', 'lastName', 'email', 'birthYear']);

const isValidEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim());
};

const sanitizeAuthorPayload = (payload, mode = 'create') => {
  const allowedFields = mode === 'create' ? ALLOWED_CREATE_FIELDS : ALLOWED_UPDATE_FIELDS;

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return 'Author data must be an object.';
  }

  const keys = Object.keys(payload);

  if (keys.some((key) => {
    return !allowedFields.has(key);
  })) {
    return 'Unsupported fields in request body.';
  }

  if (mode === 'create') {
    if (typeof payload.id !== 'string' || !payload.id.trim()) {
      return 'Author id is required.';
    }
  } else if ('id' in payload) {
    return 'Author id cannot be changed.';
  }

  if (typeof payload.firstName !== 'string' || !payload.firstName.trim()) {
    return 'First name is required.';
  }

  if (typeof payload.lastName !== 'string' || !payload.lastName.trim()) {
    return 'Last name is required.';
  }

  if (typeof payload.email !== 'string' || !isValidEmail(payload.email)) {
    return 'A valid email is required.';
  }

  if (!Number.isInteger(payload.birthYear) || payload.birthYear < 0 || payload.birthYear > 9999) {
    return 'Birth year must be a valid integer.';
  }

  return null;
};

const getAllAuthors = async (req, res) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ message: 'Page and limit query parameters must be valid integers.' });
    }

    const result = await getAllAuthorsFromDb({ page, limit });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve authors.' });
  }
};

const getAuthorById = async (req, res) => {
  const authorId = req.params.id;

  try {
    const author = await getAuthorsByIdFromDb(authorId);

    if (!author) {
      return res.status(404).json({ message: 'Author not found.' });
    }

    return res.status(200).json(author);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to retrieve author.' });
  }
};

const addAuthor = async (req, res) => {
  const authorData = req.body;
  const validationError = sanitizeAuthorPayload(authorData, 'create');

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const trimmedAuthor = {
      id: authorData.id.trim(),
      firstName: authorData.firstName.trim(),
      lastName: authorData.lastName.trim(),
      email: authorData.email.trim(),
      birthYear: authorData.birthYear,
    };

    const existingAuthor = await getAuthorsByIdFromDb(trimmedAuthor.id);
    if (existingAuthor) {
      return res.status(409).json({ message: 'Author id already exists.' });
    }

    const existingEmail = await findAuthorByEmail(trimmedAuthor.email);
    if (existingEmail) {
      return res.status(409).json({ message: 'Email address already exists.' });
    }

    await addAuthorToDb(trimmedAuthor);
    return res.status(201).json(trimmedAuthor);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to add author.' });
  }
};

const updateAuthor = async (req, res) => {
  const authorId = req.params.id;
  const updatedData = req.body;
  const validationError = sanitizeAuthorPayload(updatedData, 'update');

  if (validationError) {
    return res.status(400).json({ message: validationError });
  }

  try {
    const existingAuthor = await getAuthorsByIdFromDb(authorId);
    if (!existingAuthor) {
      return res.status(404).json({ message: 'Author not found.' });
    }

    const trimmedUpdate = {
      firstName: updatedData.firstName.trim(),
      lastName: updatedData.lastName.trim(),
      email: updatedData.email.trim(),
      birthYear: updatedData.birthYear,
    };

    const duplicateEmail = await findAuthorByEmail(trimmedUpdate.email, authorId);
    if (duplicateEmail) {
      return res.status(409).json({ message: 'Email address already exists.' });
    }

    await updateAuthorInDb(authorId, trimmedUpdate);

    return res.status(200).json({
      id: authorId,
      ...existingAuthor,
      ...trimmedUpdate,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to update author.' });
  }
};

const deleteAuthor = async (req, res) => {
  const authorId = req.params.id;

  try {
    const existingAuthor = await getAuthorsByIdFromDb(authorId);
    if (!existingAuthor) {
      return res.status(404).json({ message: 'Author not found.' });
    }

    const hasBooks = await hasBooksForAuthor(authorId);
    if (hasBooks) {
      return res.status(409).json({
        message: 'Cannot delete author because one or more books are associated with this author.',
      });
    }

    await deleteAuthorFromDb(authorId);
    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ message: 'Unable to delete author.' });
  }
};

export { getAllAuthors, getAuthorById, addAuthor, updateAuthor, deleteAuthor };