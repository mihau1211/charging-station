import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../dev.env') });
import app from "./app";
import logger from "./utils/logger";

const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;

app.listen(port, () => {
    logger.info(`Server is running at port ${port}`);
});
