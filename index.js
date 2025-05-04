const express = require("express");
const app = express();
const cors = require("cors");
const { z } = require("zod"); // Import Zod
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const axios = require("axios");

const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.xq01pu7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();

    const db = client.db("HealthAndSanitation");
    const usersCollection = db.collection("user");
    const volunteersCollection = db.collection("volunteersRegistration");
    const appointmentsCollection = db.collection("doctorAppointments");
    const eventsCollection = db.collection("events");
    const calamitiesCollection = db.collection("calamities");
    const calamityVolunteersCollection = db.collection("calamityVolunteers");
    const emergencyhelpCollections = db.collection("emergencyHelp");
    const programsCollections = db.collection("programCollections");
    const programsCollectioinsRegistrations = db.collection(
      "programCollectionRegistration"
    );
    const paymentCollection = db.collection("payment");

    // users collections
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
    });

    app.get("/user-type", async (req, res) => {
      try {
        const { volunteer_type } = req.query;
        const query = {};

        if (volunteer_type) {
          query.volunteer_type = volunteer_type;
        }

        const users = await usersCollection.find(query).toArray();
        res.send(users);
      } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).send({ error: "Failed to fetch users" });
      }
    });

    // get single users

    // for finding doctor's info for showing Appointments history
    app.get("/users/:email", async (req, res) => {
      try {
        const { email } = req.params;
        console.log("email", email);

        const doctor = await usersCollection.findOne({
          email: email,
        });

        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found",
          });
        }

        res.json({
          success: true,
          data: doctor,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Server Error",
        });
      }
    });

    app.get("/specific-users", async (req, res) => {
      try {
        const { volunteer_type, exclude_program } = req.query;

        if (!volunteer_type) {
          return res
            .status(400)
            .json({ error: "volunteer_type query parameter is required" });
        }

        const types = volunteer_type.split(",");

        // First get all users of the requested types
        let users = await usersCollection
          .find({
            volunteer_type: { $in: types },
          })
          .toArray();

        // If we need to exclude users already in a program
        if (exclude_program) {
          const programAssignments = await calamityVolunteersCollection.findOne(
            {
              calamityId: new ObjectId(exclude_program),
            }
          );

          if (programAssignments) {
            const assignedVolunteerIds = programAssignments.volunteers.map(
              (v) => v.userId.toString()
            );
            const assignedDoctorIds = programAssignments.doctors.map((d) =>
              d.userId.toString()
            );
            const assignedIds = [...assignedVolunteerIds, ...assignedDoctorIds];

            users = users.filter(
              (user) => !assignedIds.includes(user._id.toString())
            );
          }
        }

        res.json(users);
      } catch (err) {
        console.error("Error fetching users:", err);
        res.status(500).json({ error: "Failed to fetch users" });
      }
    });

    app.get("/user", async (req, res) => {
      try {
        const { email } = req.query;
        console.log(email);

        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email parameter is required",
          });
        }

        // Find user by email, excluding sensitive fields
        const user = await usersCollection.findOne(
          { email },
          {
            projection: {
              password: 0, // Exclude password
              // Add any other sensitive fields you want to exclude
            },
          }
        );

        if (!user) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        res.status(200).json({
          success: true,
          data: user,
        });
      } catch (error) {
        console.error("Error fetching user by email:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Email/Password Signup
    app.post("/signup", async (req, res) => {
      try {
        const userSchema = z.object({
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.string().email("Invalid email format"),
          password: z.string().min(6, "Password must be at least 6 characters"),
          photoUrl: z.string().url("Invalid photo URL"),
        });

        const validatedData = userSchema.parse(req.body);

        // Check if user exists
        const existingUser = await usersCollection.findOne({
          email: validatedData.email,
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "User already exists",
          });
        }

        // Create new user with default volunteer_type
        const newUser = {
          ...validatedData,
          volunteer_type: "General",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({
          success: true,
          message: "User created successfully",
          data: {
            _id: result.insertedId,
            name: newUser.name,
            email: newUser.email,
            photoUrl: newUser.photoUrl,
            volunteer_type: newUser.volunteer_type,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.errors,
          });
        }

        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Google Signin/Signup Endpoint
    app.post("/google-signin", async (req, res) => {
      try {
        const googleUserSchema = z.object({
          name: z.string().min(2),
          email: z.string().email(),
          photoUrl: z.string().url(),
        });

        const validatedData = googleUserSchema.parse(req.body);

        // Check if user exists
        let user = await usersCollection.findOne({
          email: validatedData.email,
        });

        if (!user) {
          // Create new user with default volunteer_type
          const newUser = {
            ...validatedData,
            volunteer_type: "General",
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          const result = await usersCollection.insertOne(newUser);
          user = {
            _id: result.insertedId,
            ...newUser,
          };
        } else {
          // Update last login time
          await usersCollection.updateOne(
            { _id: user._id },
            { $set: { updatedAt: new Date() } }
          );
        }

        res.status(200).json({
          success: true,
          message: "Authentication successful",
          data: {
            _id: user._id,
            name: user.name,
            email: user.email,
            photoUrl: user.photoUrl,
            volunteer_type: user.volunteer_type,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.errors,
          });
        }

        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // update users info
    app.put("/user", async (req, res) => {
      try {
        const { email } = req.query;
        const updateData = req.body;

        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email parameter is required",
          });
        }

        // Validation schema for updates
        const updateSchema = z.object({
          name: z.string().min(2).optional(),
          photoUrl: z.string().url().optional(),
          volunteer_type: z
            .enum([
              "General",
              "Teacher",
              "General Volunteer",
              "Emergency Volunteer",
              "Doctor",
              "Admin",
            ])
            .optional(),
        });

        const validatedData = await updateSchema.parseAsync(updateData);

        // Check if user exists
        const existingUser = await usersCollection.findOne({ email });
        if (!existingUser) {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }

        // Prepare update with current timestamp
        const update = {
          $set: {
            ...validatedData,
            updatedAt: new Date(),
          },
        };

        const result = await usersCollection.updateOne({ email }, update);

        if (result.modifiedCount === 0) {
          return res.status(400).json({
            success: false,
            message: "No changes were made",
          });
        }

        res.status(200).json({
          success: true,
          message: "User updated successfully",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.errors,
          });
        }

        console.error("Error updating user:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Volunteer Registration Collections
    app.post("/volunteerss", async (req, res) => {
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
            details: error.errors.map((err) => ({
              path: err.path.join("."),
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

    app.get("/volunteers/doctors", async (req, res) => {
      try {
        // First get all approved doctors
        const doctors = await volunteersCollection
          .find({
            volunteerFor: "Doctor",
            status: "approved",
          })
          .toArray();

        // Get all booked appointments
        const appointments = await appointmentsCollection
          .find({
            status: { $in: ["booked", "pending"] }, // Include both booked and pending appointments
          })
          .toArray();

        // Process each doctor to remove booked slots
        const doctorsWithUpdatedAvailability = doctors.map((doctor) => {
          // Find all appointments for this doctor
          const doctorAppointments = appointments.filter(
            (app) => app.doctorId.toString() === doctor._id.toString()
          );

          // Update availability by removing booked slots
          const updatedAvailability = doctor.availability.map((avail) => {
            // Find all appointments for this date
            const dateAppointments = doctorAppointments.filter(
              (app) => app.date === avail.date
            );

            // Get all booked slots for this date
            const bookedSlots = dateAppointments.map((app) => app.time);

            // Remove booked slots from available slots
            const availableSlots = avail.slots.filter(
              (slot) => !bookedSlots.includes(slot)
            );

            return {
              ...avail,
              slots: availableSlots,
            };
          });

          return {
            ...doctor,
            availability: updatedAvailability,
          };
        });

        res.status(200).json({
          success: true,
          data: doctorsWithUpdatedAvailability,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
      }
    });

    // Add this endpoint to your server.js
    app.post("/get-participants-info", async (req, res) => {
      try {
        const { ids, type } = req.body;

        if (!ids || !Array.isArray(ids)) {
          return res.status(400).json({ error: "Invalid participant IDs" });
        }

        // Convert string IDs to ObjectId
        const objectIds = ids.map((id) => new ObjectId(id));

        // First get basic user info
        const users = await usersCollection
          .find({
            _id: { $in: objectIds },
          })
          .toArray();

        if (type === "doctor") {
          // For doctors, get additional info from volunteers collection
          const emails = users.map((user) => user.email);
          const volunteers = await volunteersCollection
            .find({
              email: { $in: emails },
              volunteerFor: "Doctor",
            })
            .toArray();

          // Combine the data
          const enrichedData = users.map((user) => {
            const volunteerInfo =
              volunteers.find((v) => v.email === user.email) || {};
            return {
              ...user,
              specialization:
                volunteerInfo.specialization || "General Physician",
              // Add other doctor-specific fields if needed
            };
          });

          return res.json(enrichedData);
        } else if (type === "teacher") {
          // For teachers, get additional info from volunteers collection
          const emails = users.map((user) => user.email);
          const volunteers = await volunteersCollection
            .find({
              email: { $in: emails },
              volunteerFor: "Teacher",
            })
            .toArray();

          // Combine the data
          const enrichedData = users.map((user) => {
            const volunteerInfo =
              volunteers.find((v) => v.email === user.email) || {};
            return {
              ...user,
              qualification: volunteerInfo.education || "Instructor",
              // Add other teacher-specific fields if needed
            };
          });

          return res.json(enrichedData);
        } else {
          return res.status(400).json({ error: "Invalid participant type" });
        }
      } catch (error) {
        console.error("Error fetching participants info:", error);
        res.status(500).json({ error: "Failed to fetch participants info" });
      }
    });

    // Get volunteers with user info (using aggregation)
    app.get("/volunteers/:email", async (req, res) => {
      try {
        const email = req.params.email;

        // Find the volunteer by email
        const volunteer = await volunteersCollection.findOne({ email });

        if (!volunteer) {
          return res.status(404).send({
            success: false,
            message: "Volunteer not found",
          });
        }

        // Get corresponding user info
        const userInfo = await usersCollection.findOne(
          { email },
          { projection: { password: 0 } } // Exclude password
        );

        res.send({
          success: true,
          data: {
            ...volunteer,
            userInfo,
          },
        });
      } catch (error) {
        console.error("Error fetching volunteer:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // GET all volunteers
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

    // PATCH update volunteer status
    app.patch("/volunteers/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["approved", "rejected", "pending"].includes(status)) {
          return res.status(400).send({
            success: false,
            message: "Invalid status value",
          });
        }

        const result = await volunteersCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { status } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Volunteer not found or status unchanged",
          });
        }

        res.status(200).send({
          success: true,
          message: "Volunteer status updated successfully",
        });
      } catch (error) {
        console.error("Error updating volunteer status:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });
    // Add this new endpoint after your existing volunteer routes
    app.put("/volunteers/:id", async (req, res) => {
      try {
        const updateSchema = z
          .object({
            status: z.enum(["Pending", "Reject", "Approved"]).optional(),
            volunteer_type: z
              .enum([
                "Teacher",
                "Permanent Volunteer",
                "Emergency Volunteer",
                "Doctor",
              ])
              .optional(),
          })
          .refine((data) => data.status || data.volunteer_type, {
            message:
              "At least one field (status or volunteer_type) must be provided",
          });

        const validatedData = updateSchema.parse(req.body);
        const volunteerId = req.params.id;

        // Check if volunteer exists
        const existingVolunteer = await volunteersCollection.findOne({
          _id: new ObjectId(volunteerId),
        });

        if (!existingVolunteer) {
          return res.status(404).send({
            success: false,
            message: "Volunteer not found",
          });
        }

        // Prepare update operations
        const updates = [];
        const volunteerUpdates = {};
        const userUpdates = {};

        if (validatedData.status) {
          volunteerUpdates.status = validatedData.status;
        }

        if (validatedData.volunteer_type) {
          userUpdates.volunteer_type = validatedData.volunteer_type;
          updates.push(
            usersCollection.updateOne(
              { _id: new ObjectId(existingVolunteer.userId) },
              { $set: userUpdates }
            )
          );
        }

        updates.push(
          volunteersCollection.updateOne(
            { _id: new ObjectId(volunteerId) },
            { $set: volunteerUpdates }
          )
        );

        // Execute all updates
        const results = await Promise.all(updates);

        if (results.every((result) => result.modifiedCount === 0)) {
          return res.status(400).send({
            success: false,
            message: "No changes were made",
          });
        }

        res.send({
          success: true,
          message: "Volunteer updated successfully",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).send({
            success: false,
            message: "Validation failed",
            errors: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          });
        }

        console.error("Error updating volunteer:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Add this with your other volunteer routes
    app.post("/volunteers/add-slots", async (req, res) => {
      try {
        const slotSchema = z.object({
          email: z.string().email(),
          date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          day: z.enum([
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
          ]),
          slots: z.array(z.string()).min(1),
          status: z.string().default("available"),
        });

        const validatedData = await slotSchema.parseAsync(req.body);
        const { email, date, day, slots, status } = validatedData;

        const doctor = await volunteersCollection.findOne({
          email,
          volunteerFor: "Doctor",
        });
        console.log(doctor);

        if (!doctor) {
          return res.status(404).json({
            success: false,
            message: "Doctor not found",
          });
        }

        const newAvailability = {
          date,
          day,
          slots: [...new Set(slots)],
          status,
          createdAt: new Date(),
        };

        const existingIndex =
          doctor.availability?.findIndex((a) => a.date === date) ?? -1;

        let result;
        if (existingIndex >= 0) {
          const existingSlots = doctor.availability[existingIndex].slots;
          const mergedSlots = [...new Set([...existingSlots, ...slots])];

          result = await volunteersCollection.updateOne(
            { _id: doctor._id, "availability.date": date },
            { $set: { "availability.$.slots": mergedSlots } }
          );
        } else {
          result = await volunteersCollection.updateOne(
            { _id: doctor._id },
            { $push: { availability: newAvailability } }
          );
        }

        if (result.modifiedCount === 0) {
          return res.status(400).json({
            success: false,
            message: "Failed to update slots",
          });
        }

        res.status(201).json({
          success: true,
          message: "Slots added successfully",
          data: newAvailability,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation error",
            errors: error.errors,
          });
        }

        console.error("Error adding slots:", error);
        res.status(500).json({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Doctors appointment collections

    app.post("/appointments", async (req, res) => {
      try {
        const { doctorId, date, time } = req.body;
        const doctorObjectId = new ObjectId(doctorId);

        // First check if the slot is still available
        const doctor = await volunteersCollection.findOne({
          _id: doctorObjectId,
        });
        const availability = doctor.availability.find(
          (avail) => avail.date === date
        );

        if (!availability || !availability.slots.includes(time)) {
          return res
            .status(400)
            .json({ message: "This time slot is no longer available" });
        }

        // Check if this slot is already booked
        const existingAppointment = await appointmentsCollection.findOne({
          doctorId: doctorObjectId,
          date,
          time,
          status: { $in: ["booked", "pending"] },
        });

        if (existingAppointment) {
          return res
            .status(400)
            .json({ message: "This time slot is already booked" });
        }

        // Create appointment
        const appointment = await appointmentsCollection.insertOne(req.body);

        res.status(201).json({
          success: true,
          data: {
            ...req.body,
            _id: appointment.insertedId,
          },
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server Error" });
      }
    });

    // Get all appointments
    app.get("/doctors-appointments", async (req, res) => {
      try {
        const { patientEmail } = req.query;

        if (!patientEmail) {
          return res.status(400).json({
            success: false,
            message: "Patient email is required",
          });
        }

        const appointments = await appointmentsCollection
          .find({
            patientEmail,
          })
          .sort({ date: -1, time: 1 })
          .toArray();

        res.json({
          success: true,
          data: appointments,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Server Error",
        });
      }
    });
    app.get("/appointments", async (req, res) => {
      try {
        const { doctoremail } = req.query;

        if (!doctoremail) {
          return res.status(400).json({
            success: false,
            message: "Patient email is required",
          });
        }

        const appointments = await appointmentsCollection
          .find({
            doctoremail,
          })
          .sort({ date: -1, time: 1 })
          .toArray();

        res.json({
          success: true,
          data: appointments,
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Server Error",
        });
      }
    });

    // Update appointment status
    app.put("/appointments/:id", async (req, res) => {
      try {
        const { id } = req.params;
        const { appointmentStatus } = req.body;

        if (!["pending", "approved", "rejected"].includes(appointmentStatus)) {
          return res.status(400).json({
            success: false,
            message: "Invalid status value",
          });
        }

        const result = await appointmentsCollection.updateOne(
          { _id: new ObjectId(id) },
          { $set: { appointmentStatus } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({
            success: false,
            message: "Appointment not found or no changes made",
          });
        }

        res.json({
          success: true,
          message: "Appointment status updated successfully",
        });
      } catch (err) {
        console.error(err);
        res.status(500).json({
          success: false,
          message: "Server Error",
        });
      }
    });

    // Get appointments by patient ID
    app.get("/appointments/patient/:patientId", async (req, res) => {
      try {
        const appointments = await appointmentsCollection
          .find({
            patientId: req.params.patientId,
          })
          .toArray();

        res.send({
          success: true,
          data: appointments,
        });
      } catch (error) {
        console.error("Error fetching patient appointments:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Events Collections

    // Create new event
    app.post("/events", async (req, res) => {
      try {
        const eventSchema = z.object({
          image: z.string().url({ message: "Invalid image URL" }),
          title: z
            .string()
            .min(5, { message: "Title must be at least 5 characters" }),
          description: z
            .string()
            .min(20, { message: "Description must be at least 20 characters" }),
          teachers: z
            .array(
              z.string().refine(
                async (id) => {
                  const user = await usersCollection.findOne({
                    _id: new ObjectId(id),
                    volunteer_type: "Teacher",
                  });
                  return !!user;
                },
                { message: "Teacher not found or not a valid teacher" }
              )
            )
            .min(1, { message: "At least one teacher must be specified" }),
          programDate: z.string(),
          locations: z.string(),
          status: z
            .enum(["Upcoming", "Ongoing", "Completed", "Cancelled"])
            .default("Upcoming"),
        });

        const validatedData = await eventSchema.parseAsync(req.body);

        const result = await eventsCollection.insertOne(validatedData);

        res.status(201).send({
          success: true,
          message: "Event created successfully",
          data: {
            eventId: result.insertedId,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).send({
            success: false,
            message: "Validation failed",
            errors: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          });
        }

        console.error("Error creating event:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Get all events
    app.get("/events", async (req, res) => {
      try {
        const events = await eventsCollection.find().toArray();

        res.send({
          success: true,
          data: events,
        });
      } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Update event
    app.put("/events/:id", async (req, res) => {
      try {
        const updateSchema = z.object({
          image: z.string().url().optional(),
          title: z.string().min(5).optional(),
          description: z.string().min(20).optional(),
          teachers: z
            .array(
              z.string().refine(
                async (id) => {
                  const user = await usersCollection.findOne({
                    _id: new ObjectId(id),
                    volunteer_type: "Teacher",
                  });
                  return !!user;
                },
                { message: "Teacher not found or not a valid teacher" }
              )
            )
            .min(1)
            .optional(),
          programDate: z.string().optional(),
          locations: z.string().optional(),
          status: z
            .enum(["Upcoming", "Ongoing", "Completed", "Cancelled"])
            .optional(),
        });

        const validatedData = await updateSchema.parseAsync(req.body);
        const eventId = req.params.id;

        // Check if event exists
        const existingEvent = await eventsCollection.findOne({
          _id: new ObjectId(eventId),
        });

        if (!existingEvent) {
          return res.status(404).send({
            success: false,
            message: "Event not found",
          });
        }

        const result = await eventsCollection.updateOne(
          { _id: new ObjectId(eventId) },
          { $set: validatedData }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).send({
            success: false,
            message: "No changes were made",
          });
        }

        res.send({
          success: true,
          message: "Event updated successfully",
          data: result,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).send({
            success: false,
            message: "Validation failed",
            errors: error.errors.map((err) => ({
              field: err.path.join("."),
              message: err.message,
            })),
          });
        }

        console.error("Error updating event:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // Delete event by ID
    app.delete("/events/:id", async (req, res) => {
      try {
        const eventId = req.params.id;

        // Check if event exists
        const existingEvent = await eventsCollection.findOne({
          _id: new ObjectId(eventId),
        });

        if (!existingEvent) {
          return res.status(404).send({
            success: false,
            message: "Event not found",
          });
        }

        const result = await eventsCollection.deleteOne({
          _id: new ObjectId(eventId),
        });

        if (result.deletedCount === 0) {
          return res.status(400).send({
            success: false,
            message: "Failed to delete event",
          });
        }

        res.send({
          success: true,
          message: "Event deleted successfully",
          data: {
            deletedCount: result.deletedCount,
          },
        });
      } catch (error) {
        console.error("Error deleting event:", error);
        res.status(500).send({
          success: false,
          message: "Internal server error",
        });
      }
    });

    // calamities programs
    // Calamity (Program) Routes
    app.post("/calamities", async (req, res) => {
      try {
        const { title, image, location, status } = req.body;

        const calamity = {
          title,
          image,
          location,
          status: status || "Ongoing",
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const result = await calamitiesCollection.insertOne(calamity);

        // Create empty assignment record
        await calamityVolunteersCollection.insertOne({
          calamityId: result.insertedId,
          volunteers: [],
          doctors: [],
          createdAt: new Date(),
        });

        res.status(201).json({
          _id: result.insertedId,
          ...calamity,
        });
      } catch (err) {
        console.error("Error creating calamity:", err);
        res.status(500).json({ error: "Failed to create program" });
      }
    });

    app.get("/calamities", async (req, res) => {
      try {
        const calamities = await calamitiesCollection
          .find()
          .sort({ createdAt: -1 })
          .toArray();

        // Get participant counts for each program
        const programsWithCounts = await Promise.all(
          calamities.map(async (program) => {
            const assignment = await calamityVolunteersCollection.findOne({
              calamityId: program._id,
            });

            return {
              ...program,
              volunteersCount: assignment?.volunteers?.length || 0,
              doctorsCount: assignment?.doctors?.length || 0,
            };
          })
        );

        res.json(programsWithCounts);
      } catch (err) {
        console.error("Error fetching calamities:", err);
        res.status(500).json({ error: "Failed to fetch programs" });
      }
    });

    app.get("/calamities/:id", async (req, res) => {
      try {
        const program = await calamitiesCollection.findOne({
          _id: new ObjectId(req.params.id),
        });

        if (!program) {
          return res.status(404).json({ error: "Program not found" });
        }

        // Get participant counts
        const assignment = await calamityVolunteersCollection.findOne({
          calamityId: program._id,
        });

        const programWithCounts = {
          ...program,
          volunteersCount: assignment?.volunteers?.length || 0,
          doctorsCount: assignment?.doctors?.length || 0,
        };

        res.json(programWithCounts);
      } catch (err) {
        console.error("Error fetching calamity:", err);
        res.status(500).json({ error: "Failed to fetch program" });
      }
    });

    app.get("/calamities/:calamityId/participants", async (req, res) => {
      try {
        const assignment = await calamityVolunteersCollection.findOne({
          calamityId: new ObjectId(req.params.calamityId),
        });

        if (!assignment) {
          return res.status(404).json({ error: "Assignment not found" });
        }

        // Clean up expired participants (status pending and expired)
        const now = new Date();
        const updatedParticipants = {
          volunteers: assignment.volunteers
            .map((v) => {
              if (v.status === "pending" && v.expiration < now) {
                return { ...v, status: "rejected" };
              }
              return v;
            })
            .filter((v) => v.status !== "rejected"),
          doctors: assignment.doctors
            .map((d) => {
              if (d.status === "pending" && d.expiration < now) {
                return { ...d, status: "rejected" };
              }
              return d;
            })
            .filter((d) => d.status !== "rejected"),
        };

        // Update the database if any changes were made
        if (
          JSON.stringify(assignment.volunteers) !==
            JSON.stringify(updatedParticipants.volunteers) ||
          JSON.stringify(assignment.doctors) !==
            JSON.stringify(updatedParticipants.doctors)
        ) {
          await calamityVolunteersCollection.updateOne(
            { _id: assignment._id },
            {
              $set: {
                volunteers: updatedParticipants.volunteers,
                doctors: updatedParticipants.doctors,
              },
            }
          );
        }

        res.json(updatedParticipants);
      } catch (err) {
        console.error("Error fetching participants:", err);
        res.status(500).json({ error: "Failed to fetch participants" });
      }
    });

    app.post("/calamities/:calamityId/volunteers", async (req, res) => {
      try {
        const { userId } = req.body;
        const calamityId = new ObjectId(req.params.calamityId);

        // Check if user exists and is a volunteer
        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
          volunteer_type: { $in: ["General Volunteer"] },
        });

        if (!user) {
          return res
            .status(404)
            .json({ error: "Volunteer not found or invalid type" });
        }

        // Add volunteer to calamity with pending status
        const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        const newVolunteer = {
          userId: new ObjectId(userId),
          name: user.name,
          email: user.email,
          specialty: user.specialty || "General Volunteer",
          status: "pending",
          expiration,
          addedAt: new Date(),
        };

        const result = await calamityVolunteersCollection.updateOne(
          { calamityId },
          { $push: { volunteers: newVolunteer } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Program not found" });
        }

        res.status(201).json(newVolunteer);
      } catch (err) {
        console.error("Error adding volunteer:", err);
        res.status(500).json({ error: "Failed to add volunteer" });
      }
    });

    app.post("/calamities/:calamityId/doctors", async (req, res) => {
      try {
        const { userId } = req.body;
        const calamityId = new ObjectId(req.params.calamityId);

        // Check if user exists and is a doctor
        const user = await usersCollection.findOne({
          _id: new ObjectId(userId),
          volunteer_type: "Doctor",
        });

        if (!user) {
          return res
            .status(404)
            .json({ error: "Doctor not found or invalid type" });
        }

        // Add doctor to calamity with pending status
        const expiration = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
        const newDoctor = {
          userId: new ObjectId(userId),
          name: user.name,
          email: user.email,
          specialty: user.specialty || "Doctor",
          status: "pending",
          expiration,
          addedAt: new Date(),
        };

        const result = await calamityVolunteersCollection.updateOne(
          { calamityId },
          { $push: { doctors: newDoctor } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Program not found" });
        }

        res.status(201).json(newDoctor);
      } catch (err) {
        console.error("Error adding doctor:", err);
        res.status(500).json({ error: "Failed to add doctor" });
      }
    });

    app.patch("/calamities/:id", async (req, res) => {
      try {
        const { status } = req.body;
        const programId = new ObjectId(req.params.id);

        if (!["Ongoing", "Closed"].includes(status)) {
          return res.status(400).json({ error: "Invalid status" });
        }

        const result = await calamitiesCollection.updateOne(
          { _id: programId },
          { $set: { status, updatedAt: new Date() } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Program not found" });
        }

        res.json({ message: "Program status updated successfully" });
      } catch (err) {
        console.error("Error updating program status:", err);
        res.status(500).json({ error: "Failed to update program status" });
      }
    });

    app.delete("/calamities/:calamityId/participants", async (req, res) => {
      try {
        const { userId, role } = req.body;
        const calamityId = new ObjectId(req.params.calamityId);

        if (!["volunteer", "doctor"].includes(role)) {
          return res.status(400).json({ error: "Invalid role" });
        }

        const field = role === "volunteer" ? "volunteers" : "doctors";

        const result = await calamityVolunteersCollection.updateOne(
          { calamityId },
          { $pull: { [field]: { userId: new ObjectId(userId) } } }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Participant not found" });
        }

        res.json({ message: "Participant removed successfully" });
      } catch (err) {
        console.error("Error removing participant:", err);
        res.status(500).json({ error: "Failed to remove participant" });
      }
    });

    app.patch(
      "/calamities/:calamityId/participants/status",
      async (req, res) => {
        try {
          const { userId, role, status } = req.body;
          const calamityId = new ObjectId(req.params.calamityId);

          if (!["volunteer", "doctor"].includes(role)) {
            return res.status(400).json({ error: "Invalid role" });
          }

          if (!["pending", "approved", "rejected"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
          }

          const field = role === "volunteer" ? "volunteers" : "doctors";
          const updateKey = `${field}.$.status`;

          const result = await calamityVolunteersCollection.updateOne(
            {
              calamityId,
              [field]: { $elemMatch: { userId: new ObjectId(userId) } },
            },
            { $set: { [updateKey]: status } }
          );

          if (result.modifiedCount === 0) {
            return res
              .status(404)
              .json({ error: "Participant not found or status unchanged" });
          }

          res.json({ message: "Participant status updated successfully" });
        } catch (err) {
          console.error("Error updating participant status:", err);
          res
            .status(500)
            .json({ error: "Failed to update participant status" });
        }
      }
    );

    // Get ongoing calamities
    app.get("/calamity", async (req, res) => {
      try {
        const { status } = req.query;
        const query = status ? { status } : {};
        console.log(status);

        const cursor = calamitiesCollection.find(query).sort({ createdAt: -1 });
        const calamities = await cursor.toArray();

        // Convert ObjectId to string and clean up the response
        const cleanCalamities = calamities.map((calamity) => ({
          ...calamity,
          _id: calamity._id.toString(),
          createdAt: calamity.createdAt.toISOString(),
          updatedAt: calamity.updatedAt
            ? calamity.updatedAt.toISOString()
            : null,
        }));

        res.json(cleanCalamities);
      } catch (error) {
        console.error("Error fetching calamities:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Get volunteer data for calamities
    app.get("/calamityVolunteers", async (req, res) => {
      try {
        const { calamityIds } = req.query;

        if (!calamityIds) {
          return res
            .status(400)
            .json({ error: "calamityIds parameter is required" });
        }

        const ids = calamityIds.split(",").map((id) => new ObjectId(id));

        // Find all volunteer assignments for these calamities
        const assignments = await calamityVolunteersCollection
          .find({
            calamityId: { $in: ids },
          })
          .toArray();

        // Get the corresponding calamity details
        const calamities = await calamitiesCollection
          .find({
            _id: { $in: ids },
          })
          .toArray();

        // Combine the data and clean up the response
        const result = assignments.map((assignment) => {
          const calamity = calamities.find((c) =>
            c._id.equals(assignment.calamityId)
          );
          return {
            calamityId: assignment.calamityId.toString(),
            volunteers: assignment.volunteers.map((v) => ({
              ...v,
              userId: v.userId.toString(),
              expiration: v.expiration.toISOString(),
              addedAt: v.addedAt.toISOString(),
            })),
            doctors: assignment.doctors.map((v) => ({
              ...v,
              userId: v.userId.toString(),
              expiration: v.expiration.toISOString(),
              addedAt: v.addedAt.toISOString(),
            })),
            calamityDetails: calamity
              ? {
                  ...calamity,
                  _id: calamity._id.toString(),
                  createdAt: calamity.createdAt.toISOString(),
                  updatedAt: calamity.updatedAt
                    ? calamity.updatedAt.toISOString()
                    : null,
                }
              : null,
          };
        });

        res.json(result);
      } catch (error) {
        console.error("Error fetching volunteer data:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // In your server.js file, update the /calamityVolunteers endpoint:
    app.get("/calamityVolunteersHistory", async (req, res) => {
      try {
        // If no calamityIds provided, return all assignments
        const assignments = await calamityVolunteersCollection.find().toArray();

        // Get all calamity details
        const calamityIds = assignments.map((a) => a.calamityId);
        const calamities = await calamitiesCollection
          .find({
            _id: { $in: calamityIds },
          })
          .toArray();

        // Combine the data
        const result = assignments.map((assignment) => {
          const calamity = calamities.find((c) =>
            c._id.equals(assignment.calamityId)
          );
          return {
            calamityId: assignment.calamityId.toString(),
            volunteers:
              assignment.volunteers?.map((v) => ({
                ...v,
                userId: v.userId?.toString(),
                expiration: v.expiration?.toISOString(),
                addedAt: v.addedAt?.toISOString(),
              })) || [],
            calamityDetails: calamity
              ? {
                  ...calamity,
                  _id: calamity._id.toString(),
                  createdAt: calamity.createdAt.toISOString(),
                  updatedAt: calamity.updatedAt?.toISOString(),
                }
              : null,
          };
        });

        res.json(result);
      } catch (error) {
        console.error("Error fetching volunteer data:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Respond to volunteer request
    app.patch("/volunteers/:id/respond", async (req, res) => {
      try {
        const { id } = req.params;
        const { action, email } = req.body;

        if (!["accepted", "rejected"].includes(action)) {
          return res.status(400).json({ error: "Invalid action" });
        }

        const result = await calamityVolunteersCollection.updateOne(
          {
            calamityId: new ObjectId(id),
            "volunteers.email": email,
          },
          {
            $set: { "volunteers.$.status": action },
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Volunteer request not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Error responding to request:", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.patch("/doctors/:id/respond", async (req, res) => {
      try {
        const { id } = req.params;
        const { action, email } = req.body;

        if (!["accepted", "rejected"].includes(action)) {
          return res.status(400).json({ error: "Invalid action" });
        }

        const result = await calamityVolunteersCollection.updateOne(
          {
            calamityId: new ObjectId(id),
            "doctors.email": email,
          },
          {
            $set: { "doctors.$.status": action },
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Volunteer request not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Error responding to request:", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.post("/emergencyHelp", async (req, res) => {
      try {
        const emergencyHelpSchema = z.object({
          phoneNumber: z
            .string()
            .min(10, "Phone number must be at least 10 digits")
            .max(15, "Phone number cannot exceed 15 digits")
            .regex(/^[0-9]+$/, "Phone number must contain only numbers"),
          location: z.string().min(3, "Location must be at least 3 characters"),
          crisisFor: z.string().min(1, "Crisis type is required"),
          message: z.string().min(20, "Message must be at least 20 characters"),
          userEmail: z.string().email("Invalid email format"),
          status: z.string().default("Pending"),
          isRescued: z.string().default("No"),
          createdAt: z.string().datetime(),
        });

        const validatedData = await emergencyHelpSchema.parseAsync(req.body);

        // Verify the referenced calamity exists and is ongoing
        const calamity = await calamitiesCollection.findOne({
          _id: new ObjectId(validatedData.crisisFor),
          status: "Ongoing",
        });

        if (!calamity) {
          return res.status(400).json({
            success: false,
            message: "Invalid crisis reference or crisis is not ongoing",
          });
        }

        // Insert the emergency help request
        const result = await emergencyhelpCollections.insertOne(validatedData);

        res.status(201).json({
          success: true,
          message: "Emergency help request submitted successfully",
          data: {
            _id: result.insertedId,
            ...validatedData,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.errors,
          });
        }

        console.error("Error submitting emergency help request:", error);
        res.status(500).json({
          success: false,
          message: "Failed to submit emergency help request",
        });
      }
    });

    // Add this to your server routes
    app.get("/emergencyCases", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ error: "Email parameter is required" });
        }

        // 1. Get all emergency help requests that are not rescued
        const emergencyRequests = await emergencyhelpCollections
          .find({
            isRescued: "No",
          })
          .toArray();

        // 2. Get ongoing calamities
        const ongoingCalamities = await calamitiesCollection
          .find({
            status: "Ongoing",
          })
          .toArray();

        // 3. Get volunteer assignments for these calamities
        const calamityIds = ongoingCalamities.map((c) => c._id);
        const volunteerAssignments = await calamityVolunteersCollection
          .find({
            calamityId: { $in: calamityIds },
          })
          .toArray();

        // 4. Filter requests where:
        //    - crisisFor matches an ongoing calamity
        //    - current user is assigned to that calamity
        const filteredRequests = emergencyRequests.filter((request) => {
          // Find the calamity this request is for
          const calamity = ongoingCalamities.find(
            (c) => c._id.toString() === request.crisisFor
          );

          if (!calamity) return false;

          // Check if user is assigned to this calamity
          const assignment = volunteerAssignments.find(
            (a) =>
              a.calamityId.equals(calamity._id) &&
              a.volunteers.some(
                (v) => v.email === email && v.status === "accepted"
              )
          );

          return !!assignment;
        });

        // 5. Enrich the data with calamity details
        const enrichedRequests = filteredRequests.map((request) => {
          const calamity = ongoingCalamities.find(
            (c) => c._id.toString() === request.crisisFor
          );

          return {
            ...request,
            calamityDetails: calamity
              ? {
                  title: calamity.title,
                  image: calamity.image,
                  location: calamity.location,
                }
              : null,
          };
        });

        res.json(enrichedRequests);
      } catch (error) {
        console.error("Error fetching emergency cases:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

    // Add this PATCH endpoint for updating status
    // Change this endpoint in your server code
    app.patch("/emergencyCases/:id", async (req, res) => {
      try {
        const { id } = req.params; // Changed from req.query to req.params
        const { action } = req.body;

        if (!["Approved", "Rescued"].includes(action)) {
          return res.status(400).json({ error: "Invalid action" });
        }

        const update =
          action === "Rescued" ? { isRescued: "Yes" } : { status: action };

        const result = await emergencyhelpCollections.updateOne(
          { _id: new ObjectId(id) },
          { $set: update }
        );

        if (result.modifiedCount === 0) {
          return res.status(404).json({ error: "Emergency case not found" });
        }

        res.json({ success: true });
      } catch (error) {
        console.error("Error updating emergency case:", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    // Add this endpoint before app.listen()
    // Add this endpoint before app.listen()
    // Update the verify-rescue endpoint
    app.patch("/emergencyCasess/verify-rescue", async (req, res) => {
      try {
        const { id, userEmail, volunteerEmail } = req.body;
        console.log(id, userEmail, volunteerEmail);
        console.log("hello");
        // Validate required fields
        if (!id || !userEmail || !volunteerEmail) {
          return res.status(400).json({
            success: false,
            message: "Missing required fields (id, userEmail, volunteerEmail)",
          });
        }

        // Convert string ID to ObjectId
        let objectId;
        try {
          objectId = new ObjectId(id);
        } catch (err) {
          return res.status(400).json({
            success: false,
            message: "Invalid emergency case ID format",
          });
        }

        // Find the emergency case
        const emergencyCase = await emergencyhelpCollections.findOne({
          _id: objectId,
          userEmail: userEmail,
        });

        if (!emergencyCase) {
          return res.status(404).json({
            success: false,
            message: "Emergency case not found or email doesn't match",
          });
        }

        // Update the case
        const result = await emergencyhelpCollections.updateOne(
          { _id: objectId },
          {
            $set: {
              isRescued: "Yes",
              rescuedBy: volunteerEmail,
              rescuedAt: new Date(),
            },
          }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).json({
            success: false,
            message: "Failed to update emergency case - no changes made",
          });
        }

        res.json({
          success: true,
          message: "Case marked as rescued successfully",
          updatedCase: {
            ...emergencyCase,
            isRescued: "Yes",
            rescuedBy: volunteerEmail,
            rescuedAt: new Date(),
          },
        });
      } catch (error) {
        console.error("Error verifying and updating emergency case:", error);
        res.status(500).json({
          success: false,
          error: "Server error",
          message: error.message,
        });
      }
    });

    app.get("/rescued-cases", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ error: "Email parameter is required" });
        }

        const rescuedCases = await emergencyhelpCollections
          .find({
            rescuedBy: email,
            isRescued: "Yes",
          })
          .sort({ rescuedAt: -1 })
          .toArray();

        // Get calamity details for each case (including image)
        const casesWithDetails = await Promise.all(
          rescuedCases.map(async (caseItem) => {
            const calamity = await calamitiesCollection.findOne({
              _id: new ObjectId(caseItem.crisisFor),
            });
            return {
              ...caseItem,
              calamityDetails: {
                title: calamity?.title || "Unknown",
                image: calamity?.image || null,
              },
            };
          })
        );

        res.json(casesWithDetails);
      } catch (error) {
        console.error("Error fetching rescued cases:", error);
        res.status(500).json({ error: "Server error" });
      }
    });

    app.post("/programCollections", async (req, res) => {
      try {
        // Common schema elements
        const commonSchema = {
          programName: z.string(),
          status: z
            .enum(["quick", "upcoming", "ongoing", "closed"])
            .default("quick"),
          createdAt: z.date().default(() => new Date()),
        };

        // Health Initiative schema
        const healthSchema = z.object({
          ...commonSchema,
          programName: z.literal("Health Initiative"),
          title: z.string().min(3),
          subtitle: z.string().min(3),
          bannerImage: z.string(),
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          time: z.string().regex(/^\d{2}:\d{2}$/),
          locations: z.string().min(3),
          programDetails: z.string().min(20),
          servicesOffered: z.string().min(20),
          doctorsList: z.array(z.string().min(1)).min(1),
        });

        // Seminar schema
        const seminarSchema = z.object({
          ...commonSchema,
          programName: z.literal("Seminar"),
          title: z.string().min(3),
          subtitle: z.string().min(3),
          bannerImage: z.string(),
          startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
          time: z.string().regex(/^\d{2}:\d{2}$/),
          locations: z.string().min(3),
          programDetails: z.string().min(20),
          teachersList: z.array(z.string().min(1)).min(1),
          learnedAbout: z.string().min(20),
        });

        // Announcement schema
        const announcementSchema = z.object({
          ...commonSchema,
          programName: z.literal("Announcement"),
          announcementText: z.string().min(20),
        });

        // Determine which schema to use
        let schema;
        switch (req.body.programName) {
          case "Health Initiative":
            schema = healthSchema;
            break;
          case "Seminar":
            schema = seminarSchema;
            break;
          case "Announcement":
            schema = announcementSchema;
            break;
          default:
            return res.status(400).json({ error: "Invalid program type" });
        }

        // Validate request body
        const validatedData = await schema.parseAsync(req.body);

        // Additional validation for doctors/teachers
        if (validatedData.programName === "Health Initiative") {
          const doctors = await usersCollection
            .find({
              _id: {
                $in: validatedData.doctorsList.map((id) => new ObjectId(id)),
              },
              volunteer_type: "Doctor",
            })
            .toArray();

          if (doctors.length !== validatedData.doctorsList.length) {
            return res.status(400).json({
              error: "One or more selected doctors are invalid or not doctors",
              details: validatedData.doctorsList.filter(
                (id) => !doctors.some((d) => d._id.toString() === id)
              ),
            });
          }
        }

        if (validatedData.programName === "Seminar") {
          const teachers = await usersCollection
            .find({
              _id: {
                $in: validatedData.teachersList.map((id) => new ObjectId(id)),
              },
              volunteer_type: "Teacher",
            })
            .toArray();

          if (teachers.length !== validatedData.teachersList.length) {
            return res.status(400).json({
              error:
                "One or more selected teachers are invalid or not teachers",
              details: validatedData.teachersList.filter(
                (id) => !teachers.some((t) => t._id.toString() === id)
              ),
            });
          }
        }

        // Insert the program
        const result = await programsCollections.insertOne(validatedData);

        res.status(201).json({
          _id: result.insertedId,
          ...validatedData,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            error: "Validation failed",
            details: error.errors.map((err) => ({
              path: err.path.join("."),
              message: err.message,
            })),
          });
        }
        console.error("Error creating program:", error);
        res.status(500).json({ error: "Failed to create program" });
      }
    });

    // Add this to your existing routes
    app.get("/quick-programs", async (req, res) => {
      try {
        const programs = await programsCollections
          .find({
            status: "quick",
            // Exclude announcements
          })
          .sort({ createdAt: -1 })
          // Limit to 3 items for the carousel
          .toArray();

        res.json(programs);
      } catch (error) {
        console.error("Error fetching quick programs:", error);
        res.status(500).json({ error: "Failed to fetch programs" });
      }
    });

    // Get all programs with registration counts
    app.get("/programs", async (req, res) => {
      try {
        const programs = await programsCollections
          .find()
          .sort({ createdAt: -1 })
          .toArray();

        // Get registration counts for each program
        const programsWithCounts = await Promise.all(
          programs.map(async (program) => {
            const registration =
              await programsCollectioinsRegistrations.findOne({
                programId: program._id,
              });

            return {
              ...program,
              registeredCount: registration?.registrations?.length || 0,
            };
          })
        );

        res.json(programsWithCounts);
      } catch (error) {
        console.error("Error fetching programs:", error);
        res.status(500).json({ error: "Failed to fetch programs" });
      }
    });

    // Update program endpoint
    app.put("/programs/:id", async (req, res) => {
      try {
        const programId = new ObjectId(req.params.id);
        const updateData = req.body;

        // Determine which schema to use based on existing program
        const existingProgram = await programsCollections.findOne({
          _id: programId,
        });
        if (!existingProgram) {
          return res.status(404).json({ error: "Program not found" });
        }

        // Common schema elements
        const commonSchema = {
          status: z.enum(["quick", "upcoming", "ongoing", "closed"]).optional(),
        };

        let schema;
        if (existingProgram.programName === "Health Initiative") {
          schema = z.object({
            ...commonSchema,
            title: z.string().min(3).optional(),
            subtitle: z.string().min(3).optional(),
            bannerImage: z.string().optional(),
            startDate: z
              .string()
              .regex(/^\d{4}-\d{2}-\d{2}$/)
              .optional(),
            endDate: z
              .string()
              .regex(/^\d{4}-\d{2}-\d{2}$/)
              .optional(),
            time: z
              .string()
              .regex(/^\d{2}:\d{2}$/)
              .optional(),
            locations: z.string().min(3).optional(),
            programDetails: z.string().min(20).optional(),
            servicesOffered: z.string().min(20).optional(),
            doctorsList: z.array(z.string().min(1)).min(1).optional(),
          });
        } else if (existingProgram.programName === "Seminar") {
          schema = z.object({
            ...commonSchema,
            title: z.string().min(3).optional(),
            subtitle: z.string().min(3).optional(),
            bannerImage: z.string().optional(),
            startDate: z
              .string()
              .regex(/^\d{4}-\d{2}-\d{2}$/)
              .optional(),
            time: z
              .string()
              .regex(/^\d{2}:\d{2}$/)
              .optional(),
            locations: z.string().min(3).optional(),
            programDetails: z.string().min(20).optional(),
            teachersList: z.array(z.string().min(1)).min(1).optional(),
            learnedAbout: z.string().min(20).optional(),
          });
        } else {
          // Announcement
          schema = z.object({
            ...commonSchema,
            announcementText: z.string().min(20).optional(),
          });
        }

        // Validate request body
        const validatedData = await schema.parseAsync(updateData);

        // Additional validation for doctors/teachers if those fields are being updated
        if (validatedData.doctorsList) {
          const doctors = await usersCollection
            .find({
              _id: {
                $in: validatedData.doctorsList.map((id) => new ObjectId(id)),
              },
              volunteer_type: "Doctor",
            })
            .toArray();

          if (doctors.length !== validatedData.doctorsList.length) {
            return res.status(400).json({
              error: "One or more selected doctors are invalid or not doctors",
              details: validatedData.doctorsList.filter(
                (id) => !doctors.some((d) => d._id.toString() === id)
              ),
            });
          }
        }

        if (validatedData.teachersList) {
          const teachers = await usersCollection
            .find({
              _id: {
                $in: validatedData.teachersList.map((id) => new ObjectId(id)),
              },
              volunteer_type: "Teacher",
            })
            .toArray();

          if (teachers.length !== validatedData.teachersList.length) {
            return res.status(400).json({
              error:
                "One or more selected teachers are invalid or not teachers",
              details: validatedData.teachersList.filter(
                (id) => !teachers.some((t) => t._id.toString() === id)
              ),
            });
          }
        }

        // Update the program
        const result = await programsCollections.updateOne(
          { _id: programId },
          { $set: validatedData }
        );

        if (result.modifiedCount === 0) {
          return res.status(400).json({
            success: false,
            message: "No changes were made",
          });
        }

        res.json({
          success: true,
          message: "Program updated successfully",
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.errors,
          });
        }

        console.error("Error updating program:", error);
        res.status(500).json({
          success: false,
          message: "Failed to update program",
        });
      }
    });

    // Get single program by ID
    app.get("/program/:id", async (req, res) => {
      try {
        const program = await programsCollections.findOne({
          _id: new ObjectId(req.params.id),
        });

        if (!program) {
          return res.status(404).json({ error: "Program not found" });
        }

        // If it's a health initiative, populate doctors info
        if (program.programName === "Health Initiative") {
          const doctors = await usersCollection
            .find({
              _id: { $in: program.doctorsList.map((id) => new ObjectId(id)) },
            })
            .toArray();

          program.doctorsInfo = doctors;
        }

        res.json(program);
      } catch (error) {
        console.error("Error fetching program:", error);
        res.status(500).json({ error: "Failed to fetch program" });
      }
    });

    // Program Registration Endpoints

    app.post("/program-registration", async (req, res) => {
      try {
        const registrationSchema = z.object({
          programId: z.string().min(1, "Program ID is required"),
          name: z.string().min(2, "Name must be at least 2 characters"),
          email: z.string().email("Invalid email format"),
          phone: z.string().min(10, "Phone must be at least 10 digits"),
        });

        const validatedData = await registrationSchema.parseAsync(req.body);

        // Check if user exists and get their photo
        const user = await usersCollection.findOne(
          { email: validatedData.email },
          { projection: { photoUrl: 1 } }
        );

        const registrationData = {
          programId: new ObjectId(validatedData.programId),
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          photoUrl: user?.photoUrl || "https://via.placeholder.com/150",
          registeredAt: new Date(),
        };

        // Check if this user is already registered for this program
        const existingRegistration =
          await programsCollectioinsRegistrations.findOne({
            programId: registrationData.programId,
            "registrations.email": registrationData.email,
          });

        if (existingRegistration) {
          return res.status(400).json({
            success: false,
            message: "You are already registered for this program",
          });
        }

        // Add to registrations array (upsert)
        const result = await programsCollectioinsRegistrations.updateOne(
          { programId: registrationData.programId },
          { $push: { registrations: registrationData } },
          { upsert: true }
        );

        res.status(201).json({
          success: true,
          message: "Registration successful",
          data: registrationData,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.errors,
          });
        }

        console.error("Error during program registration:", error);
        res.status(500).json({
          success: false,
          message: "Failed to register for program",
        });
      }
    });

    // Get program registrations
    app.get("/program-registrations/:programId", async (req, res) => {
      try {
        const programId = new ObjectId(req.params.programId);

        const registrationDoc = await programsCollectioinsRegistrations.findOne(
          {
            programId: programId,
          }
        );

        if (!registrationDoc) {
          return res.json({
            success: true,
            data: {
              programId: programId,
              registrations: [],
            },
          });
        }

        res.json({
          success: true,
          data: registrationDoc,
        });
      } catch (error) {
        console.error("Error fetching program registrations:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch registrations",
        });
      }
    });

    // Add this to your server.js routes
    app.get("/teacher-programs", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ error: "Email parameter is required" });
        }

        // First get the user's ID
        const user = await usersCollection.findOne(
          { email },
          { projection: { _id: 1 } }
        );

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Find all seminar programs where this user is in the teachersList
        const programs = await programsCollections
          .find({
            programName: "Seminar",
            teachersList: user._id.toString(),
          })
          .sort({ createdAt: -1 })
          .toArray();

        // Get registration data for each program
        const programsWithRegistrations = await Promise.all(
          programs.map(async (program) => {
            const registration =
              await programsCollectioinsRegistrations.findOne({
                programId: program._id,
              });

            return {
              ...program,
              registrations: registration?.registrations || [],
            };
          })
        );

        res.json(programsWithRegistrations);
      } catch (error) {
        console.error("Error fetching teacher programs:", error);
        res.status(500).json({ error: "Failed to fetch programs" });
      }
    });
    app.get("/doctor-programs", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({ error: "Email parameter is required" });
        }

        // First get the user's ID
        const user = await usersCollection.findOne(
          { email },
          { projection: { _id: 1 } }
        );

        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }

        // Find all seminar programs where this user is in the teachersList
        const programs = await programsCollections
          .find({
            programName: "Health Initiative",
            doctorsList: user._id.toString(),
          })
          .sort({ createdAt: -1 })
          .toArray();

        // Get registration data for each program
        const programsWithRegistrations = await Promise.all(
          programs.map(async (program) => {
            const registration =
              await programsCollectioinsRegistrations.findOne({
                programId: program._id,
              });

            return {
              ...program,
              registrations: registration?.registrations || [],
            };
          })
        );

        res.json(programsWithRegistrations);
      } catch (error) {
        console.error("Error fetching doctor programs:", error);
        res.status(500).json({ error: "Failed to fetch programs" });
      }
    });

    // chatbot
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    app.post("/chat", async (req, res) => {
      const userMessage = req.body.message;

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `
          You are a professional Health & Sanitation Assistant. Respond to health-related queries about:
          - Sanitation (hygiene, waste management)
          - Nutrition (diet plans, vitamins)
          - General health (fitness, disease prevention)
          
          Rules:
          1. Be concise but helpful
          2. Format lists with bullet points
          3. Always add: "Consult a doctor for medical advice."
          
          User Question: "${userMessage}"
        `;

      const result = await model.generateContent(prompt);
      const aiResponse = result.response.text();
      res.send({ reply: aiResponse });
    });

    // Donations

    app.post("/donations", async (req, res) => {
      const query = req.body;
      console.log(query);

      const tranx = new ObjectId().toString();
      query.transactionId = tranx;

      const data = {
        store_id: `${process.env.PAYMENT_STORE_ID}`,
        store_passwd: `${process.env.PAYMENT_STORE_PASS}`,
        total_amount: `${query.amount}`,
        currency: `${query.currency}`,
        tran_id: tranx, // use unique tran_id for each api call
        success_url: "http://localhost:5000/payment-success",
        fail_url: "http://localhost:5173/fail",
        cancel_url: "http://localhost:5173/cancel",
        ipn_url: "http://localhost:5000/ipn-payment-success",
        shipping_method: "Courier",
        product_name: "Computer.",
        product_category: "Electronic",
        product_profile: "general",
        cus_name: `${query.name}`,
        cus_email: `${query.email}`,
        cus_add1: "Dhaka",
        cus_add2: "Dhaka",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: "01711111111",
        cus_fax: "01711111111",
        ship_name: "Customer Name",
        ship_add1: "Dhaka",
        ship_add2: "Dhaka",
        ship_city: "Dhaka",
        ship_state: "Dhaka",
        ship_postcode: 1000,
        ship_country: "Bangladesh",
      };

      const iniResponse = await axios({
        url: "https://sandbox.sslcommerz.com/gwprocess/v4/api.php",
        method: "POST",
        data: data,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const savedData = await paymentCollection.insertOne(query);

      // console.log(iniResponse)
      const gatewayPageURL = iniResponse?.data?.GatewayPageURL;
      // console.log(gatewayPageURL)

      res.status(201).json({
        success: true,
        message: "donation successful",
        data: gatewayPageURL,
      });
    });

    // payment success
    app.post("/payment-success", async (req, res) => {
      const getSuccess = req.body;
      // console.log(getSuccess)

      const { data } = await axios.get(
        `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${getSuccess.val_id}&store_id=cse4768159f1b9d234&store_passwd=cse4768159f1b9d234@ssl`
      );
      // console.log(isValidPayment)

      if (data.status !== "VALID") {
        return res.send({ message: "Payment Failed" });
      }

      // update payment status
      const updatePayment = await paymentCollection.updateOne(
        { transactionId: data.tran_id },
        { $set: { status: "Success" } }
      );

      res.redirect("http://localhost:5173/success");

      console.log(updatePayment);
    });

    // Add this with your other routes
    app.get("/donations", async (req, res) => {
      try {
        const { email } = req.query;

        if (!email) {
          return res.status(400).json({
            success: false,
            message: "Email parameter is required",
          });
        }

        const donations = await paymentCollection
          .find({ email, status: "Success" })
          .sort({ createdAt: -1 })
          .toArray();

        res.json(donations);
      } catch (error) {
        console.error("Error fetching donations:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch donation history",
        });
      }
    });

    // for view donaions part
    // Add this with your other routes in server.js

    // Get all successful donations (for admin)
    app.get("/admin/donations", async (req, res) => {
      try {
        // Add admin authentication check if needed
        // if (!req.user || req.user.role !== 'admin') {
        //   return res.status(403).json({ error: 'Unauthorized' });
        // }

        const donations = await paymentCollection
          .find({ status: "Success" })
          .sort({ createdAt: -1 })
          .toArray();

        res.json({
          success: true,
          data: donations,
        });
      } catch (error) {
        console.error("Error fetching donations:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch donation history",
        });
      }
    });

    // find programs by id for donations
    // Add this with your other routes in server.js
    app.get("/donations/program/:programId", async (req, res) => {
      try {
        const programId = req.params.programId;

        const donations = await paymentCollection
          .find({
            programId: programId,
            status: "Success",
          })
          .toArray();

        const totalRaised = donations.reduce(
          (sum, donation) => sum + donation.amount,
          0
        );

        res.json({
          success: true,
          data: {
            donations,
            totalRaised,
          },
        });
      } catch (error) {
        console.error("Error fetching program donations:", error);
        res.status(500).json({
          success: false,
          message: "Failed to fetch program donations",
        });
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Health and Sanitation Platform is running");
});

// Add this right before app.listen()
// Schedule daily cleanup of expired participants
setInterval(async () => {
  try {
    const now = new Date();
    await calamityVolunteersCollection.updateMany({}, [
      {
        $set: {
          volunteers: {
            $map: {
              input: "$volunteers",
              as: "volunteer",
              in: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$$volunteer.status", "pending"] },
                      { $lt: ["$$volunteer.expiration", now] },
                    ],
                  },
                  { $mergeObjects: ["$$volunteer", { status: "rejected" }] },
                  "$$volunteer",
                ],
              },
            },
          },
        },
      },
      {
        $set: {
          doctors: {
            $map: {
              input: "$doctors",
              as: "doctor",
              in: {
                $cond: [
                  {
                    $and: [
                      { $eq: ["$$doctor.status", "pending"] },
                      { $lt: ["$$doctor.expiration", now] },
                    ],
                  },
                  { $mergeObjects: ["$$doctor", { status: "rejected" }] },
                  "$$doctor",
                ],
              },
            },
          },
        },
      },
    ]);

    // Remove rejected participants
    await calamityVolunteersCollection.updateMany({}, [
      {
        $set: {
          volunteers: {
            $filter: {
              input: "$volunteers",
              as: "volunteer",
              cond: { $ne: ["$$volunteer.status", "rejected"] },
            },
          },
          doctors: {
            $filter: {
              input: "$doctors",
              as: "doctor",
              cond: { $ne: ["$$doctor.status", "rejected"] },
            },
          },
        },
      },
    ]);

    console.log("Completed cleanup of expired participants");
  } catch (error) {
    console.error("Error during participant cleanup:", error);
  }
}, 24 * 60 * 60 * 1000); // Run daily

app.listen(port, () => {
  console.log(`Health and Sanitation Platform is running on ${port} port`);
});
