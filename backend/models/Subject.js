class Subject {
  constructor(id, title, imageUrl, description, createdAt, createdBy) {
      this.id = id;
      this.title = title;
      this.imageUrl = imageUrl;
      this.description = description;
      this.createdAt = createdAt;
      this.createdBy = createdBy; // user id
  }
}

module.exports = Subject;
