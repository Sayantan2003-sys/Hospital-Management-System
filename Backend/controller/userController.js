import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { generateToken } from "../utils/jwtToken.js";
import cloudinary from "cloudinary";

// ===================== PATIENT REGISTRATION =====================
export const patientRegistration = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, adharId, dob, gender, password, role } = req.body;

  if (!firstName || !lastName || !email || !phone || !adharId || !dob || !gender || !password || !role) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  let user = await User.findOne({ email });
  if (user) {
    return next(new ErrorHandler("User already exists with this email", 400));
  }

  // ✅ No photo required for patients
  user = await User.create({ firstName, lastName, email, phone, adharId, dob, gender, password, role });
  generateToken(user, "Patient registered successfully", 200, res);
});


// ===================== LOGIN =====================
export const login = catchAsyncErrors(async (req, res, next) => {
  const { email, password, confirmPassword, role } = req.body;

  if (!email || !password || !confirmPassword || !role) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  if (password !== confirmPassword) {
    return next(new ErrorHandler("Passwords do not match", 400));
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 400));
  }

  if (role !== user.role) {
    return next(new ErrorHandler("User with this Role Not Found!", 400));
  }

  generateToken(user, "Login Successful", 200, res);
});


// ===================== ADD NEW ADMIN =====================
export const addNewAdmin = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, adharId, dob, gender, password } = req.body;

  if (!firstName || !lastName || !email || !phone || !adharId || !dob || !gender || !password) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  const isRegisterd = await User.findOne({ email });
  if (isRegisterd) {
    return next(new ErrorHandler(`${isRegisterd.role} already exists with this email`, 400));
  }

  // ✅ No photo required for admins
  const admin = await User.create({
    firstName,
    lastName,
    email,
    phone,
    adharId,
    dob,
    gender,
    password,
    role: "Admin",
  });

  res.status(200).json({
    success: true,
    message: "New Admin added successfully",
    admin,
  });
});


// ===================== ADD NEW DOCTOR =====================
export const addNewDoctor = catchAsyncErrors(async (req, res, next) => {
  const { firstName, lastName, email, phone, adharId, dob, gender, password, doctorDepartment } = req.body;

  // ✅ Validate required fields
  if (!firstName || !lastName || !email || !phone || !adharId || !dob || !gender || !password || !doctorDepartment) {
    return next(new ErrorHandler("Please fill all required fields", 400));
  }

  // ✅ Check if already registered
  const isRegistered = await User.findOne({ email });
  if (isRegistered) {
    return next(new ErrorHandler(`${isRegistered.role} already exists with this email`, 400));
  }

  // ✅ Check if doctor photo exists
  if (!req.files || !req.files.docAvatar) {
    return next(new ErrorHandler("Please upload doctor's photo", 400));
  }

  const { docAvatar } = req.files;

  // ✅ Validate file type
  const allowedFormats = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (!allowedFormats.includes(docAvatar.mimetype)) {
    return next(new ErrorHandler("File format not supported. Please upload JPG, PNG, or WEBP.", 400));
  }

  // ✅ Upload to Cloudinary
  const cloudinaryResponse = await cloudinary.uploader.upload(docAvatar.tempFilePath);
  if (!cloudinaryResponse || cloudinaryResponse.error) {
    return next(new ErrorHandler("Cloudinary upload failed", 500));
  }

  // ✅ Create doctor
  const doctor = await User.create({
    firstName,
    lastName,
    email,
    phone,
    adharId,
    dob,
    gender,
    password,
    doctorDepartment,
    role: "Doctor",
    docAvatar: {
      public_id: cloudinaryResponse.public_id,
      url: cloudinaryResponse.secure_url,
    },
  });

  res.status(200).json({
    success: true,
    message: "New Doctor added successfully",
    doctor,
  });
});



// ===================== GET ALL DOCTORS =====================
export const getAllDoctors = catchAsyncErrors(async (req, res, next) => {
  const doctors = await User.find({ role: "Doctor" });
  res.status(200).json({
    success: true,
    doctors,
  });
});


// ===================== GET USER DETAILS =====================
export const getUserDetails = catchAsyncErrors(async (req, res, next) => {
  const user = req.user;
  res.status(200).json({
    success: true,
    user,
  });
});


// ===================== LOGOUT (ADMIN + PATIENT) =====================
export const logoutAdmin = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("adminToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Admin logged out successfully",
    });
});

export const logoutPatient = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("patientToken", "", {
      httpOnly: true,
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Patient logged out successfully",
    });
});

