const jwt = require('jsonwebtoken');
require("dotenv").config({path: "./config/config.env"})
const {readFileSync} = require("fs");
const {createError} = require("http-errors")
const privateKEY = readFileSync(__dirname + "/" + "priv_key.pem", "utf8");
const publicKey = readFileSync(__dirname + "/" + "pub_key.pem", "utf8");

class JsonWebToken {
    /**
     *
     * @param {*} options JWT options
     */



    /**
     * Sign JWT token
     * @param {*} token Instance of Token class
     */
    sign(token) {
        return new Promise((resolve, reject) => {
            const signOptions = {
                issuer: "some1",
                expiresIn: token.exp,
                algorithm: "RS256", // RSASSA [ "RS256", "RS384", "RS512" ]
            };

            jwt.sign(token.payload, privateKEY, signOptions, function (err, token) {
                if (err) {
                    reject(err);
                } else {
                    resolve(token);
                }
            });
        })
    }

    signInRefreshToken(data) {
        return new Promise((resolve, reject) => {

            const signOptions = {
                issuer: "Some1",
                expiresIn: data.exp
            }
            jwt.sign(data.payload, process.env.refreshTokenSecret, signOptions, (err, token) => {
                if (err) {
                    return reject(createError.InternalServerError())
                } else {
                    resolve(token)
                }
            })

        })
    }

    /**
     * Verify JWT token
     * @param {} jwtToken JWT token in String format
     */
    verify(jwtToken) {
        return new Promise((resolve, reject) => {
            jwt.verify(jwtToken, process.env.refreshTokenSecret, function (err, decoded) {
                if (err) {
                    reject(err);
                } else {
                    resolve(decoded)
                }
            });
        })
    }
}

module.exports = JsonWebToken;