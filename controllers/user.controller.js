const db = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Register user
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    try {
        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into the database
        db.query(
            "INSERT INTO Users (name, email, password) VALUES (?, ?, ?)",
            [name, email, hashedPassword],
            (err) => {
                if (err) {
                    if (err.code === 'ER_DUP_ENTRY') {
                        return res.status(400).json({ message: "Email already exists" });
                    }
                    return res.status(500).json({ message: "Database error", error: err });
                }
                res.status(201).json({ message: "User registered successfully" });
            }
        );
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
};

// Login user
exports.login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "All fields are required" });
    }

    // Fetch user from the database
    db.query(
        "SELECT * FROM Users WHERE email = ?",
        [email],
        async (err, results) => {
            if (err) return res.status(500).json({ message: "Database error", error: err });

            if (results.length === 0) {
                return res.status(404).json({ message: "User not found" });
            }

            const user = results[0];

            // Compare passwords
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: "Invalid credentials" });
            }

            // Generate JWT token
            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "1h" });

            res.json({ message: "Login successful", token });
        }
    );
};
