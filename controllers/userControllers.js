

exports.getAllUsers = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'all users'
  })
}

exports.createUser = (req, res) => {
  res.status(201).json({
    status: 'success',
    data: 'new user created',
  })
}

exports.getUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: 'user find'
  })
}

exports.updateUser = (req, res) => {
  res.status(200).json({
    status: 'success',
    data: {
      users: 'updated user'
    }
  })
}

exports.deletUser = (req, res) => {
  res.status(204).json({
    status: 'success',
    data: {
      users: null
    }
  })
}
