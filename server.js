const app = require('./source/app');
const PORT = process.env.PORT || 4000

const server = app.listen(PORT,()=>{
    console.log(`WSV eCommerce start with port ${PORT}`)
})

