const express = require('express')
const app = express()
const PORT = 3000
const cors = require('cors')
const bodyParser = require('body-parser')

app.use(cors());
app.use(express.json())
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('Hello world')
})


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`)
})
