const express = require('express');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware configuration
app.use(session({
    secret: "fingerprint_customer",
    resave: false, // Should not resave the session if unmodified
    saveUninitialized: true, // Create a session even when uninitialized
    cookie: { secure: false } // Set to true if using https
}));

// Your authentication middleware
app.use("/customer/auth/*", function auth(req, res, next) {
    if (!req.session.user) {
        return res.status(403).json({ message: "Unauthorized access" });
    }
    next();
});

// Define routes
app.use("/customer", customer_routes);
app.use("/", genl_routes);

const PORT = 5001;
app.listen(PORT, () => console.log("Server is running"));
