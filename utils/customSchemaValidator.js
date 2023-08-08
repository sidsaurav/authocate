const schemaValidator = (userSchema) => {
  return (
    userSchema.obj.hasOwnProperty('email') &&
    userSchema.obj.email.hasOwnProperty('required') &&
    userSchema.obj.email.required &&
    userSchema.obj.hasOwnProperty('password') &&
    userSchema.obj.password.hasOwnProperty('required') &&
    userSchema.obj.password.required
  )
}

module.exports = schemaValidator
