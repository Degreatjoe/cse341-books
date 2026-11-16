import { writeFileSync } from 'node:fs';
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Books API',
      version: '1.0.0',
      description: 'A simple API for working with books'
    },
    components: {
      schemas: {
        Book: {
          type: 'object',
          required: ['id', 'authorId', 'title', 'publicationDate'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', example: 'b1' },
            authorId: { type: 'string', example: 'a1' },
            title: { type: 'string', example: 'The Hobbit' },
            publicationDate: { type: 'string', format: 'date', example: '1937-09-21' }
          }
        },
        NewBook: {
          type: 'object',
          required: ['id', 'authorId', 'title', 'publicationDate'],
          additionalProperties: false,
          properties: {
            id: { type: 'string', example: 'b4' },
            authorId: { type: 'string', example: 'a1' },
            title: { type: 'string', example: 'Example Book Title' },
            publicationDate: { type: 'string', format: 'date', example: '2026-01-15' }
          }
        },
        BookUpdate: {
          type: 'object',
          required: ['authorId', 'title', 'publicationDate'],
          additionalProperties: false,
          properties: {
            authorId: { type: 'string', example: 'a2' },
            title: { type: 'string', example: 'Updated Book Title' },
            publicationDate: { type: 'string', format: 'date', example: '2026-02-20' }
          }
        },
        Pagination: {
          type: 'object',
          required: ['page', 'limit', 'totalBooks', 'totalPages'],
          properties: {
            page: { type: 'integer', example: 1 },
            limit: { type: 'integer', example: 10 },
            totalBooks: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 1 }
          }
        },
        Error: {
          type: 'object',
          required: ['message'],
          properties: {
            message: { type: 'string', example: 'Book not found.' }
          }
        }
      }
    },
    servers: [
      {
        url: '/',
        description: 'Current server'
      }
    ]
  },
  apis: ['./src/router.js', './app.js']
};

const swaggerSpec = swaggerJsdoc(options);

writeFileSync('./swagger.json', JSON.stringify(swaggerSpec, null, 2));
console.log('Swagger documentation generated.');