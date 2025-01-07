const User = require("../models/User")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { CustomError } = require("../middlewares/error")

const registerController = async (req, res, next) => {
    try {
        const { password, username, email } = req.body
        const existingUser = await User.findOne({ $or: [{ username }, { email }] })
        if (existingUser) {
            throw new CustomError("Username or email already exists!", 400)
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hashSync(password, salt)
        const newUser = new User({ ...req.body, password: hashedPassword })
        const savedUser = await newUser.save()
        res.status(201).json(savedUser)

    }
    catch (error) {
        next(error)
    }
}

const loginController = async (req, res, next) => {
    try {
        let user;
        if (req.body.email) {
            user = await User.findOne({ email: req.body.email })
        }
        else {
            user = await User.findOne({ username: req.body.username })
        }

        if (!user) {
            throw new CustomError("User not found!", 404)
        }

        const match = await bcrypt.compare(req.body.password, user.password)

        if (!match) {
            throw new CustomError("Wrong Credentials!", 401)
        }

        const { password, ...data } = user._doc
        const token = jwt.sign({ _id: user._id }, "Shibam@9064176535", { expiresIn: "1d" })
        res.cookie("token", token).status(200).json({
            user: data,
            jwt: token
        })

    }
    catch (error) {
        next(error)
    }
}

const logoutController = async (req, res, next) => {
    try {
        res.clearCookie("token", { sameSite: "none", secure: true }).status(200).json("user logged out successfully!")

    }
    catch (error) {
        next(error)
    }
}

const refetchUserController = async (req, res, next) => {
    try {
        const token = req.body.token;
        jwt.verify(token, "Shibam@9064176535", {}, async (err, data) => {
            if (err) {
                // Handle the JWT error without crashing the server
                return res.status(400).json({
                    message: "Invalid token", // You can customize the message here
                    error: err.message
                });
            }
            try {
                const id = data._id;
                const user = await User.findOne({ _id: id });
                if (!user) {
                    return res.status(404).json({
                        message: "User not found"
                    });
                }
                res.status(200).json(user);
            }
            catch (error) {
                next(error); // Pass to the next error handler
            }
        });
    } catch (error) {
        next(error); // Handle any other errors
    }
};


module.exports = {
    registerController, loginController,
    logoutController, refetchUserController
}