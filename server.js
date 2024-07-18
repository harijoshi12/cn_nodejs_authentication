import app from "./src/app.js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Set the port for the server
const PORT = process.env.PORT || 3000;

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
