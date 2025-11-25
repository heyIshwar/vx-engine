// Resource URLs - Configure via environment variables
const RESOURCE_URLS = {
    PLACEHOLDER_PHOTO: "https://picsum.photos/1080/720",
};

// Bucket Information - Configure via environment variables
const BUCKET_INFO = {
    // Configure via environment variables
};

// Email Configuration - Configure via environment variables
const EMAIL_CONFIG = {
    FROM_NAME: process.env.EMAIL_FROM_NAME || "VX Engine",
    NO_REPLY_USERNAME: "no-reply",
    NO_REPLY_NAME: "No Reply",
    SUPPORT_MAIL_ADDRESS: process.env.SUPPORT_EMAIL || "support@example.com",
    DEFAULT_FROM_EMAIL: process.env.EMAIL_FROM || "no-reply@example.com",
};

// System Roles
const SYSTEM_ROLES = {
    SUPER_ADMIN: 'System Super Admin',
    ADMIN: 'Admin',
    USER: 'User',
};

// Email Templates
const EMAIL_TEMPLATES = {
    FORGOT_PASSWORD: 'FORGOT_PASSWORD',
    SIGN_UP: 'SIGN_UP',
    REGISTER: 'REGISTER',
    EXCEPTION: 'EXCEPTION',
    USER_ACTIVITY: 'USER_ACTIVITY',
};

// Resource Possession Types
const RESOURCE_POSSESSION = {
    OWN: 'OWN',
    ANY: 'ANY',
    SUB: 'SUB'
};

// Header Keys
const HEADERS = {
    ACCESS_TOKEN: 'access-token',
    AUTH_TOKEN: 'Authorization',
};

// Device Types
const DEVICE_TYPE = {
    IOS_TYPE_ID: '00000000-0000-0000-0000-000000005002',
    ANDROID_TYPE_ID: '00000000-0000-0000-0000-000000005001',
};

// System Messages
const MESSAGES = {
    UNAUTHENTICATED_ERROR: 'Unauthenticated',
    UNAUTHORISED_ERROR: 'Permission denied',
    NO_RECORD_FOUND_ERROR: 'Record not found',
    DUPLICATE_RECORD_FOUND_ERROR: 'Duplicate record found',
    BAD_REQUEST_PARAMETER_ERROR: 'Bad request parameter',
    TOO_MANY_REQUESTS_ERROR: 'Too many requests',
    EMAIL_ADDRESS_NOT_VERIFIED: 'Email address not verified',
    ACCOUNT_BLOCKED: 'Sorry, your account is deactivated. Please contact administrator for more details',
    USER_NOT_EXISTS: 'User does not exist',
    USER_ALREADY_EXISTS: 'User with the given username or email or phone already exists',
    USER_PHONE_ALREADY_EXISTS: 'User with the given phone already exists',
    USER_EMAIL_ALREADY_EXISTS: 'User with the given email already exists',
    USER_PROFILE_PICTURE_ADDED: 'File uploaded successfully',
    USER_PROFILE_PICTURE_DELETED: 'File deleted successfully',
    LOGIN_ERROR_USER_ACCOUNT_DEACTIVATED: 'Sorry, your account is deactivated. Please contact administrator for more details',
    LOGIN_ERROR_USER_EMAIL_NOT_FOUND: 'Sorry, this email is not associated with us. Please enter a valid email address',
    LOGIN_ERROR_USER_SESSION_OVERRIDE: 'Sorry, your current session is expired as you are logged in on another device',
    LOGIN_ERROR_USER_ACCESS_TOKEN_INVALID: 'Sorry, you are not authorized. Please log in again to continue',
    ROLE_NOT_EXISTS: 'Role does not exist',
    ROLE_DELETE_SUCCESS: 'Role deleted successfully',
    USER_ATTACHED_TO_ROLE_ALREADY: 'There are users attached to this privilege. Please disassociate the users before deleting this role',
    ROLE_HIERARCHY_PRESENT: 'This role cannot be deleted. This role is a parent entity of other roles.',
    ROLE_ALREADY_EXISTS: 'Role with the given name already exists',
    TEMPLATE_NOT_EXISTS: 'Template does not exist',
    TEMPLATE_ALREADY_EXISTS: 'Template with the given name already exists',
    RESOURCE_ALREADY_EXISTS: 'Resource with the given name already exists',
    FORGOT_PASSWORD_SUCCESS: 'A temporary password is sent to your email address',
    RESEND_INVITATION_SUCCESS: 'Invitation sent successfully',
    FORGOT_PASSWORD_FAILURE_ACCOUNT_LOCKED: 'Sorry, your account is deactivated. Please contact administrator for more details',
    SET_PASSWORD_SUCCESS: 'Password has been changed successfully',
    RESET_PASSWORD_SUCCESS: 'Password has been reset successfully',
    CHANGE_PASSWORD_SUCCESS: 'Password has been changed successfully',
    CREATE_SUCCESS: 'Record created successfully.',
    UPDATE_SUCCESS: 'Record updated successfully.',
    DELETE_SUCCESS: 'Record soft-deleted successfully.',
    HARD_DELETE_SUCCESS: 'Record permanently deleted.',
    NOT_FOUND: 'Record not found.',
    INVALID_INPUT: 'Invalid input data.',
    AUTH_FAILED: 'Authentication failed. Invalid credentials.',
    ACCESS_DENIED: 'Access denied. You do not have permission to perform this action.',
    SERVER_ERROR: 'An internal server error occurred. Please try again later.',
    DUPLICATE_RECORD: 'A record with similar data already exists.',
    VALIDATION_ERROR: 'Validation error. Please check your input.',
    UNAUTHORIZED: 'Unauthorized access. Please login to continue.',
    FORBIDDEN: 'You do not have the necessary permissions to perform this action.',
    PASSWORD_RESET_SUCCESS: 'Password reset successfully.',
    PASSWORD_RESET_FAILED: 'Failed to reset password. Please try again.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    EMAIL_NOT_FOUND: 'No account found with that email address.',
    INVALID_TOKEN: 'Invalid or expired token.',
    PASSWORD_CHANGE_SUCCESS: 'Password changed successfully.',
    ACCOUNT_DEACTIVATED: 'Your account has been deactivated. Please contact support.',
    RECORD_EXISTS: 'A record with the same details already exists.',
};

module.exports = {
    RESOURCE_URLS,
    BUCKET_INFO,
    EMAIL_CONFIG,
    SYSTEM_ROLES,
    EMAIL_TEMPLATES,
    RESOURCE_POSSESSION,
    HEADERS,
    DEVICE_TYPE,
    MESSAGES,
};
