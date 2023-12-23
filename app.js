const express = require('express')
const app = express()
const apiRoutes = require('./routes/apiRoutes')

app.use(express.json())
app.use(express.static('public'));
app.use('/api', apiRoutes)

app.listen(3009, () => {
    console.log('listen multiverse in port 3009')
})