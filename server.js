import app from "./app.js";
import {connectToDb} from "./src/db/connect.js";


const PORT = process.env.PORT;

if (!PORT) {
  console.error("Error: PORT is not defined in the environment variables.");
  process.exit(1);
}

const startServer = async () => {
    try {
        await connectToDb();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Error starting the server:", error);
        process.exit(1);
    }
};

await startServer();
