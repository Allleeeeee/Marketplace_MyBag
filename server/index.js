require('dotenv').config()
const express = require('express')
const sequelize = require('./db')
const models = require('./models/models')
const cors = require('cors')
const fileUpload = require('express-fileupload')
const router = require('./routes/index')
const errorHandler = require('./midleware/ErrorHandlingMiddleware')
const path = require('path')
const fs = require('fs')
const createAdminUser = require('./createAdmin');
const PORT = process.env.PORT || 5000

const app = express()

// Обновленные настройки CORS
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json())

const staticDir = path.resolve(__dirname, 'static');
if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
    console.log('Static directory created:', staticDir);
}

app.use('/static', express.static(staticDir));
app.use(express.static(staticDir));

app.use(fileUpload({}))
app.use('/api', router)

app.use(errorHandler)

app.get('/test-static', (req, res) => {
    res.json({ 
        message: 'Static test',
        staticPath: staticDir,
        files: fs.readdirSync(staticDir)
    });
});

// Тестовый маршрут для проверки API
app.get('/api/test', (req, res) => {
    res.json({ message: 'API работает!' });
});

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        await createAdminUser()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
        console.log('Static files served from:', staticDir);
        console.log('CORS настроен для:', process.env.CLIENT_URL || 'http://localhost:3000');
    } catch (e) {
        console.log(e)
    }
}
start()