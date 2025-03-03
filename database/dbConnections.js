import mongoose from 'mongoose';

const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: 'PORTFOLIO',
    })
    .then(() => {
      console.log('Connected to Data base');
    })
    .catch((err) => {
      console.log(`Error Occured while connecting data base ${err}`);
    });
};

export default dbConnection;
