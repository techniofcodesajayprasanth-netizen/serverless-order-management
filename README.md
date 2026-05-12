# 🚀 Serverless Order Management App on AWS

![AWS](https://img.shields.io/badge/AWS-Free%20Tier-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Lambda](https://img.shields.io/badge/AWS%20Lambda-Serverless-FF9900?style=for-the-badge&logo=aws-lambda&logoColor=white)
![DynamoDB](https://img.shields.io/badge/DynamoDB-NoSQL-4053D6?style=for-the-badge&logo=amazon-dynamodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Status](https://img.shields.io/badge/Status-Live%20on%20AWS-brightgreen?style=for-the-badge)

> A fully serverless, event-driven order management system built on AWS Free Tier.  
> No servers to manage. No idle cost. Auto-scales from 1 to 10,000 orders automatically.

---

## 📌 Table of Contents

- [What Is This Project?](#-what-is-this-project)
- [Real-World Purpose](#-real-world-purpose)
- [Live Output — What You See](#-live-output--what-you-see)
- [Architecture](#-architecture)
- [AWS Services Used and Why](#-aws-services-used-and-why)
- [Project Structure](#-project-structure)
- [How to Run This Project](#-how-to-run-this-project)
- [API Endpoints](#-api-endpoints)
- [What Happens Step by Step](#-what-happens-step-by-step)
- [Key Learnings](#-key-learnings)
- [Author](#-author)

---

## 💡 What Is This Project?

This project is a **Serverless Order Management System** — the same architecture used by companies like **Amazon, Swiggy, Zomato, and Flipkart** to process customer orders.

When a customer places an order:
1. The order is **saved instantly** to a cloud database
2. It is **automatically queued** for processing
3. Status updates from **PENDING → CONFIRMED** in real time
4. A **notification is sent** to the customer

All of this happens **without a single server you manage** — AWS handles everything automatically.

---

## 🏢 Real-World Purpose

This architecture pattern is used in **real production systems** across many industries:

| Industry | Real-World Use Case |
|----------|-------------------|
| 🛒 E-Commerce | Customer places order → Payment confirmed → Shipped (Amazon, Flipkart) |
| 🍕 Food Delivery | Restaurant receives order → Kitchen notified → Delivery assigned (Swiggy, Zomato) |
| 🏥 Healthcare | Patient books appointment → Doctor notified → Confirmation sent |
| 🏦 Banking | Loan application submitted → Processed → Approval notification |
| 📦 Logistics | Shipment booked → Processed → Tracking number sent (FedEx, DTDC) |
| 🏢 HR Systems | Leave request submitted → Manager notified → Approval workflow |

**Why companies choose this architecture:**
- ✅ No server maintenance cost
- ✅ Scales automatically during peak hours (festivals, sales events)
- ✅ If one service fails, others continue working
- ✅ Pay only when orders come in — not 24/7

---

## 📊 Live Output — What You See

### 1. Place an Order (POST Request)

**Input — you send this:**
```json
{
  "product": "Laptop",
  "quantity": 2
}
```

**Output — you get this back instantly:**
```json
{
  "orderId": "108adf44-89b8-43b6-b9f7-976ef07bd4a0",
  "message": "Order placed!"
}
```

---

### 2. DynamoDB — Order Saved in Database

After placing the order, open AWS Console → DynamoDB → Orders table.  
You will see your order stored like this:

```
orderId     : 108adf44-89b8-43b6-b9f7-976ef07bd4a0
userId      : test-user-001
product     : Laptop
quantity    : 2
status      : CONFIRMED   ← automatically updated from PENDING
createdAt   : 2026-05-06T14:52:35.106Z
```

> 💡 **Notice:** The status is `CONFIRMED` — not `PENDING`.  
> This is because the Worker Lambda automatically picked up the order from SQS and processed it within seconds.

---

### 3. CloudWatch Logs — Lambda Execution Proof

In AWS Console → CloudWatch → Log Groups, you can see:

```
START RequestId: 71053775-fae3-4218-91f9-05807d788bfb
Order saved to DynamoDB: 108adf44-89b8-43b6-b9f7-976ef07bd4a0
Message sent to SQS queue
END RequestId: 71053775-fae3-4218-91f9-05807d788bfb
REPORT Duration: 1139.11 ms   Billed Duration: 1140 ms   Memory: 128 MB
```

> 💡 **This proves:** Your Lambda ran, saved to database, and sent to queue — all in 1.1 seconds.

---

### 4. SQS Queue — Message Delivered

In AWS Console → SQS → OrderQueue:
- Message sent ✅
- Message received by Worker Lambda ✅
- Message deleted from queue after processing ✅

---

### 5. API Gateway — Live Endpoint

Your app is accessible via a real HTTPS URL:
```
https://sneiyilf6f.execute-api.us-east-1.amazonaws.com/Prod/orders
```
Anyone in the world can call this endpoint. No server running on your PC — it is live on AWS.

---

## 🏗️ Architecture

```
                         ┌─────────────────────────────────────────┐
                         │           AWS Cloud (us-east-1)          │
                         │                                          │
  Customer               │  ┌──────────────┐   ┌────────────────┐  │
  (Postman /    ─────────┼─►│  API Gateway │──►│ CreateOrder    │  │
   Browser)              │  │  REST API    │   │ Lambda         │  │
                         │  └──────────────┘   └───────┬────────┘  │
                         │                             │            │
                         │                    ┌────────▼────────┐  │
                         │                    │   DynamoDB      │  │
                         │                    │  Orders Table   │  │
                         │                    │  PENDING status │  │
                         │                    └─────────────────┘  │
                         │                             │            │
                         │                    ┌────────▼────────┐  │
                         │                    │   SQS Queue     │  │
                         │                    │   OrderQueue    │  │
                         │                    └────────┬────────┘  │
                         │                             │            │
                         │                    ┌────────▼────────┐  │
                         │                    │ ProcessOrder    │  │
                         │                    │ Lambda (Worker) │  │
                         │                    └───────┬─────────┘  │
                         │                            │             │
                         │             ┌──────────────┴──────────┐ │
                         │             │                         │ │
                         │    ┌────────▼──────┐      ┌──────────▼┐│
                         │    │   DynamoDB    │      │    SNS    ││
                         │    │   CONFIRMED   │      │  Notify   ││
                         │    └───────────────┘      └───────────┘│
                         │                                         │
                         │  ┌─────────────────────────────────┐   │
                         │  │  CloudWatch — Monitors All ↑    │   │
                         │  └─────────────────────────────────┘   │
                         │  ┌─────────────────────────────────┐   │
                         │  │  IAM — Secures All ↑            │   │
                         │  └─────────────────────────────────┘   │
                         └─────────────────────────────────────────┘
```

---

## ☁️ AWS Services Used and Why

| Service | Purpose | Why This Service |
|---------|---------|-----------------|
| **API Gateway** | Receives all HTTP requests | Handles SSL, routing, throttling automatically — no code needed |
| **AWS Lambda** | Runs business logic | Serverless compute — pay per invocation, auto-scales, no server management |
| **DynamoDB** | Stores all orders | Serverless NoSQL — simple access patterns, 25GB free, auto-scales |
| **SQS** | Order processing queue | Decouples creation from processing — no message lost if processor fails |
| **SNS** | Sends notifications | Pub/Sub fan-out — publish once, email + SMS + Lambda all receive it |
| **S3** | Stores invoices and files | 11-nine durability, serverless, 5GB free |
| **CloudWatch** | Monitoring and logs | All Lambda logs captured — set alarms for errors |
| **IAM** | Security and permissions | Principle of Least Privilege — each Lambda gets only what it needs |
| **AWS SAM** | Infrastructure as Code | Deploy everything with one command — version controlled |

---

## 📁 Project Structure

```
serverless-order-management/
│
├── template.yaml                  ← AWS SAM — defines ALL infrastructure
│
├── src/
│   ├── createOrder/
│   │   ├── index.js               ← POST /orders handler
│   │   ├── package.json
│   │   └── package-lock.json
│   │
│   ├── getOrder/
│   │   ├── index.js               ← GET /orders/{orderId} handler
│   │   ├── package.json
│   │   └── package-lock.json
│   │
│   └── processOrder/
│       ├── index.js               ← SQS Worker — processes queue messages
│       ├── package.json
│       └── package-lock.json
│
└── README.md
```

---

## 🛠️ How to Run This Project

### Prerequisites

Make sure you have these installed on your PC:

```bash
node --version     # v18.x or above
aws --version      # AWS CLI v2
sam --version      # SAM CLI 1.x
```

### Step 1 — Clone the Repository

```bash
git clone https://github.com/techniofcodesajayprasanth-netizen/serverless-order-management.git
cd serverless-order-management
```

### Step 2 — Install Dependencies

```bash
# Install for each Lambda function
cd src/createOrder && npm install
cd ../getOrder && npm install
cd ../processOrder && npm install
cd ../..
```

### Step 3 — Configure AWS

```bash
aws configure
# Enter your Access Key ID
# Enter your Secret Access Key
# Region: us-east-1
# Output: json
```

### Step 4 — Create DynamoDB Table

```bash
aws dynamodb create-table \
  --table-name Orders \
  --attribute-definitions \
    AttributeName=orderId,AttributeType=S \
    AttributeName=userId,AttributeType=S \
  --key-schema \
    AttributeName=orderId,KeyType=HASH \
    AttributeName=userId,KeyType=RANGE \
  --billing-mode PAY_PER_REQUEST
```

### Step 5 — Build and Deploy

```bash
sam build
sam deploy --guided
```

Answer the prompts:
```
Stack Name: order-management-app
Region: us-east-1
Confirm changes: y
Allow IAM role creation: y
Save to config file: y
```

### Step 6 — Copy Your API URL

After deploy finishes, copy the URL from Outputs:
```
Outputs
-------
Key   : ApiUrl
Value : https://xxxxxxxx.execute-api.us-east-1.amazonaws.com/Prod
```

### Step 7 — Test the API

**Windows PowerShell:**
```powershell
curl -Method POST `
  -Uri "https://YOUR-API-URL/Prod/orders" `
  -Headers @{"Content-Type"="application/json"} `
  -Body '{"product": "Laptop", "quantity": 2}'
```

**Mac / Linux:**
```bash
curl -X POST https://YOUR-API-URL/Prod/orders \
  -H "Content-Type: application/json" \
  -d '{"product": "Laptop", "quantity": 2}'
```

**Expected Response:**
```json
{
  "orderId": "108adf44-89b8-43b6-b9f7-976ef07bd4a0",
  "message": "Order placed!"
}
```

### Step 8 — Verify in AWS Console

1. **DynamoDB** → Tables → Orders → Explore items → Your order with status `CONFIRMED` ✅
2. **CloudWatch** → Log groups → Lambda function → See execution logs ✅
3. **SQS** → OrderQueue → Message was received and processed ✅

---

## 🔗 API Endpoints

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| `POST` | `/orders` | Create a new order | `{"product": "string", "quantity": number}` |
| `GET` | `/orders/{orderId}` | Get order by ID | None |

---

## 🔄 What Happens Step by Step

```
1. POST /orders  →  API Gateway receives request
                         ↓
2. CreateOrder Lambda runs (Node.js)
   - Generates unique orderId (UUID)
   - Saves to DynamoDB  →  status: PENDING
   - Sends message to SQS queue
   - Returns orderId to customer
                         ↓
3. SQS triggers ProcessOrder Lambda automatically
   - Updates DynamoDB  →  status: CONFIRMED
   - Publishes to SNS topic
                         ↓
4. SNS sends notification
   - Email confirmation
   - Any other subscribers
                         ↓
5. CloudWatch logs every step
   IAM secures every connection
```

---

## 💰 AWS Free Tier Cost

| Service | Free Tier Limit | This Project Uses |
|---------|----------------|-------------------|
| Lambda | 1 Million invocations/month | ~10 per test |
| DynamoDB | 25 GB storage | < 1 MB |
| SQS | 1 Million requests/month | ~10 per test |
| SNS | 1 Million publishes/month | ~10 per test |
| API Gateway | 1 Million calls/month | ~10 per test |
| S3 | 5 GB storage | < 1 MB |

**Total monthly cost = $0.00** ✅

---

## 🧠 Key Learnings

- **Serverless** does not mean no servers — it means YOU don't manage servers. AWS handles everything.
- **SQS decoupling** — if ProcessOrder Lambda fails, the order stays safe in the queue and retries automatically.
- **IAM Least Privilege** — each Lambda has only the permissions it needs. CreateOrder cannot touch SNS. ProcessOrder cannot touch SQS input.
- **Infrastructure as Code** — entire app defined in `template.yaml`. Deleted by mistake? Redeploy in 5 minutes.
- **Real debugging** — uuid ES Module conflict, DynamoDB table name mismatch, CloudWatch log analysis — these are real production problems.

---

## 🐛 Common Issues and Fixes

| Error | Cause | Fix |
|-------|-------|-----|
| `ERR_REQUIRE_ESM` | uuid latest version conflict | `npm install uuid@8.3.2` |
| `ResourceNotFoundException` | Wrong table name | Ensure DynamoDB table is named exactly `Orders` |
| `aws not recognized` | PATH not refreshed | Close and reopen VS Code after install |
| `No changes to deploy` | Code unchanged | This is normal — app is already up to date |
| `Missing Authentication Token` | Calling root URL `/` | Use `/Prod/orders` — root path does not exist |

---

## 👨‍💻 Author

**Ajay Prasanth M**  
AWS Certified Cloud Practitioner (CLF-C02) | Cloud Engineer | DevOps

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=for-the-badge&logo=linkedin)](https://linkedin.com/in/ajay-prasanth-07bb03396)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-181717?style=for-the-badge&logo=github)](https://github.com/techniofcodesajayprasanth-netizen)

---

> ⭐ If this project helped you learn AWS serverless architecture, give it a star!  
> It encourages more open source learning projects like this one.
