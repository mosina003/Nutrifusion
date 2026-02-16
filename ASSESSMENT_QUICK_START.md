# Assessment Module - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- MongoDB running locally or connection string ready
- Git installed

### Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd frontend
npm install
```

### Step 2: Set Up Environment Variables

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/nutrifusion
PORT=5000
JWT_SECRET=your_super_secret_key_change_in_production
NODE_ENV=development
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### Step 3: Start the Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 4: Access the Assessment Module

Open your browser and navigate to:
```
http://localhost:3000/assessment
```

## 📋 First Time Setup Checklist

- [ ] MongoDB is running
- [ ] Backend server started successfully (port 5000)
- [ ] Frontend server started successfully (port 3000)
- [ ] Can access login page
- [ ] Have created a test user account
- [ ] Logged in successfully
- [ ] Can see Assessment page

## 🎬 Demo Walkthrough

### 1. Create a Test User

**Option A - Via API:**
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#",
  "firstName": "Test",
  "lastName": "User"
}
```

**Option B - Via Frontend:**
- Go to http://localhost:3000/register
- Fill in the form
- Click Register

### 2. Login

```bash
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@#"
}
```

Save the returned JWT token.

### 3. Take Your First Assessment

Navigate to: http://localhost:3000/assessment

**Choose a Framework:**
1. Click on any of the 4 framework cards:
   - 🍃 Ayurveda
   - ❤️ Unani
   - 💡 TCM
   - 🧪 Modern

2. Answer all questions (18-20 depending on framework)

3. Submit and view your results!

## 🧪 Testing Each Framework

### Ayurveda (Quick Test)
Answer all 18 questions selecting "Vata" dominant options:
- Thin frame
- Variable appetite
- Quick thinking
- Light sleep

**Expected Result:** Primary Dosha = Vata

### Unani (Quick Test)
Answer questions indicating hot and dry tendency:
- Feel warm
- Prefer cool weather
- Dry skin
- Quick-tempered

**Expected Result:** Mizaj = Safravi (Hot & Dry)

### TCM (Quick Test)
Answer questions indicating Yin deficiency:
- Hot palms and feet
- Night sweats
- Dry mouth
- Insomnia

**Expected Result:** Dominant Pattern = Yin Deficiency

### Modern Clinical (Quick Test)
Enter realistic health data:
- Age: 30
- Height: 170cm
- Weight: 70kg
- Activity: Moderately Active

**Expected Result:** BMI calculation and macro targets

## 📊 Verifying Data in MongoDB

```bash
# Connect to MongoDB
mongosh

# Switch to nutrifusion database
use nutrifusion

# View all assessments
db.assessments.find().pretty()

# View assessments for a specific user
db.assessments.find({ userId: ObjectId("YOUR_USER_ID") }).pretty()

# Count assessments by framework
db.assessments.aggregate([
  { $group: { _id: "$framework", count: { $sum: 1 } } }
])

# View latest assessment
db.assessments.find().sort({ completedAt: -1 }).limit(1).pretty()
```

## 🔍 Debugging Common Issues

### Issue: Cannot connect to MongoDB
**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Or if using Docker
docker start mongodb
```

### Issue: Port 5000 already in use
**Solution:**
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or change the port in backend .env
PORT=5001
```

### Issue: JWT token expired
**Solution:**
- Login again to get a new token
- Update Authorization header in requests

### Issue: CORS error
**Solution:**
Check backend server.js has:
```javascript
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}))
```

### Issue: Questions not loading
**Solution:**
1. Check backend console for errors
2. Verify questionBanks.js is properly exported
3. Check network tab in browser dev tools
4. Verify authentication token is valid

### Issue: Assessment not saving
**Solution:**
1. Check MongoDB connection
2. Verify all required fields are present
3. Check backend console for validation errors
4. Ensure Assessment model is properly imported

## 📱 Testing on Mobile

### Local Network Testing

1. Find your machine's IP address:
```bash
# macOS/Linux
ifconfig | grep inet

# Windows
ipconfig
```

2. Update frontend .env.local:
```env
NEXT_PUBLIC_API_URL=http://YOUR_IP:5000/api
```

3. Update backend CORS to allow your IP

4. Access from mobile:
```
http://YOUR_IP:3000/assessment
```

## 🎯 Next Steps

After successful setup:

1. **Explore Results:**
   - Complete assessments in all 4 frameworks
   - Compare the different health profiles
   - Review dietary recommendations

2. **Test Integration:**
   - Check how assessments affect diet plan generation
   - View assessment history in dashboard
   - Share results with practitioner

3. **Customize:**
   - Modify question banks
   - Adjust scoring algorithms
   - Add new recommendations

4. **Production Ready:**
   - Set strong JWT_SECRET
   - Enable HTTPS
   - Configure production MongoDB
   - Set up monitoring
   - Enable rate limiting

## 📚 Additional Resources

- [Full API Documentation](./ASSESSMENT_API_TESTING.md)
- [Module Architecture](./ASSESSMENT_MODULE_README.md)
- [Backend API Docs](./backend/API_DOCUMENTATION.md)
- [Frontend Components](./frontend/components/assessment/)

## 💬 Need Help?

Check the logs:

**Backend logs:**
```bash
cd backend
npm run dev
# Watch console output
```

**Frontend logs:**
```bash
cd frontend
npm run dev
# Watch console output
# Also check browser console (F12)
```

**MongoDB logs:**
```bash
# View MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

## ✅ Success Indicators

You're all set when you can:
- [x] Navigate to assessment page
- [x] See all 4 frameworks displayed
- [x] Select a framework and see questions
- [x] Complete an assessment
- [x] View results with scores
- [x] See assessment in database
- [x] Access assessment history

**Congratulations! You're ready to use the Multi-Medical Assessment Module! 🎉**

---

**Pro Tip:** Create a test user for each framework to quickly switch between different assessment types during development.
