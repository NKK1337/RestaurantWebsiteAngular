# [Step Restaurant]

A restaurant website I built for school and as part of my portfolio. It has a frontend for visitors and a backend API that handles accounts, dishes, and the rest of the data.

![Home page](docs/screenshot-home.png)

## Built with

- Frontend: [your frontend]
- Backend: [your backend]
- Database: [your database]

## Running it locally

You need [Node / JDK / .NET, whichever you use] and [your database] installed.

```bash
git clone https://github.com/NKK1337/[repo-name].git
cd [repo-name]
[install command]
```

Copy `.env.example` to `.env` and put in your own values (database connection, JWT secret, etc.). Then:

```bash
[start command]
```

It runs on `http://localhost:[port]`.

## API

The backend is a REST API. Every endpoint returns the same `ApiResponse` shape:

```json
{
  "success": true,
  "message": "Some message",
  "data": {}
}
```

You can find all the endpoints in the [controllers/routes folder](backend/).

Endpoints that need a logged-in user expect a token in the `Authorization` header.

## Notes

This is a school project that I keep working on, so things change as I add more. If you find a bug, feel free to open an issue.

Made by [NKK1337](https://github.com/NKK1337).