// Import your schemas here
import { type Connection } from 'mongoose';
import UserMongoose from '../../repositories/mongoose/models/UserMongoose';

export async function up(connection: Connection): Promise<void> {
  const User = connection.models.User || connection.model('User', UserMongoose.schema, 'users');

  await User.updateMany({}, [
    {
      $set: {
        role: {
          $cond: [{ $ifNull: ['$userType', false] }, { $toUpper: '$userType' }, '$$REMOVE'],
        },
      },
    },
    {
      $unset: 'userType',
    },
  ]);
}

export async function down(connection: Connection): Promise<void> {
  const User = connection.models.User || connection.model('User', UserMongoose.schema, 'users');

  await User.updateMany({}, [
    {
      $set: {
        userType: {
          $cond: [{ $ifNull: ['$role', false] }, { $toLower: '$role' }, '$$REMOVE'],
        },
      },
    },
    {
      $unset: 'role',
    },
  ]);
}
