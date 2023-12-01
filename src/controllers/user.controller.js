const httpStatus = require('http-status');
const pick = require('../utils/pick');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { v4: uuidv4 } = require('uuid'); // Import the uuid package

const createUser = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body, 'updateUser');
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

const getSignedUrlForUploadFile = catchAsync(async (req, res) => {
  const { fileType } = req.query;

  // Generate a random UID for the file name
  const fileName = `${uuidv4()}.${fileType.split('/').pop()}`;

  console.log(fileName, fileType);

  const params = {
    Bucket: 'asktumi',
    Key: fileName,
    ContentType: fileType,
    Expires: 180, // URL expiration time in seconds
  };

  // Generate the pre-signed URL
  s3.getSignedUrl('putObject', params, (err, url) => {
    if (err) {
      console.error('Error generating pre-signed URL:', err);
      res.status(500).json({ error: 'Failed to generate pre-signed URL' });
    } else {
      res.json({ url });
    }
  });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getSignedUrlForUploadFile
};
