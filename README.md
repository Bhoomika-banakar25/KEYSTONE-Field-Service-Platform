# KEYSTONE — Field Service Management Platform

A full-stack field service management platform built with Spring Boot, MySQL, and vanilla JavaScript. It manages the complete lifecycle of maintenance work orders — from customer request to job closure — with role-based access for Managers, Dispatchers, Technicians, and Customers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Spring Boot 3.5, Java 17 |
| Security | Spring Security, JWT |
| Database | MySQL 8 |
| ORM | Spring Data JPA / Hibernate |
| Frontend | HTML, CSS, Vanilla JavaScript |
| Build | Maven |
| Mail | Spring Boot Mail (Gmail SMTP) |
| API Docs | SpringDoc OpenAPI (Swagger UI) |

---

## Features

- JWT-based stateless authentication with BCrypt password hashing
- Role-based access control (Manager, Dispatcher, Technician, Customer, HR, Admin)
- Work order lifecycle state machine: NEW → ASSIGNED → IN_PROGRESS → ON_HOLD → COMPLETED → CLOSED
- Dispatcher assigns work orders to technicians
- Technicians log parts used and time spent on jobs
- Parts inventory management with stock decrement on usage
- SLA tracking with automatic breach detection (scheduled every 15 minutes)
- Operations dashboard with live work order stats
- Forgot password / reset password via email
- Browser-based UI served directly from the Spring Boot app

---

## Prerequisites

- Java 17+
- MySQL 8
- Maven 3.8+

---

## Local Setup

**1. Clone the repository**
```
git clone <your-repo-url>
cd ManageByHR
```

**2. Create the database**
```sql
CREATE DATABASE hr_emp_management;
```

**3. Configure environment**

Create or update `src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/hr_emp_management
spring.datasource.username=root
spring.datasource.password=your_mysql_password

spring.jpa.hibernate.ddl-auto=update

server.port=9899

spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=your_gmail@gmail.com
spring.mail.password=your_gmail_app_password
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
```

**4. Run the application**
```
./mvnw spring-boot:run
```

**5. Open in browser**
```
http://localhost:9899/index.html
```

**6. Load sample data (optional)**

Run `seed_data.sql` in MySQL Workbench to insert sample customers, sites, work orders, and parts.

---

## API Documentation

Swagger UI is available at:
```
http://localhost:9899/swagger-ui.html
```

---

## Seed Login Credentials

| Role | Email | Password |
|---|---|---|
| Manager | manager@meridian.com | 123456 |

Register additional users via the UI or `/api/user_auth/register` endpoint with roles: `MANAGER`, `DISPATCHER`, `TECHNICIAN`, `CUSTOMER`.

---

## API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/user_auth/register` | POST | Register a new user |
| `/api/user_auth/login` | POST | Login and receive JWT token |
| `/api/user_auth/logout` | POST | Logout and invalidate token |
| `/api/user_auth/forgot_password` | POST | Send password reset email |
| `/api/user_auth/reset_password` | POST | Reset password with token |
| `/api/customers` | GET / POST | List or create customers |
| `/api/customers/{id}/sites` | GET / POST | Sites for a customer |
| `/api/work-orders` | GET / POST | List or create work orders |
| `/api/work-orders/{id}` | GET / PUT | Get or update a work order |
| `/api/work-orders/{id}/assign` | POST | Assign to a technician |
| `/api/work-orders/{id}/status` | POST | Transition work order status |
| `/api/work-orders/{id}/parts` | POST | Log parts used |
| `/api/work-orders/{id}/time` | POST | Log time spent |
| `/api/parts` | GET / POST | Manage parts inventory |
| `/api/reports/summary` | GET | Dashboard metrics |
| `/api/users/technicians` | GET | List technicians for assignment |

---

## Work Order Lifecycle

```
NEW → ASSIGNED → IN_PROGRESS → COMPLETED → CLOSED
                      ↕
                   ON_HOLD
          NEW / ASSIGNED / ON_HOLD → CANCELLED
```

All transitions are enforced server-side. Illegal transitions return HTTP 500 with a clear error message.

---

## Project Structure

```
src/main/java/com/EMP_Management_COMP/ManageByHR/
├── Controller/       REST controllers
├── DTO/              Request and response data transfer objects
├── Entity/           JPA entities
├── ENUM/             Role, Permissions, WorkOrderStatus, Priority
├── Repository/       Spring Data JPA repositories
├── Security/         JWT filter, authentication, role-based permissions
└── Service/          Business logic and work order state machine

src/main/resources/
├── static/           Frontend (index.html, style.css, app.js)
└── application.properties
```

---

## Author

Bhoomika B V — Java Full-Stack Engineering Intern, Zidio Development
