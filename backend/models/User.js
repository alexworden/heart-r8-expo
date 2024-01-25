class User {
  constructor(id, username, hashedPwd, nickname, createdAt) {
      this.id = id;
      this.username = username;
      this.hashedPwd = hashedPwd;
      this.nickname = nickname;
      this.createdAt = createdAt;
  }
}

module.exports = User;
