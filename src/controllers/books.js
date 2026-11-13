import {getAllBooks, getBookById} from "../models/books.js";


const getBooksHandler = async (req, res) => {
  try {
    const books = await getAllBooks();
    res.status(200).json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

const getBookByIdHandler = async (req, res) => {
  const bookId = req.params.bookid;
  try {
    const book = await getBookById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.status(200).json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export { getBooksHandler, getBookByIdHandler };