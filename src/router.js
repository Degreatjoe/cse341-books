import express from "express";
import {getBooksHandler, getBookByIdHandler} from "./controllers/books.js";


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
 *                   _id:
 *                     type: string
 *                     example: "64f0ef1c83f52b9c2d72123a"
 *                   title:
 *                     type: string
 *                     example: "The Hobbit"
 *                   author:
 *                     type: string
 *                     example: "J.R.R. Tolkien"
 *                   publishedYear:
 *                     type: integer
 *                     example: 1937
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
 *         description: The unique ID of the book to retrieve
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
 *                 _id:
 *                   type: string
 *                   example: "64f0ef1c83f52b9c2d72123a"
 *                 title:
 *                   type: string
 *                   example: "The Hobbit"
 *                 author:
 *                   type: string
 *                   example: "J.R.R. Tolkien"
 *                 publishedYear:
 *                   type: integer
 *                   example: 1937
 *       404:
 *         description: Book not found
 *       500:
 *         description: Server error
 */
router.get("/books/:bookid", getBookByIdHandler);

export default router;