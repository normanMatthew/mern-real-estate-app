import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
const saltRounds = 10;

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });
    console.log(newUser);
    res.status(201).json({ message: "User created successfully." });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create user." });
  }
};

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    //   verify user exists
    const user = await prisma.user.findUnique({
        where:{username}
    })

    if (!user) return res.status(401).json({ message: "Invalid Credentials." });
    //   verify password is correct

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) return res.status(401).json({ message: "Invalid Credentials." });
    
    //   create cookie token and send to user

    // res.setHeader("Set-Cookie", "test=" + "myValue").json({ message: "Success" });
    const age = 1000 * 60 * 60 * 24 * 7

    const token = jwt.sign({
        id:user.id
    }, process.env.JWT_SECRET_KEY, {expiresIn: age});
    
    res.cookie("token", token, {
        httpOnly: true,
        // secure:true
        maxAge: age,
        // in production mode, make sure to uncomment "secure:true"
    })
    .status(200)
    .json({ message: "Login successful." });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to login." });
  }
};

export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({ message: "Logout Successful." })
};