const express = require('express');
const app = express();
const propertiesReader = require("properties-reader");
const path = require("path");
const { MongoClient } = require("mongodb");
const cors = require('cors');
const ordersRouter = require('./routes/orders');
app.use(cors());
app.use(express.json());
app.use('/api', ordersRouter);

// 加载配置文件
let propertiesPath = path.resolve(__dirname, "conf/db.properties");
let properties = propertiesReader(propertiesPath);

// 构建数据库连接URI
let dbPrefix = properties.get("db.prefix");
let dbUsername = encodeURIComponent(properties.get("db.user")); // URL编码用户名
let dbPwd = encodeURIComponent(properties.get("db.pwd")); // URL编码密码
let dbName = properties.get("db.dbName");
let dbUrl = properties.get("db.dbUrl");
let dbParams = properties.get("db.params");

const uri = dbPrefix + dbUsername + ":" + dbPwd + dbUrl + dbName + dbParams;

// 连接到MongoDB
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const connectToDatabase = async () => {
    try {
        await client.connect();
        console.log("Connected to MongoDB Atlas successfully!");
    } catch (error) {
        console.error("Failed to connect to MongoDB Atlas:", error);
    }
};

connectToDatabase();

app.get('/lessons', async (req, res) => {
    try {
        const db = client.db(dbName);
        const lessons = await db.collection('lessons').find().toArray();
        res.json(lessons);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

app.get('/orders', async (req, res) => {
    try {
        const db = client.db(dbName);
        const orders = await db.collection('orders').find().toArray();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 提供静态文件
// 假设Express应用和Vue应用位于同一目录下，并且Vue应用的目录名为'client'
app.use(express.static(path.join(__dirname, 'client/dist')));

// 处理所有未匹配的请求，返回Vue应用的入口点(index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
