const errorHandler = (error, req, res, next) => {
  console.error('Error:', error.message)
  res.status(error.statusCode || 500).json({
    message: error.message || 'something wrong',
    errors: error.errors || []
  })
}

module.exports = errorHandler
