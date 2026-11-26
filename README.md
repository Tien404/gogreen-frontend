# gogreen frontend

Web app for the Smart E-Mobility Hub course project. Students can rent vehicles and book parking or charging. Operators can monitor hubs, handle incidents, move shared vehicles, and run What-if scenarios.

**Stack:** React, TypeScript, Vite, React Router, Tailwind CSS, shadcn/ui (Radix), Axios, and Leaflet.

## Folder structure

| Folder                                | Contents                                       |
| ------------------------------------- | ---------------------------------------------- |
| `src/app/`                            | Routes, workspace layouts, and app providers   |
| `src/features/`                       | Student and operator screens                   |
| `src/shared/api/`, `src/integration/` | Typed API client and data mapping              |
| `src/shared/ui/`, `src/index.css`     | Shared controls, shadcn primitives, and styles |
| `tests/`                              | Frontend tests                                 |

## Run locally

Use Node.js 22.18+ and npm. Start the companion `Smart-Mobility-Hub-Backend` on port 8000, then run these commands from this repo:

```sh
npm ci
npm run dev -- --host 127.0.0.1
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Vite forwards `/api/v1` to the backend. Log in as `anh@demo.example` (student) or `nam@demo.example` (operator), both with the demo password `gogreen-demo`.

## Run the three-minute showcase

Start the backend with the [showcase commands](../Smart-Mobility-Hub-Backend/README.md#run-the-three-minute-showcase). With the backend running on port 8000, run this from the frontend repo:

```sh
API_PROXY_TARGET=http://127.0.0.1:8000 npm run dev -- --host 127.0.0.1 --port 5173 --strictPort
```

Open [http://127.0.0.1:5173](http://127.0.0.1:5173). Use `anh@gmail.com` or `bao@gmail.com` for students and `nam@gmail.com` for the operator. The showcase password is `12345678`.

The campus map loads OpenStreetMap tiles over the internet. Hub coordinates from the API take precedence; the four seeded Hubs otherwise use simulated locations in the VNU-HCM area. If tiles fail, the Hub list remains available. Keep the map attribution visible and follow the [tile usage policy](https://operations.osmfoundation.org/policies/tiles/).

See [`.env.example`](.env.example) for API URL and proxy settings. Run `npm test` for tests or `npm run build` for a production build.

Run `npm run lint` for ESLint or `npm run format` for Prettier.
`npm ci` installs the Husky pre-commit hook, which formats staged files and lints staged TypeScript.
