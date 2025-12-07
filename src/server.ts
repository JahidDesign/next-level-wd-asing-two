import app from "./app";
import { config } from "./config/env";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`Vehicle Rental API is running on http://localhost:${PORT}`);
});
