/**
 * User Model (Mongoose Schema)
 * ----------------------------
 * This schema defines the structure of user documents stored in MongoDB.
 * It includes secure password handling (salt + hash), role-based access
 * control fields, and a method for generating signed JWTs.
 */

const mongoose = require('mongoose');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * User Schema Definition
 * ----------------------
 * Fields:
 *  - email: Unique identifier for login
 *  - name: Display name
 *  - salt/hash: Secure password storage
 *  - role: Authorization role (default: user)
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
    },
    name: {
        type: String,
        required: true
    },
    hash: String,
    salt: String,

    /**
     * Role-Based Access Control (RBAC)
     * --------------------------------
     * The role field determines what actions a user can perform.
     * Allowed values:
     *   - 'user'  → Standard user with limited permissions
     *   - 'admin' → Elevated permissions for protected routes
     */
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true
    }
});

/**
 * setPassword(password)
 * ---------------------
 * Securely generates a random salt and hashes the password using PBKDF2.
 * This method is called during user registration.
 *
 * PBKDF2 parameters:
 *  - iterations: 1000
 *  - key length: 64 bytes
 *  - digest: sha512
 */
userSchema.methods.setPassword = function(password) {
    this.salt = crypto.randomBytes(16).toString('hex');
    this.hash = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        'sha512'
    ).toString('hex');
};

/**
 * validPassword(password)
 * -----------------------
 * Compares a provided password with the stored hash using the same
 * PBKDF2 parameters. Returns true if the password is valid.
 */
userSchema.methods.validPassword = function(password) {
    const hash = crypto.pbkdf2Sync(
        password,
        this.salt,
        1000,
        64,
        'sha512'
    ).toString('hex');

    return this.hash === hash;
};

/**
 * generateJWT()
 * -------------
 * Generates a signed JSON Web Token containing essential user information.
 * The token includes:
 *  - _id: User ID
 *  - email: User email
 *  - name: User name
 *  - role: User role (critical for RBAC)
 *
 * Token expires in 1 hour.
 */
userSchema.methods.generateJWT = function() {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            name: this.name,
            role: this.role // Required for role-based authorization
        },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

// Export Mongoose Model
const User = mongoose.model('users', userSchema);
module.exports = User;