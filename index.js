const express = require('express')
const app = express()

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


app.listen(process.env.PORT || 80, () => {
    console.log(`Server is listening`)
})
