const customError = (statusCode, message) => {
    return {
        statusCode,
        success: false,
        message,
    };
};

module.exports = customError;
