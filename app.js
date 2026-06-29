require('dotenv').config();
const connectDB=require('./db/connect')
const express=require('express')
const app= express()
const authRouter=require('./routes/authRouter')
app.use(express.json())
app.get('/api/auth/',(req,res)=>{
  res.send('hi new year')
})

const port=process.env.PORT || 3000


app.use('/api/auth', authRouter)
const start= async()=>{
  try{
await connectDB(process.env.MONGO_URI).then(console.log("server is connected"))

app.listen(port, ()=>{ console.log(`Server is listening port ${port}...`)})

  }
catch(error){
 console.log({msg:error})
}
}
start()