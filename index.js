const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000


// middlewires
app.use(cors())
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xq01pu7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();

    const usersCollection = client.db('HealthAndSanitation').collection('user')
    const volunteersCollection = db.collection("volunteersRegistration");


    app.get("/volunteers", async (req, res) => {
      try {
        const volunteers = await volunteersCollection.find().toArray();

        // // Get user info for each volunteer
        // const volunteersWithUserInfo = await Promise.all(
        //   volunteers.map(async (volunteer) => {
        //     const userInfo = await usersCollection.findOne(
        //       { email: volunteer.email },
        //       { projection: { password: 0 } }
        //     );
        //     return {
        //       ...volunteer,
        //       userInfo,
        //     };
        //   })
        // );

        res.status(200).send({
          success: true,
          data: volunteers,
        });
      } catch (error) {
        console.error("Error fetching volunteers:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });



    app.post("/volunteers", async (req, res) => {
      try {
        const volunteerSchema = z.object({
          name: z
            .string()
            .min(2, { message: "Name must be at least 2 characters" }),
          contactNumber: z
            .string()
            .min(10, { message: "Contact number must be at least 10 digits" })
            .max(15, { message: "Contact number cannot exceed 15 digits" })
            .regex(/^[0-9]+$/, {
              message: "Contact number must contain only numbers",
            }),
          emergencyContact: z
            .string()
            .min(10, {
              message: "Emergency contact must be at least 10 digits",
            })
            .max(15, { message: "Emergency contact cannot exceed 15 digits" })
            .regex(/^[0-9]+$/, {
              message: "Emergency contact must contain only numbers",
            }),
          education: z
            .string()
            .min(1, { message: "Educational information is required" }),
          occupation: z.string().min(1, { message: "Occupation is required" }),
          volunteerFor: z.enum(["Teacher", "Doctor", "General Volunteer"], {
            message: "Please select a valid volunteer role",
          }),
          specialization: z
            .string()
            .min(1, { message: "Specialization is required" }),
          permanentAddress: z
            .string()
            .min(1, { message: "Permanent address is required" }),
          presentAddress: z
            .string()
            .min(1, { message: "Present address is required" }),
          status: z
            .enum(["pending", "rejected", "Approved"])
            .default("pending"),
          email: z.string().email().optional(),
        });
        // Add userId if available (from authenticated user)
        const validatedData = await volunteerSchema.parseAsync(req.body);

        const result = await volunteersCollection.insertOne(validatedData);

        res.status(201).send({
          success: true,
          message: "Volunteer registered successfully",
          data: {
            insertedId: result.insertedId,
            status: "pending",
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).send({
            success: false,
            message: "Validation failed",
            errors: error.errors.map((err) => ({
              field: err.path[0], // Get the first path segment as field name
              message: err.message,
            })),
          });
        }

        console.error("Volunteer registration error:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
          error: error.message,
        });
      }
    });



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Health and Sanitation Platform is running')
})

app.listen(5000, () => {
  console.log(`Health and Sanitation Platform is running on ${port} port`)
})
