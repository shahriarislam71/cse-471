const express = require("express");
const app = express();
const cors = require("cors");
const { z } = require("zod"); // Import Zod
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

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
    await client.connect();

    const db = client.db("HealthAndSanitation");
    const usersCollection = db.collection("user");
    const volunteersCollection = db.collection("volunteersRegistration");
    const appointmentsCollection = db.collection("doctorAppointments");
    const eventsCollection = db.collection("events");

    // users collections
    app.get("/users", async (req, res) => {
      const users = await usersCollection.find().toArray();
      res.send(users);
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

app.listen(port, () => {
  console.log(`Health and Sanitation Platform is running on ${port} port`);
});
