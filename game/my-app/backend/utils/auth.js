const xss = require("xss");

function sanitizeInput(input) {
    if (typeof input === "string") {
        return xss(input); // Removes unsafe tags and attributes
    }
    return input;
}


module.exports = { sanitizeInput }; // CommonJS export
