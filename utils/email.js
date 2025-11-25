const AWS = require('aws-sdk');
const Email  = require("../models/Email");
const { EMAIL_CONFIG } = require("./globals");

const AWS_SES = new AWS.SES();

class EmailUtil {
    /**
     * Sends an email.
     * @param {Object} options - Email options.
     * @param {String} options.email - Recipient email address.
     * @param {String} options.subject - Email subject.
     * @param {String} options.message - Email message body (HTML).
     * @param {String} [options.fromName] - Sender name (optional).
     * @returns {Promise<Object>}
     */
    static async sendEmail({ email, subject, message, fromName }) {
        try {
            if (process.env.NODE_ENV === 'development') {
                return { message: "Email skipped. Reason: Under development." };
            }

            if (!email) {
                return [];
            }

            const fromMail = `"${fromName || EMAIL_CONFIG.FROM_NAME}" <${EMAIL_CONFIG.DEFAULT_FROM_EMAIL}>`;
            const replyMail = `"${EMAIL_CONFIG.FROM_NAME} Support" <${EMAIL_CONFIG.SUPPORT_MAIL_ADDRESS}>`;

            const params = {
                Source: fromMail,
                Destination: {
                    ToAddresses: Array.isArray(email) ? email : [email],
                },
                ReplyToAddresses: [replyMail],
                Message: {
                    Body: {
                        Html: {
                            Charset: 'UTF-8',
                            Data: message,
                        },
                    },
                    Subject: {
                        Charset: 'UTF-8',
                        Data: subject,
                    },
                },
            };

            const response = await AWS_SES.sendEmail(params).promise();
            await EmailUtil.logEmail({ email, subject, message, fromName, response });
            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logs the email details to the database.
     * @param {Object} options - Email data to be logged.
     * @param {String} options.email - Recipient email address.
     * @param {String} options.subject - Email subject.
     * @param {String} options.message - Email message body (HTML).
     * @param {String} [options.fromName] - Sender name (optional).
     * @param {Object} options.response - Response from AWS SES.
     * @returns {Promise<Object>}
     */
    static async logEmail({ email, subject, message, fromName, response }) {
        try {
            const emailRecord = new Email({
                email,
                subject,
                message,
                fromName,
                response
            });
            return await emailRecord.save();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Sends an HTML email.
     * @param {Object} options - Email options.
     * @param {String} options.subject - Email subject.
     * @param {String} options.buttonName - Button text.
     * @param {String} options.buttonLink - Button link.
     * @param {Array<String>} options.messages - Array of message strings.
     * @param {String} options.email - Recipient email address.
     * @param {String} [options.fromName] - Sender name (optional).
     * @returns {Promise<Object>}
     */
    static async sendHTMLEmail({ subject, buttonName, buttonLink, messages, email, fromName }) {
        try {
            const message = `<!doctype html><html><head>
                <meta name="viewport" content="width=device-width" />
                <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
                <title>${subject}</title>
                <style>
                    /* Inline CSS styles here */
                </style></head><body>
                <span class="subject">${subject}</span>
                <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
                    <tr><td>&nbsp;</td><td class="container">
                        <div class="content">
                            <table role="presentation" class="main">
                                <tr><td class="wrapper">
                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                        <tr><td>${messages.map(m => `<p>${m}</p>`).join("")}
                                            ${buttonName ? `<table role="presentation" border="0" cellpadding="0" cellspacing="0" class="btn btn-primary">
                                                <tbody><tr><td align="left">
                                                    <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                                        <tbody><tr><td><a href="${buttonLink}" target="_blank">${buttonName}</a></td></tr>
                                                    </tbody></table></td></tr></tbody></table>` : ''}
                                        </td></tr>
                                    </table>
                                </td></tr>
                            </table>
                            <div class="footer">
                                <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                                    <tr><td class="content-block">
                                        <span class="apple-link">${EMAIL_CONFIG.FROM_NAME}</span>
                                    </td></tr>
                                    <tr><td class="content-block powered-by">
                                        &copy; ${new Date().getFullYear()} ${EMAIL_CONFIG.FROM_NAME}. All rights reserved.
                                    </td></tr>
                                </table>
                            </div>
                        </div>
                    </td><td>&nbsp;</td></tr>
                </table></body></html>`;

            if (email && subject) {
                return await EmailUtil.sendEmail({ email, subject, message, fromName });
            } else {
                return message;
            }
        } catch (error) {
            throw error;
        }
    }
}

module.exports = EmailUtil;
