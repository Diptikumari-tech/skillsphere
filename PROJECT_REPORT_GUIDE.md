# SkillSphere: Academic Final Year Project Documentation Report

**Project Title**: SkillSphere - Peer-to-Peer Skill Exchange & Collaborative Learning Platform  
**Domain**: Full-Stack Web Development, Real-Time Distributed Systems, Recommendation Systems  
**Technology Stack**: MERN (MongoDB, Express.js, React.js, Node.js), Socket.io, JWT  

---

## Abstract

In modern higher education, traditional learning is often constrained by high tuition costs, fixed curriculum paces, and lack of cross-disciplinary skill exchange among peers. SkillSphere is a full-stack web application designed to enable barter-based skill exchange among students and learners. By utilizing a match-making algorithm that pairs users based on reciprocal skills offered and desired, SkillSphere facilitates peer-to-peer knowledge transfer without monetary transactions. Built using the MERN stack and Socket.io for real-time interaction, the platform offers user authentication, profile management, algorithmic match scoring, interactive messaging, video session scheduling, and peer reviews.

---

## 1. Introduction & Problem Statement

### 1.1 Problem Statement
Students and entry-level professionals often face difficulty mastering complementary skills (e.g., a frontend developer needing backend guidance, or a data analyst seeking UI design skills). Professional mentorship and coding bootcamps are prohibitively expensive, while self-learning via recorded videos lacks interactive feedback and accountability.

### 1.2 Proposed Solution
SkillSphere provides a decentralized skill barter community where:
- Every user acts as both a **Teacher** and a **Learner**.
- Smart matching algorithms pair users based on skill complementarity.
- Real-time communication tools allow seamless scheduling, chatting, and peer evaluation.

---

## 2. System Requirement Specifications (SRS)

### 2.1 Functional Requirements
1. **User Authentication & Profiles**:
   - Secure Registration, Login, and Logout via JWT.
   - Profile setup including education details, skills offered, skills desired, and personal bio.
2. **Recommendation Engine**:
   - Algorithmic calculation of candidate match percentage based on skill set intersection.
3. **Connection & Request Workflow**:
   - Ability to send skill swap proposals with custom messages.
   - Accept/Decline status management.
4. **Real-Time Communication**:
   - Bidirectional messaging using Socket.io WebSockets.
5. **Session Management**:
   - Video call scheduling with integrated room links and session status updates.
6. **Rating & Review System**:
   - Peer rating (1–5 stars) and review submission updating overall user trust metrics.

### 2.2 Non-Functional Requirements
- **Performance**: Sub-100ms API response latency for recommendation queries.
- **Scalability**: Stateless JWT authentication enabling horizontal scaling of Express backend nodes.
- **Usability**: Responsive, dark/light theme supported UI accessible across devices.
- **Security**: Password salting via Bcrypt; protection against CORS and XSS attacks.

---

## 3. Software Architecture & Design

### 3.1 MVC Layered Architecture
SkillSphere follows a clean Model-View-Controller (MVC) architectural pattern:
- **Presentation Layer (View)**: Built with React.js 19 and React Router DOM v7 for declarative UI state management.
- **Application Layer (Controller & Middleware)**: Node.js and Express server executing business logic, JWT validation, and Socket.io event dispatching.
- **Data Layer (Model)**: MongoDB database accessed via Mongoose Schema object data modeling.

---

## 4. Database Schema Design (MongoDB / Mongoose)

### 4.1 User Schema
```json
{
  "_id": "ObjectId",
  "name": "String",
  "email": "String (Unique)",
  "password": "String (Bcrypt Hashed)",
  "college": "String",
  "course": "String",
  "year": "String",
  "teachSkills": [{ "name": "String", "level": "String", "category": "String" }],
  "learnSkills": [{ "name": "String", "level": "String", "category": "String" }],
  "onboardingCompleted": "Boolean",
  "rating": { "average": "Number", "count": "Number" },
  "createdAt": "Date"
}
```

### 4.2 SwapRequest Schema
```json
{
  "_id": "ObjectId",
  "sender": "Ref -> User",
  "receiver": "Ref -> User",
  "offeredSkill": "String",
  "wantedSkill": "String",
  "status": "Enum ['pending', 'accepted', 'rejected']",
  "createdAt": "Date"
}
```

---

## 5. Testing & Verification

### 5.1 Unit & Integration Testing
- API Endpoint verification performed on Express server routes (`/api/auth`, `/api/users`, `/api/matches`, `/api/requests`).
- Token validation tested for unauthorized access scenarios (missing headers, expired tokens).

### 5.2 User Acceptance Testing (UAT)
- Simulated multi-user workflow: User A registers -> User B registers -> User A sends swap request -> User B accepts -> Chat room established -> Live messages exchanged -> Session completed.

---

## 6. Conclusion & Future Scope

### 6.1 Conclusion
SkillSphere successfully transforms peer-to-peer learning into a structured, accessible, and automated barter ecosystem. By transitioning from client-side Firestore to a custom MERN architecture with WebSockets, the platform achieves higher performance, full data ownership, and seamless real-time interaction.

### 6.2 Future Enhancements
- Integration of AI-driven NLP matching for semantic skill similarity.
- Embedded WebRTC video calls directly inside the web browser.
- Gamified achievement badges for top community mentors.
