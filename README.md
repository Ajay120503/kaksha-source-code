<div align="center">

<img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/Classroom.png" alt="Kaksha Logo" width="120" />

# 📚 Kaksha

### A Modern Full-Stack Classroom Management System

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express_5-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-Real--Time-010101?style=for-the-badge&logo=socket.io)](https://socket.io/)

**[🚀 Live Demo](#)** · **[📖 Report Bug](https://github.com/Ajay120503/kaksha-source-code/issues)** · **[✨ Request Feature](https://github.com/Ajay120503/kaksha-source-code/issues)**

</div>

---

## 📸 Project Preview

> Screenshots from the live application — showcasing all major features.

<table>
  <tr>
    <td align="center"><strong>🏠 Dashboard</strong></td>
    <td align="center"><strong>📋 Classrooms</strong></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/images/1.jpg" alt="Dashboard" width="100%"/></td>
    <td><img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/images/2.jpg" alt="Classrooms" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><strong>📝 Assignments</strong></td>
    <td align="center"><strong>📚 Materials</strong></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/images/3.jpg" alt="Assignments" width="100%"/></td>
    <td><img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/images/4.jpg" alt="Materials" width="100%"/></td>
  </tr>
  <tr>
    <td align="center"><strong>💬 Real-Time Chat</strong></td>
    <td align="center"><strong>🔔 Notifications</strong></td>
  </tr>
  <tr>
    <td><img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/images/5.jpg" alt="Chat" width="100%"/></td>
    <td><img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/images/6.jpg" alt="Notifications" width="100%"/></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><strong>🛡️ Admin Panel</strong></td>
  </tr>
  <tr>
    <td colspan="2" align="center"><img src="https://raw.githubusercontent.com/Ajay120503/kaksha-source-code/main/frontend/public/images/7.jpg" alt="Admin Panel" width="60%"/></td>
  </tr>
</table>

---

## 🌐 Live Project

> 🔗 **[https://kaksh-v1.vercel.app](https://kaksh-v1.vercel.app)**

---

## ✨ Features

### 👨‍🎓 Student Features
- 📌 **Dashboard** — Overview of all your classrooms and activity
- 🏫 **Join Classrooms** — Join classes using a unique classroom code
- 📝 **Assignments** — View, submit, and track assignments
- 📚 **Study Materials** — Access learning materials uploaded by teachers
- 💬 **Real-Time Chat** — Per-classroom live chat powered by Socket.io
- 🔔 **Notifications** — Stay updated with class announcements
- 👤 **Profile Management** — View and update your profile

### 👩‍🏫 Teacher Features
- 🏫 **Create Classrooms** — Set up new classrooms in seconds
- 📣 **Posts & Announcements** — Publish class updates and announcements
- 📝 **Assignment Management** — Create, edit, and manage assignments
- 📋 **View Submissions** — Review student assignment submissions
- 📁 **Upload Materials** — Share study materials (PDFs, docs, images)
- ✅ **Join Requests** — Approve or reject student join requests

### 🛡️ Admin Features
- 📊 **Admin Dashboard** — Full platform stats and overview
- 👥 **User Management** — View and manage all registered users
- 🏫 **Classroom Overview** — Monitor all classrooms on the platform
- 🔑 **Role Requests** — Approve or reject teacher role requests
- 📈 **Analytics & Stats** — View engagement and usage statistics

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19 | UI Library |
| Vite | 7 | Build Tool |
| Tailwind CSS | 4 | Styling |
| DaisyUI | 5 | Component Library |
| React Router | 7 | Client-Side Routing |
| Socket.io Client | 4 | Real-Time Communication |
| Axios | 1.x | HTTP Client |
| Lucide React | Latest | Icons |
| jsPDF | 4 | PDF Generation |
| highlight.js | 11 | Code Highlighting |
| emoji-picker-react | 4 | Emoji Support in Chat |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Node.js + Express | 5 | REST API Server |
| MongoDB + Mongoose | 9 | Database |
| Socket.io | 4 | Real-Time Events |
| JWT | 9 | Authentication |
| bcrypt | 6 | Password Hashing |
| Cloudinary | 2 | File/Image Uploads |
| Multer | 2 | Multipart File Handling |
| Tesseract.js | 7 | OCR (Text from Images) |
| pdf-parse | 1.x | PDF Text Extraction |
| mammoth | 1.x | Word Document Parsing |
| Resend | 6 | OTP / Email Service |

---

## 📁 Project Structure

```
kaksha-source-code/
├── frontend/                  # React + Vite frontend
│   ├── public/
│   │   └── images/            # App screenshots
│   └── src/
│       ├── pages/
│       │   ├── Auth/          # Login & Register
│       │   ├── Classroom/     # Classroom CRUD & Join
│       │   ├── Assignment/    # Assignments & Submissions
│       │   ├── Material/      # Study Materials
│       │   ├── Post/          # Announcements
│       │   ├── Notifications/ # Notification Center
│       │   └── admin/         # Admin Panel Pages
│       ├── components/
│       │   ├── chat/          # Real-time Chat Components
│       │   └── admin/         # Admin UI Components
│       ├── context/           # React Context (Auth, Classroom, etc.)
│       ├── hooks/             # Custom React Hooks
│       ├── routes/            # Route Guards (Private, Role, Admin)
│       └── services/          # API Service Layers
│
└── backend/                   # Node.js + Express backend
    └── src/
        ├── controllers/       # Route Controllers
        ├── middleware/        # Auth & Role Middleware
        ├── utils/             # Helpers (OTP, Upload, OCR, Plagiarism)
        ├── config/            # DB & Cloudinary Config
        ├── socket.js          # Socket.io Setup
        └── app.js             # Express App
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)
- Cloudinary Account
- Resend API Key (for OTP emails)

### 1. Clone the Repository

```bash
git clone https://github.com/Ajay120503/kaksha-source-code.git
cd kaksha-source-code
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5001
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
RESEND_API_KEY=your_resend_api_key
FRONTEND_URL=https://your-frontend-url.vercel.app
```

Start the backend:

```bash
npm run dev
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_BACKEND_URL=http://localhost:5001
```

> 💡 In production, change `VITE_BACKEND_URL` to your deployed backend URL.

```bash
npm run dev
```

The app will be running at **http://localhost:5173**

---

## 🔐 User Roles

| Role | Access Level |
|---|---|
| **Student** | Join classrooms, submit assignments, access materials & chat |
| **Teacher** | Create classrooms, post announcements, manage assignments & materials |
| **Admin** | Full platform control — users, classrooms, role requests, stats |

> Teachers must request a role upgrade from Admin before getting teacher privileges.

---

## 🌐 Deployment

- **Frontend** → Deployed on [Vercel](https://vercel.com/)
- **Backend** → Deployable on [Render](https://render.com/) / [Railway](https://railway.app/)
- **Database** → [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Storage** → [Cloudinary](https://cloudinary.com/)

---

## 🤝 Contributing

Contributions are always welcome!

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Author

**Ajay** — [@Ajay120503](https://github.com/Ajay120503)

<div align="center">

Made with ❤️ for better classroom management

⭐ Star this repo if you find it useful!

</div>