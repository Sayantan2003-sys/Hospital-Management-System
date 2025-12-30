import { catchAsyncErrors } from "../middlewares/catchAsyncError.js";
import { User } from "../models/userSchema.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { Appointment } from "../models/appointmentSchema.js";



export const postAppointment = catchAsyncErrors(async (req, res, next) => {
    const { firstName, lastName, email, phone,
        appointment_date, adharId, dob, gender,
        address, department, doctor_firstName,
        doctor_lastName, hasVisited } = req.body;

    if (!firstName || !lastName || !email || !phone ||
        !appointment_date || !adharId || !dob || !gender ||
        !address || !department || !doctor_firstName ||
        !doctor_lastName) {
        return next(new ErrorHandler("Please fill all the required fields", 400));
    }

    const isConflict = await User.find({
        firstName: doctor_firstName,
        lastName: doctor_lastName,
        role: "Doctor",
        doctorDepartment: department,
    });
    if (isConflict.length === 0) {
        return next(new ErrorHandler("No such doctor found", 404));
    }

    if (isConflict.length > 1) {
        return next(new ErrorHandler("Doctor Conflict! Please Contact Through Phone or Email", 404));
    }

    const doctorId = isConflict[0]._id;
    const patientId = req.user._id;

    const appointment = await Appointment.create({
        firstName, lastName, email, phone,
        appointment_date, adharId, dob, gender,
        address, department,
        doctor: {
            firstName: doctor_firstName,
            lastName: doctor_lastName,
        },
        hasVisited, doctorId, patientId
    });
    res.status(200).json({
        success: true,
        message: "Appointment booked successfully",
        appointment,
    });

});

export const getAllAppointments = catchAsyncErrors(async (req, res, next) => {
    const appointments = await Appointment.find();
    res.status(200).json({
        success: true,
        appointments,
    });
});

export const updateAppointmentStatus = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    let appointment = await Appointment.findById(id);

    if(!appointment){
        return next(new ErrorHandler("No such appointment found", 404));
    }
    appointment = await Appointment.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    });
    res.status(200).json({
        success: true,
        message: "Appointment updated successfully",
        appointment,
    });
});

export const deleteAppointment = catchAsyncErrors(async (req, res, next) => {
    const { id } = req.params;
    const appointment = await Appointment.findById(id);
    if(!appointment){
        return next(new ErrorHandler("No such appointment found", 404));
    }
    await appointment.deleteOne();
    res.status(200).json({
        success: true,
        message: "Appointment deleted successfully",
    });
});