import asyncHandler from "../config/asyncHandler.js";
import studentModel from "../model/studentModel.js";
import cloudinary from "../config/cloudinary.config.js";
import transporter from "../utils/nodemailer.js";
import jwt from "jsonwebtoken";
import subjectModel from "../model/subjectModel.js";
import axios from "axios";
import Flutterwave from "flutterwave-node-v3";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

dotenv.config();


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleAuthStudent = async (req, res, next) => {
  const { token } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let student = await studentModel.findOne({ email: payload.email });

    if (!student) {
      student = await studentModel.create({
        name: payload.name,
        email: payload.email,
        profilePicture: payload.picture,
        googleId: payload.sub, 
      });
    }

    const jwtToken = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res
      .cookie("token", jwtToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .cookie("googleToken", token, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .json({
        success: true,
        message: "Login successful with Google",
        student,
      });

  } catch (err) {
    next(new Error("Google authentication failed"));
  }
};


export const registerStudent = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    otherName,
    level,
    parent_guardian,
    email,
    password,
    confirmPassword,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !level ||
    !parent_guardian ||
    !email ||
    !password ||
    !confirmPassword
  ) {
    res.statusCode = 400;
    return next(new Error("These fields are required"));
  }

  const normalizedEmail = email.toLowerCase();
  let student = await studentModel.findOne({ email: normalizedEmail });

  if (password !== confirmPassword) {
    res.statusCode = 400;
    return next(new Error("Passwords do not match"));
  }

  if (student && student.password) {
    res.statusCode = 401;
    return next(new Error("Student already registered. Please login"));
  }

  if (!student) {
    student = new studentModel({ email: normalizedEmail });
  }

  let uploadResult = { secure_url: "", public_id: "" };
  if (req.file) {
    try {
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: "auto" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
    } catch (uploadError) {
      return next(new Error("Image upload failed"));
    }
  }

  // Set student properties
  student.firstName = firstName;
  student.lastName = lastName;
  student.otherName = otherName;
  student.level = level;
  student.parent_guardian = parent_guardian;
  student.profilePicture = uploadResult.secure_url;
  student.cloudinary_id = uploadResult.public_id;
  student.subjects = (await subjectModel.find({ className: level })).map(
    (s) => s._id
  );

  const salt = await bcrypt.genSalt(10);
  student.password = await bcrypt.hash(password, salt);

  // Generate and set OTP
  const OTP = Math.floor(100000 + Math.random() * 900000).toString();
  student.signupOTP = OTP;
  student.signupOTPExpireAt = Date.now() + 15 * 60 * 1000; // Expires in 15 minutes

  await student.save();

  const newStudent = await studentModel.findById(student._id);
  if (!newStudent) {
    res.statusCode = 500;
    return next(new Error("Account not created. Please try again"));
  }

  const token = jwt.sign({ id: newStudent._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  // Send OTP via email
  const otpMailOptions = {
    from: process.env.SMTP_EMAIL,
    to: newStudent.email,
    subject: "Access2edu Email Verification OTP",
    text: `Welcome ${newStudent.firstName},\n\nYour OTP for email verification is: ${OTP}\nThis OTP will expire in 15 minutes.`,
  };
  try {
    await transporter.sendMail(otpMailOptions);
  } catch (err) {
    return next(new Error("Failed to send OTP email"));
  }

  res.status(201).json({
    success: true,
    message: "Account created successfully. Please check your email for the OTP to verify your account.",
    newStudent,
  });
});


export const verifySignupOTPStudent = async (req, res, next) => {
  const { email, OTP } = req.body;

  if (!email || !OTP) {
    return next(new Error("E-mail and OTP are required"));
  }

  const normalizedEmail = email.toLowerCase();
  const student = await studentModel.findOne({ email: normalizedEmail });

  if (!student) {
    return next(new Error("Student not found"));
  }

  // Simulate valid OTP (for example, always use "123456" during developmen
  if (OTP !== "123456") {
    return next(new Error("Invalid OTP"));
  }

  student.isVerified = true;
  await student.save();

  res.status(200).json({
    success: true,
    message: "Signup successful, account verified",
  });
};


export const Login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    const error = new Error("All fields are required");
    error.statusCode = 400;
    return next(error);
  }

  const student = await studentModel.findOne({ email });
  if (!student) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 404;
    return next(error);
  }

  const isMatch = await student.comparePassword(password);
  if (!isMatch) {
    const error = new Error("Invalid Credentials");
    error.statusCode = 401;
    return next(error);
  }

  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });

  const hasSelectedClasses = student.classes && student.classes.length > 0;

  res.status(200).json({
    success: true,
    message: "Login successful",
    student,
    isNewStudent: !hasSelectedClasses,
  });
});

export const Logout = asyncHandler(async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    const error = new Error("You are not logged in");
    error.statusCode = 400;
    return next(error);
  }

  res.clearCookie("token", token, {
    httpOnly: true,
    sameSite: true,
    secure: process.env.NODE_ENV === "production",
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
});

export const updateStudent = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  if (!studentId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const student = await studentModel.findById(studentId);
  if (!student) {
    const error = new Error("Student not found");
    res.statusCode = 404;
    return next(error);
  }

  let uploadResult = { secure_url: "", public_id: "" }; // Default values

  if (req.file) {
    uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: "auto" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });
  }
  const studentToUpdate = await studentModel.findByIdAndUpdate(
    student._id,
    {
      $set: {
        firstName,
        lastName,
        otherName,
        parent_guardian,
        email,
        profilePicture: uploadResult.secure_url,
        cloudinary_id: uploadResult.public_id,
      },
    },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    success: true,
    message: "Profile update successful",
    studentToUpdate,
  });
});

export const deleteStudent = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  if (!studentId) {
    const error = new Error("Please Login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const student = await studentModel.findById(studentId);
  if (!student) {
    const error = new Error("Stuent not found");
    res.statusCode = 404;
    return next(error);
  }

  const studentToDelete = await studentModel.findByIdAndDelete(student._id);
  if (!studentToDelete) {
    const error = new Error("Student not found");
    res.statusCode = 404;
    return next(error);
  }
  res.status(200).json({
    success: true,
    message: "Student deleted successfully",
  });
});

export const fetchAllSubject = asyncHandler(async (req, res, next) => {
  const studentId = req.user._id;
  if (!studentId) {
    const error = new Error("Please login to continue");
    res.statusCode = 401;
    return next(error);
  }

  const page = parseInt(req.params.page);
  const limit = parseInt(req.params.limit);
  const skip = (page - 1) * limit;

  const student = await studentModel
    .findById(studentId)
    .populate("subjects")
    .skip(skip)
    .limit(limit);

  if (!student) {
    const error = new Error("Student not found");
    res.statusCode = 404;
    return next(error);
  }

  // const totalSubject = await subjectModel.countDocuments({
  //   level: { $regex: level, $options: "i" },
  //   level: student.level,
  // });

  // if (!totalSubject) {
  //   const error = new Error("No subject found");
  //   res.statusCode = 404;
  //   return next(error);
  // }

  // const subjects = await subjectModel
  //   .find({
  //     level: { $regex: level, $options: "i" },
  //     level: student.level,
  //   })
  //   .skip(skip)
  //   .limit(limit);

  if (student.subjects.length === 0) {
    const error = new Error("No more page available");
    res.statusCode = 404;
    return next(error);
  }

  if (!student.hasPaid) {
    const subjects = student.subjects.map((subject) => ({
      name: subject.name,
      className: subject.className,
      title: subject.title,
      description: subject.description,
    }));

    return res.status(200).json({
      page,
      limit,
      subjects,
    });
  }

  const Allsubjects = student.subjects.map((subject) => ({
    page,
    limit,
    name: subject.name,
    className: subject.className,
    title: subject.title,
    description: subject.description,
    videoUrl: subject.videoUrl,
  }));

  res.status(200).json({
    page,
    limit,
    Allsubjects,
  });
});

const flw = new Flutterwave(
  process.env.FLW_PUBLIC_KEY,
  process.env.FLW_SECRET_KEY
);

const createPaymentPayload = (email, paymentMethod) => {
  return {
    tx_ref: `STU-${Date.now()}`, 
    amount:"5000",
    currency: "NGN",
    redirect_url: `${process.env.FRONTEND_URL}/payment-success`, // Update with your frontend route 
    customer: { email },
    payment_options: paymentMethod, // "card", "bank_transfer", "googlepay", "applepay"
    customizations: {
      title: "School Payment",
      description: "Pay for video access",
    },
  };
};

// Initiate Payment (Flutterwave) using Axios
export const initiatePayment = async (req, res) => {
  try {
    const studentId = req.user._id;
    if (!studentId) {
      const error = new Error("Please login to continue");
      res.statusCode = 401;
      return next(error);
    }

    const { email, amount, paymentMethod } = req.body;
    const student = await studentModel.findById(studentId);

    if (!student) {
      const error = new Error("Student not found");
      res.statusCode = 404;
      return next(error);
    }

    const payload = createPaymentPayload(email, amount, paymentMethod);

    const response = await axios.post(
      "https://api.flutterwave.com/v3/charges?tx_ref=" + payload.tx_ref, 
      payload,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.status === "success") {
      res.json({
        message: "Payment initiated",
        paymentLink: response.data.data.link,
      });
    } else {
      res.status(400).json({ message: "Payment failed", error: response.data.message });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { transactionId, studentId } = req.body;

  
    const response = await axios.get(
      `https://api.flutterwave.com/v3/transactions/${transactionId}/verify`,
      {
        headers: {
          Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
        },
      }
    );

    if (response.data.status === "success" && response.data.data.status === "successful") {
      await studentModel.findByIdAndUpdate(studentId, { hasPaid: true });
      res.json({ message: "Payment successful! You can now access videos." });
    } else {
      res.status(400).json({ message: "Payment verification failed" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
