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

const PORT = process.env.PORT || 5000

const app = express()
app.use(cors())
app.use(express.json())

// Создаем папку static если ее нет
const staticDir = path.resolve(__dirname, 'static');
if (!fs.existsSync(staticDir)) {
    fs.mkdirSync(staticDir, { recursive: true });
    console.log('Static directory created:', staticDir);
}

// Раздача статических файлов
app.use('/static', express.static(staticDir));
app.use(express.static(staticDir));

app.use(fileUpload({}))
app.use('/api', router)

// Обработка ошибок, последний Middleware
app.use(errorHandler)

// Тестовый маршрут для проверки статики
app.get('/test-static', (req, res) => {
    res.json({ 
        message: 'Static test',
        staticPath: staticDir,
        files: fs.readdirSync(staticDir)
    });
});

const start = async () => {
    try {
        await sequelize.authenticate()
        await sequelize.sync()
        app.listen(PORT, () => console.log(`Server started on port ${PORT}`))
        console.log('Static files served from:', staticDir);
    } catch (e) {
        console.log(e)
    }
}

start()