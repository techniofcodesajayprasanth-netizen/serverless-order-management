# Serverless Order Management App on AWS

A fully serverless, event-driven order management system 
built on AWS Free Tier.

## Architecture
- API Gateway — REST API endpoint
- AWS Lambda — Serverless business logic (Node.js 18)
- DynamoDB — NoSQL database for orders
- SQS — Message queue for decoupling
- SNS — Pub/Sub notifications
- S3 — Invoice storage
- CloudWatch — Monitoring and logging
- IAM — Security and permissions

## How to Deploy
1. Install AWS SAM CLI
2. Run: sam build
3. Run: sam deploy --guided
4. Copy API URL from Outputs

## Tech Stack
AWS Lambda, DynamoDB, SQS, SNS, API Gateway, SAM CLI