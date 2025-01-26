const db = require('../models/user.model');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const register = async (req, res) => {
    try {
        const { name, email, password, age, phone } = req.body;

         if (!name || !email || !password || !age) {
                return res.status(400).json({ message: "All fields are required" });
            }

        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user into database
        const sql = 'INSERT INTO Users (name, email, password, age, phone) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [name, email, hashedPassword, age, phone], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Email already exists.' });
                }
                return res.status(500).json({ message: 'Database error.', error: err });
            }
            res.status(201).json({ message: 'User registered successfully.'});
        });
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
};

const login= async(req, res)=>{
    try {
        const {email, password}= req.body;

        if(!email || !password){
            return res.status(400).json({message: 'Email and password are required'});
        }

        const sql= 'SELECT * FROM Users WHERE email = ?';
        db.query(sql, [email], async(err, results)=>{
            if(err){
                return res.status(500).json({message: 'Database error'});
            }
            if(results.length==0){
                return res.status(404).json({message: 'user not found'});
            }

            const user= results[0];

            const isMatch= await bcrypt.compare(password, user.password);
            if(!isMatch){
                return res.status(401).json({message: 'Invalid credentials'});
            }

            const token= jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '1h'});
            res.status(200).json({message: 'User logged in successful', token});
        });
        
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
}

const fetchAllUsers = (req, res) => {
    try {
        const sql= 'SELECT id, name, email, age, phone FROM Users';
        db.query(sql, (err, results) => {
            if (err) {
                return res.status(500).json({ message: "Database error", error: err });
            }
            if (results.length === 0) {
                return res.status(404).json({ message: "No users found" });
            }
            res.status(200).json({message: 'Users fetched successfully', users:results});
        });
    } catch (error) {
        res.status(500).json({message: 'Internal server error'});
    }
};


module.exports= {register, login, fetchAllUsers};