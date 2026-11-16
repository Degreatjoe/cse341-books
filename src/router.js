import express from "express";
import { getBooksHandler, getBookByIdHandler } from "./controllers/books.js";
import {
  getAllAuthors,
  getAuthorById,
  addAuthor,
  updateAuthor,
  deleteAuthor,
} from './controllers/authors.js';

const router = express.Router();

/**
 * @openapi
 * /books:
 *   get:
 *     tags: [Books]
 *     summary: Get all books
 *     responses:
 *       200:
 *         description: A list of books
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "b1"
 *                   authorId:
 *                     type: string
 *                     example: "a1"
 *                   title:
 *                     type: string
 *                     example: "The Hobbit"
 *                   publicationDate:
 *                     type: string
 *                     example: "1937-09-21"
 *       500:
 *         description: Server error
 */
router.get("/books", getBooksHandler);

/**
 * @openapi
 * /books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The custom book ID to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single book record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "b1"
 *                 authorId:
 *                   type: string
 *                   example: "a1"
 *                 title:
 *                   type: string
 *                   example: "The Hobbit"
 *                 publicationDate:
 *                   type: string
 *                   example: "1937-09-21"
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/books/:id", getBookByIdHandler);

/**
 * @openapi
 * /authors:
 *   get:
 *     tags: [Authors]
 *     summary: Get all authors with pagination
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *     responses:
 *       200:
 *         description: A paginated list of authors
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 authors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "a1"
 *                       firstName:
 *                         type: string
 *                         example: "J.R.R."
 *                       lastName:
 *                         type: string
 *                         example: "Tolkien"
 *                       email:
 *                         type: string
 *                         example: "example@example.com"
 *                       birthYear:
 *                         type: integer
 *                         example: 1892
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalAuthors:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 1
 *       400:
 *         description: Invalid pagination values
 *       500:
 *         description: Server error
 */
router.get("/authors", getAllAuthors);

/**
 * @openapi
 * /authors/{id}:
 *   get:
 *     tags: [Authors]
 *     summary: Get an author by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The custom author ID to retrieve
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A single author record
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "a1"
 *                 firstName:
 *                   type: string
 *                   example: "J.R.R."
 *                 lastName:
 *                   type: string
 *                   example: "Tolkien"
 *                 email:
 *                   type: string
 *                   example: "example@example.com"
 *                 birthYear:
 *                   type: integer
 *                   example: 1892
 *       404:
 *         description: Author not found
 *       500:
 *         description: Server error
 */
router.get("/authors/:id", getAuthorById);

/**
 * @openapi
 * /authors:
 *   post:
 *     tags: [Authors]
 *     summary: Create a new author
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - firstName
 *               - lastName
 *               - email
 *               - birthYear
 *             properties:
 *               id:
 *                 type: string
 *                 example: "a1"
 *               firstName:
 *                 type: string
 *                 example: "J.R.R."
 *               lastName:
 *                 type: string
 *                 example: "Tolkien"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "example@example.com"
 *               birthYear:
 *                 type: integer
 *                 example: 1892
 *     responses:
 *       201:
 *         description: Author created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "a1"
 *                 firstName:
 *                   type: string
 *                   example: "J.R.R."
 *                 lastName:
 *                   type: string
 *                   example: "Tolkien"
 *                 email:
 *                   type: string
 *                   example: "example@example.com"
 *                 birthYear:
 *                   type: integer
 *                   example: 1892
 *       400:
 *         description: Missing or invalid fields
 *       409:
 *         description: Duplicate author id or email
 *       500:
 *         description: Server error
 */
router.post("/authors", addAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   put:
 *     tags: [Authors]
 *     summary: Update an existing author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The custom author ID to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - birthYear
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "J.R.R."
 *               lastName:
 *                 type: string
 *                 example: "Tolkien"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "example@example.com"
 *               birthYear:
 *                 type: integer
 *                 example: 1892
 *     responses:
 *       200:
 *         description: Author updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "a1"
 *                 firstName:
 *                   type: string
 *                   example: "J.R.R."
 *                 lastName:
 *                   type: string
 *                   example: "Tolkien"
 *                 email:
 *                   type: string
 *                   example: "example@example.com"
 *                 birthYear:
 *                   type: integer
 *                   example: 1892
 *       400:
 *         description: Invalid update payload or attempted id change
 *       404:
 *         description: Author not found
 *       409:
 *         description: Email already belongs to another author
 *       500:
 *         description: Server error
 */
router.put("/authors/:id", updateAuthor);

/**
 * @openapi
 * /authors/{id}:
 *   delete:
 *     tags: [Authors]
 *     summary: Delete an author
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: The custom author ID to delete
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Author deleted successfully
 *       404:
 *         description: Author not found
 *       409:
 *         description: Author cannot be deleted because books are still associated with it
 *       500:
 *         description: Server error
 */
router.delete("/authors/:id", deleteAuthor);

export default router;
