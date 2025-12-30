import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


const userSchema = new mongoose.Schema({
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

    password: {
        type: String,
        required: true,
        minLength: [8, "Password must be at least 8 characters long"],
        select: false,
    },

    role: {
        type: String,
        required: true,
        enum: ["Admin", "Patient", "Doctor"],
    },

    doctorDepartment: {
        type: String,
    },

    docAvatar: {
        public_id: {
            type: String,
            default: null,
        },
        url: {
            type: String,
            default: null,
        }
    },

        createdAt: {
        type: Date,
        default: Date.now
    },
});


userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
};

userSchema.methods.generateJsonWebToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
        expiresIn: process.env.JWT_EXPIRES,
    });
}


export const User = mongoose.model("User", userSchema, "users");