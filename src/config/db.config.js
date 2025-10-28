import mongoose from 'mongoose';
import config from './app.config.js'

export const connectToDatabase = () => 
{
    let mongoUri;
    switch (config.environment)
    {
        case 'development':
            mongoUri = config.db.development;
            break;
        case 'test':
            mongoUri = config.db.test;
            break;
        case 'production':
            mongoUri = config.db.production;
            break;
        default:
            mongoUri = config.db.development;
            break;
    }
    console.log(mongoUri)

    mongoose.connect(mongoUri);
    mongoose.connection.on('open', () => 
    {
        console.log('connected to mongodb database instanse');
    })
    mongoose.connection.on('error', () => 
    {
        console.error.bind(console, 'mongodb connection error');

    })

}
