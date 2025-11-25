const PassportLocal = require("passport-local");
const User = require('../../../modules/User/model');
const bcrypt = require('bcryptjs');

const LocalStrategy = PassportLocal.Strategy;

// Change the fields as per your requirement
const authFields = {
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true,
};

const passportLocalLoginStrategy = new LocalStrategy(authFields, async (req, email, password, cb) => {
    try {
        // Find the user by email or username
        const user = await User.findOne({
            $or: [{ email }, { username: email }]
        }).lean();

        // If user is not found or doesn't have a password, return an error
        if (!user || !user.password) {
            return cb(null, false, { message: 'Incorrect email or password.' });
        }

        // Compare the provided password with the hashed password in the database
        const isMatched = await bcrypt.compare(password, user.password);

        // If the password matches, return the user object, otherwise return an error
        if (isMatched) {
            return cb(null, user, { message: 'Logged In Successfully' });
        } else {
            return cb(null, false, { message: 'Invalid credentials' });
        }

    } catch (err) {
        return cb(null, false, { statusCode: 400, message: err.message });
    }
});

module.exports = passportLocalLoginStrategy;
