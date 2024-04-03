const app = require('./source/app');
const PORT = process.env.PORT || 4000

const server = app.listen(PORT,()=>{
    console.log(`Shopee Clone start with port ${PORT}`)
})

