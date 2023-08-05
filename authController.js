const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const loginUser = (JWT_SECRET_KEY) => async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: 'Please provide username and password' })
    }
    const foundUser = await req.User.findOne({ username })

    if (!foundUser) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, foundUser.password)

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    foundUser.password = undefined
    const token = jwt.sign({ ...foundUser._doc }, JWT_SECRET_KEY, {
      expiresIn: '1d',
    })
    foundUser.token = token
    return res
      .status(200)
      .json({ ...foundUser._doc, token, message: 'Logged in successfully!' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const getLoggedInUser = async (req, res) => {
  try {
    const loggedInUser = await req.User.findOne({
      username: req.userData.username,
    })
    loggedInUser.password = undefined

    return res.status(200).json(loggedInUser)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

const signupUser = (JWT_SECRET_KEY) => async (req, res) => {
  try {
    const username = req.body.username
    const password = req.body.password
    const email = req.body.email

    if (!username || !password) {
      return res.status(400).send('Please provide username and password')
    }

    const foundUser = await req.User.findOne({ username })
    if (foundUser) {
      return res.status(401).json({ error: 'User already exists' })
    }
    if (email) {
      const foundEmail = await req.User.findOne({ email })
      if (foundEmail) {
        return res.status(401).json({ error: 'Email already in use' })
      }
    }

    const hash = await bcrypt.hash(password, 10)
    req.body.password = hash
    const createdUser = await req.User.create(req.body)

    if (createdUser) {
      const token = jwt.sign({ username }, JWT_SECRET_KEY, {
        expiresIn: '1d',
      })
      createdUser.password = undefined
      return res.status(201).json({
        ...createdUser._doc,
        token,
        message: 'User created successfully!',
      })
    }
  } catch (err) {
    return res.status(401).json({ error: err.message })
  }
}

const updateUser = async (req, res) => {
  try {
    const loggedInUserID = req.userData._id

    let foundUser = await req.User.findById(loggedInUserID)

    if (!foundUser) {
      return res.status(404).json({
        error: 'User not found. Please contact the owner to get it resolved',
      })
    }

    if (req.body.hasOwnProperty('password')) {
      const hash = await bcrypt.hash(req.body.password, 10)
      req.body.password = hash
    }

    const updatedUser = await req.User.updateOne(
      { _id: loggedInUserID },
      { $set: { ...req.body } }
    )
    console.log(updatedUser)
    const newFoundUser = await req.User.findById(loggedInUserID)

    newFoundUser.password = undefined
    return res.status(200).json({
      ...newFoundUser._doc,
      message: 'User updated successfully!',
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

const logoutUser = async (req, res) => {
  res.json({ message: 'Stateless API. Handle in Client side' })
}

const getUserById = async (req, res) => {
  const ID = req.params.id
  const foundUser = await req.User.findById(ID)
  if (!foundUser) {
    return res.status(404).json({ error: 'User not found' })
  }
  foundUser.password = undefined
  return res.status(200).json(foundUser)
}

const getAllUsers = async (req, res) => {
  const users = await req.User.find()
  return res.status(200).json(users)
}

module.exports = {
  loginUser,
  logoutUser,
  signupUser,
  getLoggedInUser,
  getAllUsers,
  getUserById,
  updateUser,
}
