# Wikisei API docs
This file describes the endpoints and requests available to the API.

## Pages

Page names are stored as lowercase strings passed through [slugify](https://www.npmjs.com/package/slugify) with a maximum of 20 characters.

### /api/page/
### POST
The body should be JSON of the shape:
```json
{
  "name": "The name of the article (required)",
  "markdown": "The markdown source of the article (required)",
  "tags": "comma,separated,tags"
}
```
Tags are not required. Empty tags will be trimmed (e.g. `a,,b` will become `a,b`).
If an article exists under the name, 409 Conflict will be returned.
If any part of the JSON fails to validate, such as a number being passed instead of a string, 400 Bad Request will be returned along with a JSON payload with the shape:
```json
{
  "error": true,
  "path": "(the problematic item)",
  "type": "(the type of the error as reported by joi)",
  "annotation": "(an annotation of the error in the json)"
}
```

### /api/page/:page_name/
#### GET
Returns the page under the name `:page_name`, if a page exists. If no page exists, returns 404 File Not Found.
The page data will be of the shape:
```json
{
  "slug": "name-of-the-page",
  "name": "The human-friendly name of the page",
  "markdown": "The *markdown* source of the page",
  "html": "The rendered html of the page",
  "created": 1592020337,
  "updated": 1592020463,
  "tags": "the,page's,tags"
}
```
The "created" and "updated" fields are UNIX timestamps as returned by Javascript's ``Date.now()``, and refer to when the page was made, and when it was last updated, respectively.
