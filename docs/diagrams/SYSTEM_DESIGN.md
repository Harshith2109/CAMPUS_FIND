# CampusFind: System Design Documentation

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Use Case Diagram](#use-case-diagram)
3. [Data Flow Diagrams](#data-flow-diagrams)
4. [Sequence Diagrams](#sequence-diagrams)
5. [Entity-Relationship Diagram](#entity-relationship-diagram)
6. [Component Diagram](#component-diagram)

---

## System Architecture

The CampusFind system follows a three-tier architecture pattern:

```mermaid
graph TB
    subgraph "Client Layer"
        A[React Frontend]
        A1[React Router]
        A2[React Query]
        A3[Tailwind CSS]
        A --> A1
        A --> A2
        A --> A3
    end
    
    subgraph "Application Layer"
        B[Express REST API]
        B1[Authentication Middleware]
        B2[Item Controller]
        B3[Claim Controller]
        B4[Notification Service]
        B5[Matching Algorithm]
        B --> B1
        B --> B2
        B --> B3
        B --> B4
        B --> B5
    end
    
    subgraph "Data Layer"
        C[(MongoDB)]
        C1[Users Collection]
        C2[Items Collection]
        C3[Claims Collection]
        C4[Notifications Collection]
        C --> C1
        C --> C2
        C --> C3
        C --> C4
    end
    
    subgraph "External Services"
        D[Email Service]
        E[File Storage]
    end
    
    A -->|HTTP/REST| B
    B -->|Mongoose ODM| C
    B -->|SMTP| D
    B -->|Multer| E
    
    style A fill:#3b82f6
    style B fill:#10b981
    style C fill:#f59e0b
    style D fill:#8b5cf6
    style E fill:#8b5cf6
```

### Architecture Components

**Client Layer (Frontend)**
- **React**: Component-based UI framework
- **React Router**: Client-side routing and navigation
- **React Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework
- **Axios**: HTTP client for API communication

**Application Layer (Backend)**
- **Express.js**: Web application framework
- **JWT Authentication**: Secure token-based authentication
- **Controllers**: Handle business logic for each resource
- **Services**: Reusable business logic (matching, notifications)
- **Middleware**: Authentication, validation, error handling
- **Multer**: File upload handling

**Data Layer**
- **MongoDB**: NoSQL document database
- **Mongoose**: ODM for schema validation and queries
- **Collections**: Users, Items, Claims, Notifications

**External Services**
- **Email Service**: Nodemailer with SMTP for notifications
- **File Storage**: Local file system for uploaded images

---

## Use Case Diagram

```mermaid
graph LR
    subgraph Actors
        U[Student/User]
        S[Staff]
        A[Admin]
    end
    
    subgraph "Authentication"
        UC1((Register))
        UC2((Login))
        UC3((Logout))
    end
    
    subgraph "Item Management"
        UC4((Report Lost Item))
        UC5((Report Found Item))
        UC6((Search Items))
        UC7((View Item Details))
        UC8((Edit My Item))
        UC9((Delete My Item))
    end
    
    subgraph "Matching & Claims"
        UC10((View Matches))
        UC11((Submit Claim))
        UC12((Track My Claims))
        UC13((Verify Claim))
    end
    
    subgraph "Notifications"
        UC14((View Notifications))
        UC15((Receive Email Alerts))
    end
    
    subgraph "Admin Functions"
        UC16((Manage Users))
        UC17((Moderate Items))
        UC18((View Analytics))
        UC19((System Settings))
    end
    
    U --> UC1
    U --> UC2
    U --> UC3
    U --> UC4
    U --> UC5
    U --> UC6
    U --> UC7
    U --> UC8
    U --> UC9
    U --> UC10
    U --> UC11
    U --> UC12
    U --> UC14
    U --> UC15
    
    S --> UC1
    S --> UC2
    S --> UC3
    S --> UC4
    S --> UC5
    S --> UC6
    S --> UC7
    S --> UC8
    S --> UC9
    S --> UC10
    S --> UC11
    S --> UC12
    S --> UC13
    S --> UC14
    S --> UC15
    
    A --> UC1
    A --> UC2
    A --> UC3
    A --> UC4
    A --> UC5
    A --> UC6
    A --> UC7
    A --> UC8
    A --> UC9
    A --> UC10
    A --> UC11
    A --> UC12
    A --> UC13
    A --> UC14
    A --> UC15
    A --> UC16
    A --> UC17
    A --> UC18
    A --> UC19
    
    style U fill:#3b82f6
    style S fill:#10b981
    style A fill:#f59e0b
```

### Use Case Descriptions

| Use Case | Actor | Description |
|----------|-------|-------------|
| Register | All | Create a new account with email and password |
| Login | All | Authenticate and receive JWT token |
| Report Lost Item | All | Submit details of a lost item with images |
| Report Found Item | All | Submit details of a found item with images |
| Search Items | All | Search and filter items by various criteria |
| View Matches | All | See automatically matched lost/found items |
| Submit Claim | All | Request to claim a found item |
| Verify Claim | Staff/Admin | Approve or reject claim requests |
| Manage Users | Admin | View, edit, and manage user accounts |
| Moderate Items | Admin | Review, archive, or delete reported items |
| View Analytics | Admin | Access dashboard with system statistics |

---

## Data Flow Diagrams

### DFD Level 0 (Context Diagram)

```mermaid
graph TB
    U[Student/User]
    S[Staff]
    A[Admin]
    E[Email Service]
    
    System[("CampusFind<br/>Lost & Found<br/>System")]
    
    U -->|Login Credentials| System
    U -->|Item Reports| System
    U -->|Search Queries| System
    U -->|Claim Requests| System
    
    System -->|Authentication Token| U
    System -->|Search Results| U
    System -->|Matched Items| U
    System -->|Notifications| U
    
    S -->|Claim Verification| System
    System -->|Pending Claims| S
    
    A -->|Admin Actions| System
    System -->|System Reports| A
    System -->|User Management| A
    
    System -->|Email Notifications| E
    
    style System fill:#10b981
    style U fill:#3b82f6
    style S fill:#3b82f6
    style A fill:#f59e0b
    style E fill:#8b5cf6
```

### DFD Level 1 (Detailed Processes)

```mermaid
graph TB
    U[User]
    S[Staff]
    A[Admin]
    E[Email Service]
    
    P1[("1.0<br/>User<br/>Authentication")]
    P2[("2.0<br/>Item<br/>Management")]
    P3[("3.0<br/>Search &<br/>Matching")]
    P4[("4.0<br/>Claim<br/>Processing")]
    P5[("5.0<br/>Notification<br/>System")]
    P6[("6.0<br/>Admin<br/>Operations")]
    
    D1[("Users<br/>DB")]
    D2[("Items<br/>DB")]
    D3[("Claims<br/>DB")]
    D4[("Notifications<br/>DB")]
    
    U -->|Credentials| P1
    P1 -->|User Data| D1
    P1 -->|Auth Token| U
    
    U -->|Item Details| P2
    P2 -->|Store Item| D2
    P2 -->|Item Info| U
    
    U -->|Search Query| P3
    P3 -->|Read Items| D2
    P3 -->|Results| U
    P2 -->|New Item| P3
    P3 -->|Match Found| P5
    
    U -->|Claim Request| P4
    P4 -->|Store Claim| D3
    P4 -->|Read Item| D2
    S -->|Verification| P4
    P4 -->|Claim Status| S
    P4 -->|Status Update| P5
    
    P5 -->|Store Notification| D4
    P5 -->|Email| E
    P5 -->|In-app Alert| U
    
    A -->|Admin Action| P6
    P6 -->|Read/Write| D1
    P6 -->|Read/Write| D2
    P6 -->|Read/Write| D3
    P6 -->|Analytics| A
    
    style P1 fill:#3b82f6
    style P2 fill:#3b82f6
    style P3 fill:#10b981
    style P4 fill:#f59e0b
    style P5 fill:#8b5cf6
    style P6 fill:#ef4444
    style D1 fill:#fbbf24
    style D2 fill:#fbbf24
    style D3 fill:#fbbf24
    style D4 fill:#fbbf24
```

---

## Sequence Diagrams

### User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant Auth
    participant DB
    participant Email
    
    User->>Frontend: Fill registration form
    Frontend->>Frontend: Validate input
    Frontend->>API: POST /api/auth/register
    API->>Auth: Hash password
    Auth->>DB: Create user document
    DB-->>Auth: User created
    Auth->>Email: Send welcome email
    Auth-->>API: User data + token
    API-->>Frontend: Success response
    Frontend-->>User: Redirect to dashboard
```

### Lost Item Claim Workflow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant MatchService
    participant DB
    participant NotifService
    participant Email
    actor Finder
    actor Staff
    
    User->>Frontend: Submit claim request
    Frontend->>API: POST /api/claims
    API->>DB: Fetch item details
    DB-->>API: Item data
    API->>DB: Create claim document
    DB-->>API: Claim created
    
    API->>NotifService: Trigger notification
    NotifService->>DB: Create notification for finder
    NotifService->>Email: Send email to finder
    NotifService->>DB: Create notification for staff
    NotifService-->>API: Notifications sent
    
    API-->>Frontend: Claim submitted
    Frontend-->>User: Show success message
    
    Note over Finder,Email: Finder receives notification
    
    Staff->>Frontend: View pending claims
    Frontend->>API: GET /api/claims?status=pending
    API->>DB: Fetch pending claims
    DB-->>API: Claims list
    API-->>Frontend: Claims data
    
    Staff->>Frontend: Verify claim (approve/reject)
    Frontend->>API: PATCH /api/claims/:id
    API->>DB: Update claim status
    API->>DB: Update item status
    DB-->>API: Updated
    
    API->>NotifService: Notify user & finder
    NotifService->>Email: Send emails
    NotifService->>DB: Create notifications
    
    API-->>Frontend: Claim verified
    Frontend-->>Staff: Show confirmation
```

### Auto-Matching Algorithm Flow

```mermaid
sequenceDiagram
    actor User
    participant Frontend
    participant API
    participant ItemController
    participant MatchService
    participant DB
    participant NotifService
    
    User->>Frontend: Report found item
    Frontend->>API: POST /api/items
    API->>ItemController: Create item
    ItemController->>DB: Save item
    DB-->>ItemController: Item saved
    
    ItemController->>MatchService: Find matches
    MatchService->>DB: Query opposite type items
    Note over MatchService,DB: Match by category, date,<br/>location, keywords
    DB-->>MatchService: Potential matches
    
    MatchService->>MatchService: Calculate match scores
    MatchService->>DB: Update matchedItems arrays
    DB-->>MatchService: Updated
    
    MatchService->>NotifService: Notify matched users
    NotifService->>DB: Create notifications
    NotifService-->>MatchService: Notifications created
    
    MatchService-->>ItemController: Matches found
    ItemController-->>API: Item created with matches
    API-->>Frontend: Success + match count
    Frontend-->>User: Show matches
```

---

## Entity-Relationship Diagram

```mermaid
erDiagram
    USER ||--o{ ITEM : reports
    USER ||--o{ CLAIM : submits
    USER ||--o{ NOTIFICATION : receives
    USER ||--o{ CLAIM : verifies
    ITEM ||--o{ CLAIM : "has claims"
    ITEM ||--o{ ITEM : "matched with"
    ITEM ||--o{ NOTIFICATION : "related to"
    CLAIM ||--o{ NOTIFICATION : "related to"
    CLAIM ||--o| USER : "verified by"
    
    USER {
        ObjectId _id PK
        string name
        string email UK
        string password
        enum role
        string phone
        string department
        boolean verified
        datetime createdAt
    }
    
    ITEM {
        ObjectId _id PK
        enum type
        string title
        string description
        string category
        string location
        date date
        array images
        string color
        string brand
        string identifyingFeatures
        enum status
        ObjectId reportedBy FK
        array matchedItems
        array claimRequests
        datetime createdAt
        datetime updatedAt
    }
    
    CLAIM {
        ObjectId _id PK
        ObjectId item FK
        ObjectId claimedBy FK
        enum status
        string proofDescription
        array proofImages
        ObjectId verifiedBy FK
        string verificationNotes
        datetime createdAt
        datetime updatedAt
    }
    
    NOTIFICATION {
        ObjectId _id PK
        ObjectId user FK
        enum type
        string title
        string message
        ObjectId relatedItem FK
        ObjectId relatedClaim FK
        boolean read
        datetime createdAt
    }
```

### Database Schema Details

#### Users Collection
- **Primary Key**: `_id` (ObjectId)
- **Unique Index**: `email`
- **Indexes**: `role`, `createdAt`
- **Relationships**: One-to-many with Items, Claims, Notifications

#### Items Collection
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: `type`, `category`, `status`, `reportedBy`, `createdAt`
- **Relationships**: 
  - Many-to-one with User (reportedBy)
  - Many-to-many with Item (matchedItems - self-referencing)
  - One-to-many with Claim

#### Claims Collection
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: `item`, `claimedBy`, `status`, `verifiedBy`, `createdAt`
- **Relationships**:
  - Many-to-one with Item
  - Many-to-one with User (claimedBy)
  - Many-to-one with User (verifiedBy)

#### Notifications Collection
- **Primary Key**: `_id` (ObjectId)
- **Indexes**: `user`, `read`, `createdAt`
- **Relationships**:
  - Many-to-one with User
  - Many-to-one with Item (optional)
  - Many-to-one with Claim (optional)

---

## Component Diagram

```mermaid
graph TB
    subgraph "Frontend Components"
        direction TB
        FC1[App Component]
        FC2[Auth Pages]
        FC3[Dashboard]
        FC4[Item Pages]
        FC5[Claim Pages]
        FC6[Admin Pages]
        FC7[Shared Components]
        FC8[Services Layer]
        FC9[Context/Hooks]
        
        FC1 --> FC2
        FC1 --> FC3
        FC1 --> FC4
        FC1 --> FC5
        FC1 --> FC6
        FC1 --> FC7
        FC2 --> FC8
        FC3 --> FC8
        FC4 --> FC8
        FC5 --> FC8
        FC6 --> FC8
        FC8 --> FC9
    end
    
    subgraph "Backend Components"
        direction TB
        BC1[Express Server]
        BC2[Routes]
        BC3[Middleware]
        BC4[Controllers]
        BC5[Services]
        BC6[Models]
        BC7[Utils]
        
        BC1 --> BC2
        BC2 --> BC3
        BC3 --> BC4
        BC4 --> BC5
        BC4 --> BC6
        BC5 --> BC6
        BC4 --> BC7
    end
    
    subgraph "Database"
        DB[(MongoDB)]
    end
    
    subgraph "External"
        EXT1[Email Service]
        EXT2[File Storage]
    end
    
    FC8 -->|REST API| BC1
    BC6 -->|Mongoose| DB
    BC5 -->|SMTP| EXT1
    BC3 -->|Multer| EXT2
    
    style FC1 fill:#3b82f6
    style BC1 fill:#10b981
    style DB fill:#f59e0b
    style EXT1 fill:#8b5cf6
    style EXT2 fill:#8b5cf6
```

### Component Responsibilities

**Frontend Components**
- **App Component**: Root component, routing setup
- **Auth Pages**: Login, register, password reset
- **Dashboard**: Role-based dashboard views
- **Item Pages**: Report, list, detail, edit items
- **Claim Pages**: Submit, track, verify claims
- **Admin Pages**: User management, moderation, analytics
- **Shared Components**: Navbar, notifications, cards, modals
- **Services Layer**: API communication, data fetching
- **Context/Hooks**: Authentication state, custom hooks

**Backend Components**
- **Express Server**: Application entry point, middleware setup
- **Routes**: API endpoint definitions
- **Middleware**: Authentication, validation, error handling
- **Controllers**: Request handling, response formatting
- **Services**: Business logic (matching, notifications)
- **Models**: Mongoose schemas and methods
- **Utils**: Helper functions, constants

---

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 | UI framework |
| | Vite | Build tool and dev server |
| | React Router v6 | Client-side routing |
| | React Query | Server state management |
| | Tailwind CSS | Styling framework |
| | Axios | HTTP client |
| **Backend** | Node.js | Runtime environment |
| | Express.js | Web framework |
| | Mongoose | MongoDB ODM |
| | JWT | Authentication |
| | Bcrypt | Password hashing |
| | Multer | File uploads |
| | Nodemailer | Email service |
| **Database** | MongoDB | NoSQL database |
| **DevOps** | Nodemon | Auto-restart server |
| | ESLint | Code linting |
| | Prettier | Code formatting |

---

## Security Considerations

1. **Authentication**
   - JWT tokens with expiration
   - Password hashing with bcrypt (10 rounds)
   - HTTP-only cookies (optional)

2. **Authorization**
   - Role-based access control (RBAC)
   - Middleware to protect routes
   - Resource ownership validation

3. **Input Validation**
   - Request body validation
   - File type and size restrictions
   - SQL injection prevention (MongoDB)
   - XSS prevention

4. **Data Privacy**
   - Sensitive data encryption
   - Secure password storage
   - Email masking in public views
   - CORS configuration

5. **API Security**
   - Rate limiting (optional)
   - HTTPS in production
   - Environment variable protection
   - Error message sanitization

---

## Scalability Considerations

1. **Database**
   - Proper indexing for frequent queries
   - Pagination for large datasets
   - Aggregation pipelines for analytics

2. **Caching**
   - Redis for session storage (future)
   - Client-side caching with React Query
   - Static asset caching

3. **File Storage**
   - Image compression before upload
   - CDN integration (future)
   - Lazy loading for images

4. **Performance**
   - Code splitting in React
   - Lazy loading of routes
   - Optimized database queries
   - Response compression

---

This system design provides a comprehensive blueprint for the CampusFind Lost & Found Management System, ensuring scalability, security, and maintainability while meeting all functional and non-functional requirements.
