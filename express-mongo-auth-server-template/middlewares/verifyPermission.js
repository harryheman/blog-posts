export const verifyPermission = async (req, res, next) => {
  const user = req.user

  if (!user) {
    return res.status(403).json({ message: 'User must be provided' })
  }

  if (!user.role || user.role !== 'ADMIN') {
    return res
      .status(403)
      .json({ message: 'Only admins can perform this action' })
  }

  next()
}
