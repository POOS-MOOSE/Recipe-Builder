# MERN Stack Template

<img src='https://raw.githubusercontent.com/BenElferink/mern-template/refs/heads/images/images/mern.jpeg' />

- **M** = [MongoDB](https://www.mongodb.com)
- **E** = [Express.js](https://expressjs.com)
- **R** = [React.js](https://reactjs.org)
- **N** = [Node.js](https://nodejs.org)

<br />

# What is this template?

This template allows you to quick-start your Fullstack application using the MERN stack, it has a server setup with some basic authentication, and a client ready to communicate with the backend.

<img src='https://raw.githubusercontent.com/BenElferink/mern-template/refs/heads/images/images/preview.png' />

<br />

# How to use this template

### 1. Generate repository from template:

Click ["Use this template"](https://github.com/benelferink/mern-template/generate) to generate a
new repo, then open your terminal and clone your new repo.

```
git clone https://github.com/[your_user_name]/[your_repo_name].git
```

### 2. Install dependencies:

Go to the `server` folder, and run `install`.

```
cd ./server
npm i
```

Go to the `client` folder, and run `install`.

```
cd ./client
npm i
```

### 3. Prepare MongoDB:

Prepare your MongoDB database (using [Atlas](https://www.mongodb.com/cloud/atlas),
or [Community](<https://github.com/benelferink/mern-template/wiki/Install-MongoDB-Community-Server-(MacOS)>)). Then configure your database within `server/src/constants/index.js` (or `server/src/.env`), by configuring the `MONGO_URI` variable.

### 4. Start applications:

Go to the `server` folder, and run `dev`.

```
cd ./server
npm run dev
```

Go to the `client` folder, and run `dev`.

```
cd ./client
npm run dev
```

### 5. Happy Coding !!!
