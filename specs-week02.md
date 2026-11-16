# Books API Week 02 Spec - Final

## Feature 1: Book CRUD Operations and Author References

### Goal
Update the existing Week 01 book API so book documents include a reference to an author and the API supports all CRUD operations for books.

Every book route must be documented and testable in Swagger.

### Data Model
Book documents will be stored in the `books` collection.

Required book fields:
- `id`: string, required, unique custom id such as `b1`
- `authorId`: string, required, references the `id` field of an existing author document
- `title`: string, required
- `publicationDate`: string, required, valid date in `YYYY-MM-DD` format

Books will continue to use custom string IDs instead of MongoDB `_id` values for route parameters.

The database must have a unique index on the `id` field and an index on the `authorId` field.

### Validation Rules
- All required fields must be provided when creating or updating a book.
- The `id` must be a non-empty string and must be unique.
- The `authorId` must be a non-empty string matching the custom `id` of an existing author.
- The `title` must be a non-empty string.
- The `publicationDate` must be a valid calendar date in `YYYY-MM-DD` format.
- Invalid dates and incorrectly formatted dates must be rejected.
- MongoDB `_id` and other internal database fields must not be accepted as client-editable fields.
- Unknown fields in request bodies must be rejected.

### Relationship to Authors
Each book identifies its author using an `authorId` field.

The value of `authorId` must match the custom `id` value of an existing author document.

When creating or updating a book, the API must verify that the submitted `authorId` matches an existing author.

If the author does not exist, the API must reject the request with a `400` status code and return a JSON error message.

### Routes

#### GET /books
Purpose: Return all books with pagination support.

Optional query parameters:
- `page`: page number, defaults to `1`
- `limit`: books per page, defaults to `10`, maximum of `100`

Success:
- Status code: `200`
- Response body: an object containing the books array and pagination information.

Example response:

```json
{
  "books": [
    {
      "id": "b1",
      "authorId": "a1",
      "title": "Example Book",
      "publicationDate": "2026-01-15"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalBooks": 1,
    "totalPages": 1
  }
}
```

Errors:
- `400` if the page or limit query parameters are invalid
- `500` if an unexpected server or database error occurs

#### GET /books/:id
Purpose: Return one book by its custom id.

Success:
- Status code: `200`
- Response body: the matching book object.

Example response:

```json
{
  "id": "b1",
  "authorId": "a1",
  "title": "Example Book",
  "publicationDate": "2026-01-15"
}
```

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

#### POST /books
Purpose: Create a new book.

Request body:

```json
{
  "id": "b4",
  "authorId": "a1",
  "title": "Example Book Title",
  "publicationDate": "2026-01-15"
}
```

Success:
- Status code: `201`
- Response body: the newly created book object.

Errors:
- `400` if a required field is missing or invalid
- `400` if the `authorId` does not match an existing author
- `400` if the request contains unsupported fields
- `409` if the book `id` already exists
- `500` if an unexpected server or database error occurs

#### PUT /books/:id
Purpose: Update an existing book.

Request body:

```json
{
  "authorId": "a2",
  "title": "Updated Book Title",
  "publicationDate": "2026-02-20"
}
```

Success:
- Status code: `200`
- Response body: the updated book object.

Errors:
- `400` if a required field is missing or invalid
- `400` if the `authorId` does not match an existing author
- `400` if the request contains unsupported fields, including an attempted `id` change
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

All editable fields must be provided when updating a book. The book's custom `id` must remain unchanged.

#### DELETE /books/:id
Purpose: Delete an existing book.

Success:
- Status code: `204`
- Response body: none

Errors:
- `404` if no book exists with that id
- `500` if an unexpected server or database error occurs

### Error Response Format
All error responses must use a consistent JSON structure.

Example:

```json
{
  "message": "Book not found."
}
```

The API must not expose database error details, stack traces, or other internal server information.

### Database and Performance Requirements
- Create a unique index on the `id` field in the books collection.
- Create an index on the `authorId` field to improve author reference lookups.
- Use pagination for the GET /books endpoint.
- Set a maximum page limit of 100 books.
- Use appropriate database queries rather than retrieving unnecessary documents.

### Swagger Documentation
Swagger must document every book route.

Documentation must include:
- HTTP method and endpoint path
- Description of the route's purpose
- Required path parameters
- Optional query parameters for pagination
- Request body schemas for POST and PUT
- Expected success status codes and response bodies
- Possible error status codes and JSON response structures

Every book route must be testable directly from the deployed Swagger page.

### Deployment Expectations
After implementation, the book routes must work locally and from the deployed Render application.

The deployed Swagger page at `/api-docs` must allow someone to test every book route from the browser.

The book API must correctly communicate with the authors collection to validate author references.

---

# Authors API Week 02 Spec - Final

## Feature 2: Author CRUD Operations and Book References

### Goal
Update the existing Week 01 author API so author documents support all CRUD operations.

The API must allow clients to create, retrieve, update, and delete authors.

Every author route must be documented and testable in Swagger.

The API must also prevent an author from being deleted while one or more books still reference that author.

### Data Model
Author documents will be stored in the `authors` collection.

Required author fields:
- `id`: string, required, unique custom id such as `a1`
- `firstName`: string, required
- `lastName`: string, required
- `email`: string, required, unique
- `birthYear`: integer, required, the author's birth year

Authors will continue to use custom string IDs instead of MongoDB `_id` values for route parameters.

The database must have a unique index on the `id` field and a unique index on the `email` field.

### Validation Rules
- All required fields must be provided when creating or updating an author.
- The `id` must be a non-empty string and must be unique.
- The `firstName` must be a non-empty string.
- The `lastName` must be a non-empty string.
- The `email` must be a valid email address and must be unique.
- The `birthYear` must be a valid integer year value and must be stored as a number, not a date string.
- MongoDB `_id` and other internal database fields must not be accepted as client-editable fields.
- Unknown fields in request bodies must be rejected.

### Relationship to Books
Books identify their authors using an `authorId` field.

The value of `authorId` must match the custom `id` value of an existing author document.

When deleting an author, the API must check whether any books reference that author's custom `id`.

If one or more books reference the author, the API must reject the deletion request with a `409` status code and return a JSON error message explaining that the author cannot be deleted because books are associated with them.

If no books reference the author, the API may proceed with the deletion.

The check must use an efficient database existence query rather than retrieving every book associated with the author.

### Routes

#### GET /authors
Purpose: Return all authors with pagination support.

Optional query parameters:
- `page`: the page number, defaults to `1`
- `limit`: the number of authors per page, defaults to `10`, maximum of `100`

Success:
- Status code: `200`
- Response body: an object containing the authors array and pagination information.

Example response:

```json
{
  "authors": [
    {
      "id": "a1",
      "firstName": "John",
      "lastName": "Smith",
      "email": "john.smith@example.com",
      "birthYear": 1985
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "totalAuthors": 1,
    "totalPages": 1
  }
}
```

Errors:
- `400` if the page or limit query parameters are invalid
- `500` if an unexpected server or database error occurs

#### GET /authors/:id
Purpose: Return one author by their custom id.

Success:
- Status code: `200`
- Response body: the matching author object.

Example response:

```json
{
  "id": "a1",
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "birthYear": 1985
}
```

Errors:
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

#### POST /authors
Purpose: Create a new author.

Request body:

```json
{
  "id": "a2",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "birthYear": 1990
}
```

Success:
- Status code: `201`
- Response body: the newly created author object.

Example response:

```json
{
  "id": "a2",
  "firstName": "Jane",
  "lastName": "Doe",
  "email": "jane.doe@example.com",
  "birthYear": 1990
}
```

Errors:
- `400` if a required field is missing or invalid
- `400` if the request contains unsupported fields
- `409` if the author `id` already exists
- `409` if the email address is already associated with another author
- `500` if an unexpected server or database error occurs

#### PUT /authors/:id
Purpose: Update an existing author.

Request body:

```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "birthYear": 1991
}
```

Success:
- Status code: `200`
- Response body: the updated author object.

Example response:

```json
{
  "id": "a2",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@example.com",
  "birthYear": 1991
}
```

Errors:
- `400` if a required field is missing or invalid
- `400` if the request contains unsupported fields, including an attempted `id` change
- `404` if no author exists with that id
- `409` if the email address is already associated with another author
- `500` if an unexpected server or database error occurs

All editable fields must be provided when updating an author. The author's custom `id` must remain unchanged.

#### DELETE /authors/:id
Purpose: Delete an existing author.

Before deleting an author, the API must check the books collection for any book whose `authorId` matches the author's custom `id`.

The API must not delete an author while books still reference that author.

Success:
- Status code: `204`
- Response body: none

Errors:
- `409` if one or more books still reference the author
- `404` if no author exists with that id
- `500` if an unexpected server or database error occurs

Example error response when an author still has books:

```json
{
  "message": "Cannot delete author because one or more books are associated with this author."
}
```

The deletion process must ensure that an author cannot be deleted while a new book is being created or updated to reference that author. Use an appropriate atomic or transactional database strategy where supported.

### Error Response Format
All error responses must use a consistent JSON structure.

Example:

```json
{
  "message": "Author not found."
}
```

Other examples:

```json
{
  "message": "Email address already exists."
}
```

```json
{
  "message": "Cannot delete author because one or more books are associated with this author."
}
```

The API must not expose database error details, stack traces, or other internal server information.

### Database and Performance Requirements
- Create a unique index on the `id` field in the authors collection.
- Create a unique index on the `email` field in the authors collection.
- Use pagination for the GET /authors endpoint.
- Set a maximum page limit of 100 authors.
- Use an efficient existence query when checking whether an author has associated books.
- Prevent duplicate records using database-level unique indexes, not only application-level checks.
- Handle database duplicate-key errors and return the appropriate `409` response.

### Swagger Documentation
Swagger must document every author route.

Documentation must include:
- HTTP method and endpoint path
- Description of the route's purpose
- Required path parameters
- Optional query parameters for pagination
- Request body schemas for POST and PUT
- Expected success status codes and response bodies
- Possible error status codes and JSON response structures

Every author route must be testable directly from the deployed Swagger page.

### Deployment Expectations
After implementation, the author routes must work locally and from the deployed Render application.

The deployed Swagger page at `/api-docs` must allow someone to test every author route from the browser.

Both the books and authors APIs must work together correctly.

The relationship between authors and books must be maintained so that:

- A book cannot be created with an author ID that does not exist.
- A book cannot be updated with an author ID that does not exist.
- An author cannot be deleted while books reference that author.
- An author can be deleted successfully once no books reference that author.
- Duplicate custom IDs cannot be created.
- Duplicate author email addresses cannot be created.
- Database errors are handled without exposing internal information.
