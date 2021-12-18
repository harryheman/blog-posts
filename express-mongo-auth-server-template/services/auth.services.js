import argon2 from 'argon2'
import { COOKIE_NAME } from '../config/index.js'
import User from '../models/User.js'

export const getUser = async (req, res, next) => {
  const userId = req.user?.userId

  if (!userId) {
    return res.status(400).json({ message: 'User ID must be provided' })
  }

  try {
    const user = await User.findById(userId).select(
      'id as userId username role'
    )

    req.user = user

    next('route')
  } catch (e) {
    console.log('*getUser service')
    next(e)
  }
}

export const registerUser = async (req, res, next) => {
  const username = req.body?.username
  const email = req.body?.email
  const password = req.body?.password
  const role = req.body?.role

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ message: 'Username, email and password must be provided' })
  }

  try {
    const [existingUser] = await User.find({
      $or: [{ username }, { email }]
    })

    if (existingUser) {
      return res
        .status(409)
        .json({ message: 'Username or email already in use' })
    }

    const hashedPassword = await argon2.hash(password)

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      role
    })

    req.user = { userId: newUser.id, username, role: newUser.role }

    next('route')
  } catch (e) {
    console.log('*registerUser service')
    next(e)
  }
}

export const loginUser = async (req, res, next) => {
  const usernameOrEmail = req.body?.usernameOrEmail
  const password = req.body?.password

  if (!usernameOrEmail || !password) {
    return res
      .status(400)
      .json({ message: 'Username or email and password must be provided' })
  }

  try {
    let user
    if (usernameOrEmail.includes('@')) {
      user = await User.findOne({ email: usernameOrEmail }).select('+password')
    } else {
      user = await User.findOne({ username: usernameOrEmail }).select(
        '+password'
      )
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const isPasswordCorrect = await argon2.verify(user.password, password)

    if (!isPasswordCorrect) {
      return res.status(403).json({ message: 'Wrong credentials' })
    }

    req.user = { userId: user.id, username: user.username, role: user.role }

    next('route')
  } catch (e) {
    console.log('*loginUser service')
    next(e)
  }
}

export const logoutUser = (req, res, next) => {
  res.clearCookie(COOKIE_NAME)
  res.status(200).json({ message: 'User has been logout' })
}

export const removeUser = async (req, res, next) => {
  const usernameOrEmail = req.body?.usernameOrEmail

  if (!usernameOrEmail) {
    return res
      .status(400)
      .json({ message: 'Username or email must be provided' })
  }

  try {
    let user
    if (usernameOrEmail.includes('@')) {
      user = await User.findOne({ email: usernameOrEmail })
    } else {
      user = await User.findOne({ username: usernameOrEmail })
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    await user.remove()

    res
      .status(200)
      .json({ message: `User ${usernameOrEmail} has been removed` })
  } catch (e) {
    console.log('*removeUser service')
    next(e)
  }
}
