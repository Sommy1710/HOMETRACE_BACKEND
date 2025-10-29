import {ConflictError, NotFoundError} from '../../lib/error-definitions.js';
import {Admin} from './admin.schema.js';

export const createAdmin = async(payload) =>
{
    //check if a record already exists with the user details
    const admin = await Admin.findOne({
        $or: [
            {email: payload.email},
            {username: payload.username}
        ]
    });
    if (admin) throw new ConflictError('an admin with the provided details already exixts');
    return await Admin.create(payload);
};

export const getAdmin = async(id) =>
{
    return await Admin.findById(id);
};

export const getAdminByEmail = async(email) =>
{
    return await Admin.findOne({email});
};

export const getAdminByRole = async(role) =>
{
    return await Admin.find({role});
};

export const deleteAdminById = async (adminId) => {
    const admin = await Admin.findById(adminId);
    if (!admin) {
        throw new NotFoundError('admin not found');
    }

    await admin.deleteOne();
    return {success: true, message: 'admin deleted successfully'};
};