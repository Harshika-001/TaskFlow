# TaskFlow - Elegant ToDo Application

A modern, full-stack todo management application with user authentication, priority-based task management, and real-time synchronization.

## 🌟 Features

- **User Authentication**: Secure signup and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Priority Levels**: Organize tasks by LOW, MEDIUM, and HIGH priority
- **Due Dates**: Set deadlines for your tasks
- **Task Status**: Mark tasks as complete or active
- **Search & Filter**: Find tasks by title, description, status, and priority
- **Responsive Design**: Beautiful dark-themed UI optimized for all devices
- **Real-time Updates**: Instant synchronization between frontend and backend
- **Rate Limiting**: API protected against abuse with request rate limiting
- **Security**: Password hashing with bcrypt, CORS protection, Helmet security headers

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Efficient form handling
- **Axios** - HTTP client
- **Framer Motion** - Smooth animations
- **Zod** - Schema validation
- **Lucide React** - Beautiful SVG icons

### Backend
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma ORM** - Database ORM
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Helmet** - Security headers
- **CORS** - Cross-origin resource sharing
- **Zod** - Schema validation

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL (v12 or higher)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/Harshika-001/TaskFlow.git
cd TaskFlow
```

### 2. Setup Backend
```bash
cd backend

# Install dependencies
npm install

# Create .env file with your database credentials
cp .env.example .env

# Update DATABASE_URL in .env with your PostgreSQL connection string
# Example: postgresql://user:password@localhost:5432/todo_db

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# Start backend server
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on `http://localhost:5174`

## 🔗 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Create a new user account
- `POST /login` - Login and receive JWT token
- `POST /logout` - Logout and clear session
- `GET /me` - Get current authenticated user info

### Todo Routes (`/api/todos`)
- `GET /` - Fetch all todos for authenticated user
- `POST /` - Create a new todo
- `PUT /:id` - Update an existing todo
- `DELETE /:id` - Delete a todo

### Health Check
- `GET /health` - API health status

## 📊 Database Schema

### User Model
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  todos     Todo[]
}
```

### Todo Model
```prisma
model Todo {
  id          String    @id @default(uuid())
  title       String
  description String?
  isCompleted Boolean   @default(false)
  priority    Priority  @default(MEDIUM)
  dueDate     DateTime?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String
  user        User      @relation(fields: [userId], references: [id], onDelete: Cascade)
}

enum Priority {
  LOW
  MEDIUM
  HIGH
}
```

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
DATABASE_URL="postgresql://user:password@localhost:5432/todo_db?schema=public"
JWT_SECRET="your_jwt_secret_key_change_me_in_production"
FRONTEND_URL="http://localhost:5173"
NODE_ENV="development"
```

### Frontend
The frontend automatically proxies API requests to `http://localhost:5000` during development.

## 📦 Build for Production

### Frontend
```bash
cd frontend
npm run build
npm run preview
```

### Backend
```bash
cd backend
npm run build
npm start
```

## 🧪 Features in Detail

### Task Filtering
- **Status Filter**: View all, active, or completed tasks
- **Priority Filter**: Filter by LOW, MEDIUM, or HIGH priority
- **Search**: Search by task title or description

### Sorting Options
- **Created Date**: Newest tasks first (default)
- **Due Date**: Tasks sorted by deadline
- **Priority**: High priority tasks first

### Statistics Dashboard
- Total tasks count
- Active tasks count
- Completed tasks count

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt with salt rounds
- **Rate Limiting**: 200 requests per 15 minutes per IP
- **CORS Protection**: Restricted cross-origin requests
- **Helmet**: Security headers protection
- **Cookie Security**: HTTP-only, secure cookies
- **Input Validation**: Zod schema validation on all endpoints

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop browsers (1920px and above)
- Tablets (768px to 1024px)
- Mobile devices (320px to 767px)

## 🎨 UI/UX Highlights

- **Dark Theme**: Eye-friendly dark slate color scheme
- **Gradient Accents**: Purple to indigo gradient elements
- **Smooth Animations**: Framer Motion transitions
- **Icon-rich Interface**: Lucide React icons for clarity
- **Loading States**: Spinner feedback during operations
- **Error Messages**: Clear, actionable error notifications
- **Form Validation**: Real-time field validation with Zod

## 🚀 Future Enhancements

- [ ] Task categories/projects
- [ ] Recurring tasks
- [ ] Task reminders and notifications
- [ ] Collaborative task sharing
- [ ] Mobile app (React Native)
- [ ] Dark/Light theme toggle
- [ ] Task templates
- [ ] Advanced analytics dashboard
- [ ] Calendar view
- [ ] Integration with Google Calendar

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👤 Author

**Harshika**
- GitHub: [@Harshika-001](https://github.com/Harshika-001)

## 🙏 Acknowledgments

- React documentation
- Prisma ORM guides
- TailwindCSS resources
- Express.js community
- All dependencies authors and contributors

## 📞 Support

For support, email harshika@example.com or open an issue in the repository.

---

**Made with ❤️ by Harshika**
