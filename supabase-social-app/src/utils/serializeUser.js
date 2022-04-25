const serializeUser = (user) =>
  user
    ? {
        id: user.id,
        email: user.email,
        ...user.user_metadata
      }
    : null

export default serializeUser
