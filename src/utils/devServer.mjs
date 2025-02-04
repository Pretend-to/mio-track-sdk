import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// 获取当前模块的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 允许跨域
app.use(cors());

app.use(express.json());

// 提供静态文件
app.use(express.static(path.join(__dirname, '../../dist')));

// 路由配置
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../dist', 'debug.html'));
});

// demo
app.post('/v1/sdk/register', (req, res) => {
    const data = {code:0,data:{token:'66666'}}
    res.json(data);
});

app.get('/v1/sdk/data/list', (req, res) => {
    const data = {code:0,data:{
        click:['login','reset','changePage'],
        view:['home'],
    }}
    res.json(data);
})

app.post('/v1/sdk/:type/report', (req, res) => {
    console.log(JSON.stringify(req.body,null,2))
    const data = {code:0,data:{}}
    res.json(data);
})

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});