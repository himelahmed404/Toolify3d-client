# Toolify3D

Custom 3D printing storefront with customer dashboard, admin panel, and Express API.

## Live Website URL

| App | URL |
|-----|-----|
| **Storefront** | [https://toolify3d.vercel.app](https://toolify3d.vercel.app) |
| **Admin panel** | [https://toolify3d-admin.vercel.app](https://toolify3d-admin.vercel.app) |
| **API** | [https://toolify3d-api.onrender.com](https://toolify3d-api.onrender.com) |

API health check: [https://toolify3d-api.onrender.com/health](https://toolify3d-api.onrender.com/health)

## GitHub Repository Link

| Part | Repository |
|------|------------|
| **Frontend (store)** | [himelahmed404/Toolify3d-client](https://github.com/himelahmed404/Toolify3d-client) |
| **Admin frontend** | [himelahmed404/Toolify3d-admin](https://github.com/himelahmed404/Toolify3d-admin) |
| **Backend** | [himelahmed404/Toolify3d-server](https://github.com/himelahmed404/Toolify3d-server) |

### Frontend source code

- Store: https://github.com/himelahmed404/Toolify3d-client  
- Admin: https://github.com/himelahmed404/Toolify3d-admin  

### Backend source code

- API: https://github.com/himelahmed404/Toolify3d-server  

## Demo Credentials

### User

- **Email:** `a@agmail.com`  
- **Password:** `asdfasdf`  

### Admin

- **Email:** `toolify.admin1337@gmail.com`  
- **Password:** `toolify3dweb1337_Admin-$7R0nG`  

> Use the **User** credentials on the storefront. Use the **Admin** credentials on the admin panel only.

## Tech stack

- **Frontend:** Next.js (App Router), Tailwind CSS, Better Auth, Firebase Storage  
- **Admin:** Next.js, Better Auth, Socket.IO client  
- **Backend:** Express, MongoDB, JWT, Socket.IO, Firebase Admin  
- **Hosting:** Vercel (store + admin), Render (API), MongoDB Atlas  

## Local development

See each repository’s docs and `.env.example` for environment variables.

```bash
# Store (port 3000)
cd toolify-3d && npm install && npm run dev

# Admin (port 3001)
cd toolify-3d_admin && npm install && npm run dev

# API (port 5000)
cd toolify-3d_server && npm install && npm run dev
```
