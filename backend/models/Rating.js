class Rating {
  constructor(id, userId, subjectId, ratingValue, dontCare, dontKnow, createdAt, comment) {
      this.id = id;
      this.userId = userId;
      this.subjectId = subjectId;
      this.ratingValue = ratingValue;
      this.dontCare = dontCare;
      this.dontKnow = dontKnow;
      this.createdAt = createdAt;
      this.comment = comment;
  }
}

module.exports = Rating;
