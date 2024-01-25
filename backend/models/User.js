class User {
  constructor(id, emailAddress, hashedPwd, firstName, lastName, emailAddress, nickname, createdAt) {
      this.id = id;
      this.emailAddress = emailAddress;
      this.hashedPwd = hashedPwd;
      this.firstName = firstName;
      this.lastName = lastName;
      this.emailAddress = emailAddress;
      this.nickname = nickname;
      this.createdAt = createdAt;
  }
}

module.exports = User;
