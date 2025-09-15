# Personal Expense Tracker with AI Assistant

A web-based personal expense tracker with an integrated AI assistant. Track your income and expenses, and chat with an AI for suggestions or guidance.

## Features

- Add, edit, and delete income and expense records.
- Filter and categorize transactions.
- Interactive AI assistant powered by OpenRouter (DeepSeek-V3.1 model).
- Responsive chat interface inspired by ChatGPT.
- Real-time scrolling chat with message alignment for user and AI.

## Tech Stack

- **Frontend:** React, Vite, CSS  
- **Backend:** Node.js, Express, MySQL  
- **AI Integration:** OpenRouter API (DeepSeek-V3.1 model)  

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/personal-expense.git
cd personal-expense
```
2. Install setup:

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```
3. Create a .env file in the backend folder with:
```ini
PORT=5000
DB_HOST=your_db_host
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=your_db_name
OPENROUTER_API_KEY=your_openrouter_api_key
```
4. Start the project:
```bash
# Backend
cd backend
node server.js

# Frontend
cd ../frontend
npm run dev
```
5. Open your browser and go to the frontend URL (usually http://localhost:5173).

## Usage
- User authenticated so no one has access to your data other than you
- Embedded with a AI chat bot for quick suggestion
- Manage and track your income and expenses using charts and dashboard
## Project Structure
```pgsql
personal-expense/
├─ backend/
│  ├─ routes/
│  │  ├─ ai.js
│  │  ├─ auth.js
│  │  ├─ trackerRoutes.js
│  ├─ server.js
│  ├─ package.json
│  ├─ .env
├─ frontend/
│  ├─ src/
│  │  ├─ App.jsx
│  │  ├─ AIChat.jsx
│  │  ├─ index.css
│  ├─ package.json
│  ├─ vite.config.js
├─ .gitignore
```
## Notes
- Make sure your OpenRouter API key is active and set correctly in .env
- Make sure your database's name, your sql's username & password and the port is also in .env
-  Don't push the .env file, make sure to include it in the .gitignore
## .gitignore
```bash
node_modules/
.env
dist/
*.log
.DS_Store
```
Include package.json, package-lock.json, and vite.config.js in the repo.
## All dependencies required for the project
### Backend
- express (node.js framework)
  ```bash
  npm install express
  ```
- cors (Handle cross-origin requests)
  ```bash
  npm install cors
  ```
- cookie-parser (Parse cookies)
  ```bash
  npm install cookie-parser
  ```
- dotenv (Environment variables)
  ```bash
  npm install dotenv
  ```
- mysql2 (MySQL database connector)
  ```bash
  npm install mysql2
  ```
- node-fetch (Used for calling AI API)
  ```bash
  npm install node-fetch@2
  ```
- OpenAI (if you wanna use a OpenAI model)
  ```bash
  npm install openai
  ```
- bcryptjs (hash password)
  ```bash
  npm install bcryptjs
  ```
- jsonwebtoken (login session)
  ```bash
  npm install jsonwebtoken
  ```
### Frontend
- React + React DOM (Core)
  ```bash
  npm install react react-dom
  ```
