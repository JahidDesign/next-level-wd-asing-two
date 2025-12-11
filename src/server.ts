import dotenv from "dotenv";
import path from "path";


dotenv.config({ path: path.resolve(process.cwd(), ".env") });

import app from "./app";
import { config } from "./config/env";


const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Vehicle Rental API is running on http://localhost:${PORT}`);
});
