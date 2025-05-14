import express from express;
import dotenv from 'dotenv'



dotenv.config();

const app=express();


app.use(cors());
app.use(bodyParser.json());


mongoose.connect(process.env.MONGO_URI,{
  useNewUrlParser:true,
  useUnifiedTopology:true
})
.then(()=>console.log('Connected to MongoDB'))
.catch((error)=>console.log("Error connecting to MongoDB",error));

app.use('/api/users',userRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});