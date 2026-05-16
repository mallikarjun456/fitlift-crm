# AI Lead Conversion System

Full-stack Lead CRM with AI analysis powered by Groq + React frontend.

## Tech Stack
- **Backend**: Spring Boot 3.2 (Java 17), REST API
- **Database**: MySQL 8+
- **AI**: Groq API (llama3-70b-8192) — also works with Anthropic Claude
- **Frontend**: React 18 + Tailwind CSS (see `/frontend`)

---

## Backend Setup

### 1. Prerequisites
- Java 17+
- MySQL 8+
- Maven 3.8+
- Groq API key (free at https://console.groq.com)

### 2. MySQL Setup
```sql
CREATE DATABASE lead_ai_db;
-- Then run: src/main/resources/schema.sql
```

### 3. Configure application.properties
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lead_ai_db
spring.datasource.username=root
spring.datasource.password=YOUR_MYSQL_PASSWORD

groq.api.key=YOUR_GROQ_API_KEY
```

### 4. Run Backend
```bash
cd backend
mvn spring-boot:run
# API available at http://localhost:8080
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/leads | Create new lead (auto-scores) |
| GET | /api/leads | Get all leads (sorted by score) |
| GET | /api/leads/{id} | Get single lead |
| PATCH | /api/leads/{id}/status | Update pipeline status |
| POST | /api/leads/{id}/analyze | Run AI analysis |
| POST | /api/leads/{id}/reply | Generate AI reply email |
| POST | /api/leads/{id}/rescore | Re-score lead with AI |
| DELETE | /api/leads/{id} | Delete lead |
| GET | /api/leads/stats | Dashboard statistics |

### Example: Create Lead
```bash
curl -X POST http://localhost:8080/api/leads \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arjun Mehta",
    "email": "arjun@techcorp.in",
    "company": "TechCorp India",
    "jobTitle": "CTO",
    "message": "Need enterprise CRM for 500 users",
    "source": "LinkedIn"
  }'
```

### Example: Trigger AI Analysis
```bash
curl -X POST http://localhost:8080/api/leads/1/analyze
```

---

## Pipeline Status Flow
```
NEW → CONTACTED → QUALIFIED → PROPOSAL → NEGOTIATION → WON / LOST
```

## AI Features
1. **Auto-scoring** — When a lead is created, Groq scores it 0-100
2. **Lead Analysis** — Deep analysis: quality, decision power, pain points, next action
3. **AI Reply** — Personalized email reply generator
4. **Re-score** — Re-evaluate lead score anytime

---

## Frontend Setup (React)
```bash
cd frontend
npm install
npm start
# Frontend at http://localhost:3000
# Update API_BASE in App.jsx to http://localhost:8080/api/leads
```

---

## Environment Variables (Production)
```env
GROQ_API_KEY=gsk_...
DB_HOST=your-mysql-host
DB_NAME=lead_ai_db
DB_USER=root
DB_PASS=your_password
```
