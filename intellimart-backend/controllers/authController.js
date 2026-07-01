const bcrypt = require('bcrypt');
const { User } = require('../models');

const register = async (req, res) => {
    try {

        const { full_name, email, password } = req.body;

        const existingUser = await User.findOne({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                message: 'Email sudah digunakan'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            full_name,
            email,
            password: hashedPassword
        });

        res.status(201).json({
            message: 'User berhasil dibuat',
            data: user
        });

    } catch (error) {

        res.status(500).json({
            message: error.message
        });

    }
};

module.exports = {
    register
};