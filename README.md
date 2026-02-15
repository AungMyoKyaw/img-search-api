# Image Search API

A RESTful API for searching images using Google Custom Search with MongoDB-based search history tracking.

## Features

- Search images using Google Custom Search API
- Track search history with timestamps
- Retrieve latest search queries
- Health check endpoint for monitoring

## Prerequisites

- Node.js >= 14.0.0
- MongoDB database
- Google Custom Search API key
- Google Custom Search Engine ID

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/aungmyokyaw/img-search-api.git
cd img-search-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example environment file and configure your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

| Variable | Description | How to obtain |
|----------|-------------|---------------|
| `PORT` | Server port (default: 8080) | Optional |
| `MONGODB_URI` | MongoDB connection string | Your MongoDB instance |
| `GOOGLE_API_KEY` | Google API key | [Google Cloud Console](https://console.developers.google.com/) |
| `GOOGLE_CSE_ID` | Custom Search Engine ID | [Google CSE](https://cse.google.com/) |

### 4. Start the server

```bash
npm start
```

## API Endpoints

### Search Images

```
GET /api/imgSearch/:searchTerm?offset=2
```

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `searchTerm` | string | Yes | The term to search for (URL parameter) |
| `offset` | number | No | Page number for pagination (default: 1, max: 100) |

**Example Request:**

```bash
curl http://localhost:8080/api/imgSearch/cats?offset=2
```

**Response:**

```json
[
  {
    "url": "https://example.com/image1.jpg",
    "snippet": "Image description",
    "thumbnail": "https://example.com/thumb1.jpg",
    "context": "https://example.com/page"
  }
]
```

### Get Latest Searches

```
GET /api/latest/imgsearch
```

Returns the last 10 search queries.

**Example Request:**

```bash
curl http://localhost:8080/api/latest/imgsearch
```

**Response:**

```json
[
  {
    "term": "cats",
    "when": "2024-01-15T08:34:36.105Z"
  }
]
```

### Health Check

```
GET /health
```

Returns server health status.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2024-01-15T08:34:36.105Z"
}
```

## Error Responses

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 404 | Not Found - Endpoint does not exist |
| 500 | Internal Server Error - Something went wrong |

**Error Response Format:**

```json
{
  "error": "Error message description"
}
```

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB
- **API:** Google Custom Search API

## License

ISC
