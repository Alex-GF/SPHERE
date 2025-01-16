import bcrypt from 'bcryptjs'

bcrypt.genSalt(5, function (err, salt) {
  if (err) console.error(`Gen salt error: ${err}`)

  bcrypt.hash('testing', salt, function (err, hash) {
    if (err) console.error(`Hash error: ${err}`)
    console.log(hash)
  })
})
