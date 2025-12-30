# 🚀 Quick Start Guide

## Prerequisites Checklist

Before starting, ensure you have:

- [x] Java 17 or higher installed
- [x] MySQL 8.0 or higher installed
- [x] Node.js 20 or higher installed
- [x] Maven (or use included wrapper)
- [x] Git installed

---

## 📦 Installation Steps

### 1. Database Setup (MySQL)

```bash
# Start MySQL service
# Windows
net start MySQL80

# Mac/Linux
sudo systemctl start mysql

# Login to MySQL
mysql -u root -p

# Create database and user
CREATE DATABASE attendance_db;
CREATE USER 'attendance_user'@'localhost' IDENTIFIED BY 'attendance_pass';
GRANT ALL PRIVILEGES ON attendance_db.* TO 'attendance_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u root -p attendance_db < database/schema.sql
```

### 2. Backend Setup (Spring Boot)

```bash
cd attendance-backend

# Copy and configure application.properties
# Edit src/main/resources/application.properties
# Update database password and JWT secret

# Build project
./mvnw clean install

# Run application
./mvnw spring-boot:run

# Verify backend is running
curl http://localhost:8080/api/auth/login
```

**Expected Output**: Backend should start on port 8080

### 3. Frontend Setup (React + Vite)

```bash
cd Frontend/attendx---advanced-student-attendance-system

# Install dependencies
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:8080/api" > .env

# Start development server
npm run dev
```

**Expected Output**: Frontend should start on port 3000

---

## 🧪 Testing the Setup

### Test 1: Backend Health Check

```bash
curl http://localhost:8080/api/auth/login
```

Expected: Should return error about missing credentials (confirms API is running)

### Test 2: Login Test

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

Expected: Should return JWT token and user info

### Test 3: Frontend Access

Open browser: http://localhost:3000

Expected: Should see login page with role selection

---

## 🔑 Default Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Staff | staff | staff123 |
| Student | student | student123 |

---

## 🐛 Common Issues & Solutions

### Issue: Backend fails to start

**Solution 1**: Database connection error
```bash
# Check MySQL is running
mysql -u root -p

# Verify database exists
SHOW DATABASES;

# Check application.properties credentials
```

**Solution 2**: Port 8080 already in use
```bash
# Find and kill process on port 8080
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:8080 | xargs kill -9
```

### Issue: Frontend cannot connect to backend

**Solution**: Check CORS configuration
```bash
# Verify WebConfig.java includes:
.allowedOrigins("http://localhost:3000")

# Check .env file exists with:
VITE_API_BASE_URL=http://localhost:8080/api
```

### Issue: NPM install fails

**Solution**:
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

## 🐳 Docker Quick Start (Alternative)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- MySQL: localhost:3306

---

## 📝 Verification Checklist

After setup, verify:

- [ ] MySQL database `attendance_db` exists
- [ ] Backend starts without errors on port 8080
- [ ] Frontend starts on port 3000
- [ ] Can access http://localhost:3000
- [ ] Can login with admin/admin123
- [ ] Dashboard loads after login
- [ ] Can navigate between pages
- [ ] Network tab shows API calls to localhost:8080

---

## 🎯 Next Steps

1. **Change Default Passwords**
   - Update user passwords in database
   - Change JWT secret in application.properties

2. **Configure Email (Optional)**
   - Add email settings for notifications

3. **Setup File Uploads**
   - Create uploads directory
   - Configure file size limits

4. **Enable HTTPS (Production)**
   - Generate SSL certificates
   - Update application.properties

---

## 📚 Additional Resources

- [Backend API Documentation](#) - See README.md
- [Frontend Component Guide](#) - See pages/README.md
- [Database Schema](#) - See database/schema.sql
- [Troubleshooting Guide](#) - See README.md

---

## 💡 Development Tips

### Hot Reload

- Backend: Changes require restart (use Spring DevTools)
- Frontend: Auto-reloads on file save

### Debugging

**Backend:**
```bash
# Run with debug enabled
./mvnw spring-boot:run -Dspring-boot.run.jvmArguments="-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=n,address=5005"
```

**Frontend:**
```bash
# Browser DevTools (F12)
# Check Console for errors
# Check Network tab for API calls
```

### Code Quality

```bash
# Backend: Run tests
cd attendance-backend
./mvnw test

# Frontend: Type checking
cd Frontend/attendx---advanced-student-attendance-system
npm run build
```

---

**🎉 You're all set! Happy coding!**
