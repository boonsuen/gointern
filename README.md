# GoIntern
An application for students, supervisors, companies, and the university to manage the internship process. This project uses the decoupled architecture pattern with a React frontend and a Flask backend. The backend is deployed on AWS EC2, served by an API Gateway endpoint, and load balanced by an Application Load Balancer, with Auto Scaling enabled. The frontend is deployed on AWS Amplify for continuous deployment.

- URLs
  - Frontend React application deployed on AWS Amplify: https://main.d5x2ro1imlp31.amplifyapp.com/ 
  - Backend Flask API
    - URL of the API Gateway HTTPS endpoint:
      https://53lhr13ezc.execute-api.us-east-1.amazonaws.com/
    - URL of the load balancer:
      http://gointern-lb-1829405116.us-east-1.elb.amazonaws.com/
- Frontend: React & Next.js
- Backend: Flask with Prisma ORM