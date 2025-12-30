import moongoose from 'mongoose';
import validator from 'validator';

const appointmentSchema = new moongoose.Schema({
    firstName: {
        type: String,
        required: true,
        minLength: [3, "First name must be at least 3 characters long"],
    },
    lastName: {
        type: String,
        required: true,
        minLength: [3, "Last name must be at least 3 characters long"],
    },
    email: {
        type: String,
        required: true,
        validate: [validator.isEmail, "Please enter a valid email address"],
    },
    phone: {
        type: String,
        required: true,
        minLength: [10, "Phone number must be at least 10 digits long"],
        maxLength: [10, "Phone number cannot exceed 10 digits"],
    },
    adharId: {
        type: String,
        required: true,
        minLength: [12, "Adhar ID must be at least 12 digits long"],
        maxLength: [12, "Adhar ID cannot exceed 12 digits"],
    },

    dob: {
        type: Date,
        required: [true, "Date of Birth is required"],
    },

    gender: {
        type: String,
        required: true,
        enum: ["Male", "Female", "Other"],
    },

    appointment_date: {
        type: Date,
        required: [true, "Appointment date is required"],
    },

    department: {
        type: String,
        required: [ true, "Department is required"],
    },

    doctor: {
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
    },

    hasVisited: {
        type: Boolean,
        default: false,
    },

    address: {
        type: String,
        required: true,
    },

    doctorId: {
        type: moongoose.Schema.ObjectId,
        required: [true, "Doctor ID is required"],
    },

    patientId: {
        type: moongoose.Schema.ObjectId,
        required: [true, "Patient ID is required"],
    },

    status: {
        type: String,
        enum: ["Pending", "Accepted", "Rejected"],
        default: "Pending",
    },

});

export const Appointment = moongoose.model("Appointment", appointmentSchema, "appointments");

