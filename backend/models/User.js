class User {
  constructor(id, username, hashedPwd, firstName, lastName, emailAddress, nickname, createdAt) {
      this.id = id;
      this.username = username;
      this.hashedPwd = hashedPwd;
      this.firstName = firstName;
      this.lastName = lastName;
      this.emailAddress = emailAddress;
      this.nickname = nickname;
      this.createdAt = createdAt;
  }

  toJSON() {
      return {
          id: this.id,
          username: this.username,
          // hashedPwd: this.hashedPwd,
          firstName: this.firstName,
          lastName: this.lastName,
          emailAddress: this.emailAddress,
          nickname: this.nickname,
          createdAt: this.createdAt
      }
  }
}

module.exports = User;
