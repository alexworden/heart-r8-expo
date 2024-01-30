# Getting Started with Heart-R8 Backend Development

Welcome to the Heart-R8 project! This guide will help you set up your development environment on a Mac.

## Prerequisites

Ensure you have the following installed:
- **Node.js**: [Download and install Node.js](https://nodejs.org/), which includes npm (Node Package Manager).
- **PostgreSQL**: Install PostgreSQL, which our project uses for the database. You can download it from [PostgreSQL Official Site](https://www.postgresql.org/download/macosx/) or use Homebrew:
  ```bash
  brew install postgresql
- **Git: Install Git for version control.
- **A PostgreSQL Client: Tools like pgAdmin or DBeaver, or use psql (command-line tool).

## Clone the Repository

First, clone the repository to your local machine 

```
git clone <repository-url>
cd backend
```

## Development Setup

-- Install the ESLint Extension in VSCode (Cmd+Shift+X). Search for ESLint. 


## Install Dependencies

```
npm install
```

## Environment Setup
Create a .env file in the project root directory. This file should contain environment-specific variables:
```
# Example .env file
DB_HOST=localhost
DB_USER=yourUsername
DB_PASS=yourPassword
DB_NAME=heartR8DB
PORT=3000
```

## Database Setup
For local development, ensure your PostgreSQL server is running. Create a database for the project and execute the initial SQL scripts to set up the tables.

For hosted DBs, the database is created on AWS using Aurora. 

Log in as alexworden+aws@gmail.com and find the dev DB instance in N.California. 
DB cluster id = heart-r8-dev1
Master username = postgres

You will need to download the aws-global-bundle.pem from AWS to accept their self-signed SSL certificates. 
TODO: reference this from an environment variable path to somewhere on the local machine...

## Running the Application
Start the server using:
```
node server.js
```
If everything is set up correctly, you should see a message indicating that the server is running on the specified port.

## Testing the Application
You can test the application using:

- Postman: For testing API endpoints.
- Accessing http://localhost:3000 in your browser or using a tool like curl to make requests to the server.

